package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Global DB instance
var DB *gorm.DB

// InitDatabase connects to the DB and migrates tables
func InitDatabase() {
	// Load environment variables from .env file
	envVars := make(map[string]string)
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using system environment variables")
	} else {
		// Read .env file variables into a map for priority handling
		file, err := os.ReadFile(".env")
		if err == nil {
			lines := strings.Split(string(file), "\n")
			for _, line := range lines {
				if strings.Contains(line, "=") && !strings.HasPrefix(line, "#") {
					parts := strings.SplitN(line, "=", 2)
					if len(parts) == 2 {
						key := strings.TrimSpace(parts[0])
						value := strings.TrimSpace(parts[1])
						envVars[key] = value
					}
				}
			}
		}
	}

	var dsn string
	var connectionType string

	// Check if DATABASE_URL is provided (preferred method for Supabase)
	if databaseURL := getEnvFromFile("DATABASE_URL", "", envVars); databaseURL != "" {
		// Ensure SSL is enabled in DATABASE_URL
		if !strings.Contains(databaseURL, "sslmode=") {
			if strings.Contains(databaseURL, "?") {
				dsn = databaseURL + "&sslmode=require"
			} else {
				dsn = databaseURL + "?sslmode=require"
			}
		} else {
			dsn = databaseURL
		}

		// Determine connection type based on URL
		if strings.Contains(databaseURL, "pooler.supabase.com:6543") {
			connectionType = "Transaction Pooler"
		} else if strings.Contains(databaseURL, "pooler.supabase.com:5432") {
			connectionType = "Session Pooler"
		} else if strings.Contains(databaseURL, ".supabase.co:5432") {
			connectionType = "Direct Connection"
		} else {
			connectionType = "Custom"
		}

		fmt.Printf("🔗 Using DATABASE_URL for Supabase %s with SSL enforcement\n", connectionType)
	} else {
		// Fallback to individual parameters - prioritize .env file over system variables
		host := getEnvFromFile("POSTGRES_HOST", "aws-0-ap-south-1.pooler.supabase.com", envVars)
		user := getEnvFromFile("POSTGRES_USER", "postgres.lwghhgzhlyrourvbssjk", envVars)
		password := getEnvFromFile("POSTGRES_PASSWORD", "", envVars)
		dbname := getEnvFromFile("POSTGRES_DB", "postgres", envVars)
		port := getEnvFromFile("POSTGRES_PORT", "6543", envVars)

		if password == "" {
			log.Fatal("❌ POSTGRES_PASSWORD environment variable is required for Supabase connection")
		}

		// Determine connection type based on host and port
		if strings.Contains(host, "pooler.supabase.com") {
			if port == "6543" {
				connectionType = "Transaction Pooler (IPv4 compatible, no PREPARE statements)"
			} else if port == "5432" {
				connectionType = "Session Pooler (IPv4 compatible)"
			}
		} else if strings.Contains(host, ".supabase.co") {
			connectionType = "Direct Connection (IPv6 only, persistent)"
		} else {
			connectionType = "Custom Configuration"
		}

		// Build connection string optimized for the connection type
		if port == "6543" {
			// Transaction Pooler - optimized for stateless connections, no prepared statements
			dsn = fmt.Sprintf(
				"postgresql://%s:%s@%s:%s/%s?sslmode=require&prefer_simple_protocol=true&connect_timeout=10&pool_max_conns=10",
				user, password, host, port, dbname,
			)
		} else {
			// Direct or Session Pooler - can use more advanced features
			dsn = fmt.Sprintf(
				"postgresql://%s:%s@%s:%s/%s?sslmode=require&connect_timeout=10",
				user, password, host, port, dbname,
			)
		}

		fmt.Printf("🔗 Connecting to Supabase %s: %s@%s:%s/%s\n", connectionType, user, host, port, dbname)
	}

	// Set connection timeout and retry logic with better prepared statement handling
	dsn = fmt.Sprintf("%s&application_name=brocab_%d", dsn, time.Now().UnixNano())

	// Configure GORM based on connection type
	var gormConfig *gorm.Config
	if strings.Contains(connectionType, "Transaction Pooler") || strings.Contains(dsn, ":6543") {
		// Transaction Pooler doesn't support prepared statements
		gormConfig = &gorm.Config{
			PrepareStmt: false, // Required for Transaction Pooler
			Logger: logger.New(
				log.New(os.Stdout, "\r\n", log.LstdFlags),
				logger.Config{
					SlowThreshold: 2 * time.Second, // More lenient for pooled connections
					LogLevel:      logger.Warn,     // Reduce log noise
					Colorful:      true,
				},
			),
		}
	} else {
		// Direct or Session Pooler can use prepared statements
		gormConfig = &gorm.Config{
			PrepareStmt: true, // Can use prepared statements for better performance
			Logger: logger.New(
				log.New(os.Stdout, "\r\n", log.LstdFlags),
				logger.Config{
					SlowThreshold: time.Second,
					LogLevel:      logger.Info,
					Colorful:      true,
				},
			),
		}
	}

	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		log.Printf("❌ First connection attempt failed: %v", err)
		log.Println("🔄 Retrying connection in 2 seconds...")
		time.Sleep(2 * time.Second)

		// Retry once more
		db, err = gorm.Open(postgres.Open(dsn), gormConfig)
		if err != nil {
			log.Fatal("❌ Failed to connect to Supabase database after retry:", err)
		}
	}

	// Test the connection
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("❌ Failed to get database instance:", err)
	}

	// Configure connection pool settings based on connection type
	if strings.Contains(connectionType, "Transaction Pooler") {
		// Optimized for stateless, short-lived connections - maximum capacity
		sqlDB.SetMaxOpenConns(200)                // Maximum for Transaction Pooler
		sqlDB.SetMaxIdleConns(50)                 // High idle connections for quick reuse
		sqlDB.SetConnMaxLifetime(5 * time.Minute) // Optimal lifetime for pooled connections
		sqlDB.SetConnMaxIdleTime(1 * time.Minute) // Quick cleanup of unused connections
	} else {
		// Optimized for persistent connections - maximum capacity
		sqlDB.SetMaxOpenConns(500)                 // Maximum for direct connections
		sqlDB.SetMaxIdleConns(100)                 // High idle pool for performance
		sqlDB.SetConnMaxLifetime(30 * time.Minute) // Longer lifetime for persistent connections
		sqlDB.SetConnMaxIdleTime(10 * time.Minute) // Reasonable idle timeout
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatal("❌ Failed to ping Supabase database:", err)
	}
	DB = db
	fmt.Printf("✅ Supabase database connected successfully via %s!\n", connectionType)

	// Run migrations for all tables with error suppression for prepared statement conflicts
	err = db.AutoMigrate(
		&User{},
		&Ride{},
		&Request{},
		&Participant{},
		&Notification{},
	)
	if err != nil {
		// Check if it's just a table already exists error or prepared statement conflict
		if strings.Contains(err.Error(), "already exists") ||
			strings.Contains(err.Error(), "prepared statement") {
			fmt.Println("ℹ️  Tables already exist or migration completed with cache conflicts, continuing...")
		} else {
			log.Fatal("❌ Failed to migrate database:", err)
		}
	} else {
		fmt.Println("✅ Database tables migrated successfully!")
	}
}

// getEnvFromFile prioritizes .env file over system environment variables
func getEnvFromFile(key, defaultVal string, envVars map[string]string) string {
	// First check .env file variables
	if value, exists := envVars[key]; exists && value != "" {
		return value
	}
	// Then check system environment variables
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	// Finally return default value
	return defaultVal
}

// SafeQuery executes a GORM query with retry logic for prepared statement conflicts
func SafeQuery(queryFunc func() error) error {
	err := queryFunc()

	// If we get a prepared statement conflict, retry once with a brief delay
	if err != nil && strings.Contains(err.Error(), "prepared statement") {
		time.Sleep(10 * time.Millisecond)
		err = queryFunc()
	}

	return err
}

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
)

// Global DB instance
var DB *gorm.DB

// InitDatabase connects to the DB and migrates tables
func InitDatabase() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using system environment variables")
	}

	var dsn string

	// Check if DATABASE_URL is provided (preferred method for Supabase)
	if databaseURL := os.Getenv("DATABASE_URL"); databaseURL != "" {
		dsn = databaseURL
		fmt.Println("🔗 Using DATABASE_URL for Supabase connection")
	} else {
		// Fallback to individual parameters
		host := getEnv("POSTGRES_HOST", "aws-0-ap-south-1.pooler.supabase.com")
		user := getEnv("POSTGRES_USER", "postgres.lwghhgzhlyrourvbssjk")
		password := getEnv("POSTGRES_PASSWORD", "")
		dbname := getEnv("POSTGRES_DB", "postgres")
		port := getEnv("POSTGRES_PORT", "6543")

		if password == "" {
			log.Fatal("❌ POSTGRES_PASSWORD environment variable is required for Supabase connection")
		}
	// Supabase connection string with SSL
		dsn = fmt.Sprintf(
			"postgresql://%s:%s@%s:%s/%s?sslmode=require",
			user, password, host, port, dbname,
		)

		fmt.Printf("🔗 Connecting to Supabase database: %s@%s:%s/%s\n", user, host, port, dbname)
	}

	// Set connection timeout and retry logic
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("❌ First connection attempt failed: %v", err)
		log.Println("🔄 Retrying connection in 2 seconds...")
		time.Sleep(2 * time.Second)

		// Retry once more
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatal("❌ Failed to connect to Supabase database after retry:", err)
		}
	}

	// Test the connection
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("❌ Failed to get database instance:", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatal("❌ Failed to ping Supabase database:", err)
	}

	DB = db
	fmt.Println("✅ Supabase database connected successfully!")

	// Run migrations for all tables (ignore if tables already exist)
	err = db.AutoMigrate(
		&User{},
		&Ride{},
		&Request{},
		&Participant{},
		&Notification{},
	)
	if err != nil {
		// Log the error but don't fail if tables already exist
		log.Printf("⚠️  Migration warning: %v", err)

		// Check if this is just a "table already exists" error
		if !isTableExistsError(err.Error()) {
			log.Fatal("❌ Failed to migrate database:", err)
		}
		fmt.Println("ℹ️  Some tables already exist, continuing...")
	} else {
		fmt.Println("✅ Database tables migrated successfully!")
	}
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

// isTableExistsError checks if the error is related to an existing table
func isTableExistsError(errMsg string) bool {
	// Check for common "table already exists" error messages
	return strings.Contains(errMsg, "already exists") ||
		strings.Contains(errMsg, "relation") && strings.Contains(errMsg, "already exists")
}

package main

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Global DB instance
var DB *gorm.DB

// InitDatabase connects to the DB and migrates tables
func InitDatabase() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		getEnv("POSTGRES_HOST", "localhost"),
		getEnv("POSTGRES_USER", "postgres"),
		getEnv("POSTGRES_PASSWORD", "password"),
		getEnv("POSTGRES_DB", "brocab"),
		getEnv("POSTGRES_PORT", "5432"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	DB = db
	fmt.Println("✅ Database connected!")

	// Run migrations for all tables
	err = db.AutoMigrate(
		&User{},
		&Ride{},
		&Request{},
		&Participant{},
		&Notification{},
	)
	if err != nil {
		log.Fatal("❌ Failed to migrate database:", err)
	}

	fmt.Println("✅ Database migrated!")
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

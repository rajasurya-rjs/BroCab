package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Initialize Firebase Admin SDK (for token verification)
	err = InitFirebase()
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}

	r := gin.Default()

	// Public route example
	r.GET("/public", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "This is a public endpoint"})
	})

	// Protected routes (require authentication)
	protected := r.Group("/")
	protected.Use(FirebaseAuthMiddleware())

	// User APIs
	protected.POST("/user", CreateUser)                       // POST /user
	protected.GET("/user/:userID", GetUserBasic)              // GET /user/:userID
	protected.GET("/user/rides/posted", GetRidesPostedByUser) // GET /user/rides/posted
	protected.GET("/user/rides/joined", GetRidesJoinedByUser) // GET /user/rides/joined

	// Ride APIs
	protected.POST("/ride", AddRide)                     // POST /ride
	protected.GET("/ride/:rideID/leader", GetRideLeader) // GET /ride/:rideID/leader
	protected.GET("/ride/:rideID/users", GetUsersInRide) // GET /ride/:rideID/users

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("🚀 Brocab server running on port %s", port)
	r.Run(":" + port)
}

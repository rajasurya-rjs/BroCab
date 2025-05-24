package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

var firebaseApp *firebase.App
var authClient *auth.Client

// Initialize Firebase Admin SDK
func InitFirebase() error {
	// Try to get credentials file path from environment variable
	credentialsPath := os.Getenv("FIREBASE_CREDENTIALS_PATH")

	// If not set, try the default location outside the project
	if credentialsPath == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return fmt.Errorf("error getting home directory: %v", err)
		}
		credentialsPath = filepath.Join(homeDir, "credentials", "brocab-1c545-firebase-adminsdk-fbsvc-e3e6893c15.json")
	}

	// Check if the credentials file exists
	if _, err := os.Stat(credentialsPath); os.IsNotExist(err) {
		return fmt.Errorf("Firebase credentials file not found at: %s. Please set FIREBASE_CREDENTIALS_PATH environment variable or place the file in ~/credentials/", credentialsPath)
	}

	opt := option.WithCredentialsFile(credentialsPath)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return fmt.Errorf("error initializing firebase app: %v", err)
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		return fmt.Errorf("error getting Auth client: %v", err)
	}

	firebaseApp = app
	authClient = client
	fmt.Printf("✅ Firebase initialized with credentials from: %s\n", credentialsPath)
	return nil
}

// Middleware to verify Firebase token
func FirebaseAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		// Format: "Bearer <token>"
		idToken := strings.TrimPrefix(authHeader, "Bearer ")
		if idToken == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		// Verify token
		token, err := authClient.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Store UID in context
		c.Set("uid", token.UID)
		c.Next()
	}
}

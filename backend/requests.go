package main

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Request struct {
	ID        uint      `gorm:"primaryKey"`
	RideID    uint      `gorm:"not null"`
	UserID    string    `gorm:"not null"`
	Status    string    `gorm:"not null"`     // "pending", "approved", or "revoked"
	RevokedAt time.Time `gorm:"default:null"` // Used to check re-join cooldown
	CreatedAt time.Time
	UpdatedAt time.Time
}

// POST /ride/:rideID/join
func SendJoinRequest(c *gin.Context) {
	rideIDStr := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID := c.MustGet("uid").(string)

	// Check if a request already exists
	var existing Request
	if err := DB.Where("ride_id = ? AND user_id = ?", rideID, userID).First(&existing).Error; err == nil {
		if existing.Status == "pending" {
			c.JSON(http.StatusConflict, gin.H{"error": "Request already pending"})
			return
		}
		if existing.Status == "approved" {
			c.JSON(http.StatusConflict, gin.H{"error": "Already approved for this ride"})
			return
		}
		if existing.Status == "revoked" {
			// Check if 30 minutes have passed since revocation
			timeSinceRevoked := time.Since(existing.RevokedAt)
			cooldownPeriod := 30 * time.Minute

			if timeSinceRevoked < cooldownPeriod {
				remainingTime := cooldownPeriod - timeSinceRevoked
				remainingMinutes := int(remainingTime.Minutes())
				c.JSON(http.StatusConflict, gin.H{
					"error":                      fmt.Sprintf("Request was revoked. Please wait %d more minutes before resending.", remainingMinutes+1),
					"remaining_cooldown_minutes": remainingMinutes + 1,
				})
				return
			}
			// Cooldown period has passed, allow new request by deleting the old revoked record
			if err := DB.Delete(&existing).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear old request"})
				return
			}
		}
	}

	// Create new join request
	request := Request{
		RideID: uint(rideID),
		UserID: userID,
		Status: "pending",
	}

	if err := DB.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create join request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Join request sent"})
}

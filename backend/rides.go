package main

import (
	"time"

	"net/http"

	"github.com/gin-gonic/gin"
)

type Ride struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	LeaderID    uint      `json:"leader_id"`
	Origin      string    `json:"origin"`
	Destination string    `json:"destination"`
	Date        string    `json:"date"` // e.g. "2025-05-20"
	Time        string    `json:"time"` // e.g. "15:30"
	Seats       int       `json:"seats"`
	SeatsFilled int       `json:"seats_filled"`
	Price       float64   `json:"price"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// POST /ride
func AddRide(c *gin.Context) {
	var ride Ride

	if err := c.ShouldBindJSON(&ride); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	ride.LeaderID = userID.(uint)

	if _, err := time.Parse("15:04", ride.Time); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format, expected HH:mm"})
		return
	}

	if _, err := time.Parse("2006-01-02", ride.Date); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, expected YYYY-MM-DD"})
		return
	}

	ride.SeatsFilled = 0

	if err := DB.Create(&ride).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save ride: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ride added successfully", "ride": ride})
}

// GET /user/rides/posted
func GetRidesPostedByUser(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	var rides []Ride
	if err := DB.Where("leader_id = ?", userID).Find(&rides).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rides"})
		return
	}

	c.JSON(http.StatusOK, rides)
}

// GET /user/rides/joined
func GetRidesJoinedByUser(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	var participants []Participant
	if err := DB.Where("user_id = ? AND is_approved = true", userID).Find(&participants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participant data"})
		return
	}

	rideIDs := make([]uint, 0, len(participants))
	for _, p := range participants {
		rideIDs = append(rideIDs, p.RideID)
	}

	var rides []Ride
	if err := DB.Where("id IN ?", rideIDs).Find(&rides).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rides"})
		return
	}

	c.JSON(http.StatusOK, rides)
}

package main

import (
	"fmt"
	"time"

	"net/http"
	"strconv"

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

	userID, exists := c.Get("uid")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Convert Firebase UID (string) to find the user's ID
	user, err := getUser(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	ride.LeaderID = user.ID

	if _, err := time.Parse("15:04", ride.Time); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format, expected HH:mm"})
		return
	}

	if _, err := time.Parse("2006-01-02", ride.Date); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, expected YYYY-MM-DD"})
		return
	}

	// Check if user has sent any join requests on the same date
	var existingRequestCount int64
	if err := DB.Table("requests").
		Joins("JOIN rides ON requests.ride_id = rides.id").
		Where("requests.user_id = ? AND rides.date = ? AND requests.status IN ?",
			userID.(string), ride.Date, []string{"pending", "approved"}).
		Count(&existingRequestCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing requests"})
		return
	}

	if existingRequestCount > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "You cannot create a ride and send join requests on the same day. You have already sent requests for rides on " + ride.Date,
		})
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
	userID := c.MustGet("uid").(string)

	user, err := getUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var rides []Ride
	if err := DB.Where("leader_id = ?", user.ID).Find(&rides).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rides"})
		return
	}

	c.JSON(http.StatusOK, rides)
}

// GET /user/rides/joined
func GetRidesJoinedByUser(c *gin.Context) {
	userID := c.MustGet("uid").(string)

	// Find all rides where user is actually a participant (not just approved)
	var participants []Participant
	if err := DB.Where("user_id = ?", userID).Find(&participants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participant data"})
		return
	}

	rideIDs := make([]uint, 0, len(participants))
	for _, p := range participants {
		rideIDs = append(rideIDs, p.RideID)
	}

	var rides []Ride
	if len(rideIDs) > 0 {
		if err := DB.Where("id IN ?", rideIDs).Find(&rides).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rides"})
			return
		}
	}

	c.JSON(http.StatusOK, rides)
}

// GET /rides/filter?origin=College Campus&destination=City Airport&date=2025-06-10
func FilterRides(c *gin.Context) {
	origin := c.Query("origin")
	destination := c.Query("destination")
	date := c.Query("date")

	var rides []Ride

	// Use SafeQuery to handle potential prepared statement conflicts9AM
	err := SafeQuery(func() error {
		return DB.Where("origin = ? AND destination = ? AND date = ?", origin, destination, date).Find(&rides).Error
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rides"})
		return
	}

	c.JSON(http.StatusOK, rides)
}

// GET /rides/:rideID/requests
func GetJoinRequestsForRide(c *gin.Context) {
	rideIDParam := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID := c.MustGet("uid").(string)

	var ride Ride
	if err := DB.First(&ride, "id = ?", rideID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	user, err := getUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if ride.LeaderID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the leader of this ride"})
		return
	}

	var requests []Request
	if err := DB.Where("ride_id = ? AND status = ?", rideID, "pending").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch join requests"})
		return
	}

	// Build response with request details
	var response []map[string]interface{}
	for _, r := range requests {
		user, err := getUser(r.UserID)
		if err != nil {
			continue // skip if user doesn't exist
		}

		entry := map[string]interface{}{
			"request_id": r.ID,
			"name":       user.Name,
			"gender":     user.Gender,
			"status":     r.Status,
		}
		response = append(response, entry)
	}

	c.JSON(http.StatusOK, response)
}

// DELETE /ride/:rideID - Leader deletes their own ride
func DeleteRide(c *gin.Context) {
	rideIDParam := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID := c.MustGet("uid").(string)

	// Get the ride to be deleted
	var ride Ride
	if err := DB.First(&ride, "id = ?", rideID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	// Get current user to verify they are the leader
	user, err := getUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if the current user is the leader of this ride
	if ride.LeaderID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the leader of this ride"})
		return
	}

	// Get all participants to notify them
	var participants []Participant
	if err := DB.Where("ride_id = ?", rideID).Find(&participants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participants"})
		return
	}

	// Start a transaction to ensure data consistency
	tx := DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Delete all related data in the correct order to avoid foreign key constraints

	// 1. Delete all notifications related to this ride
	if err := tx.Where("ride_id = ?", rideID).Delete(&Notification{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete ride notifications"})
		return
	}

	// 2. Delete all participants
	if err := tx.Where("ride_id = ?", rideID).Delete(&Participant{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete participants"})
		return
	}

	// 3. Delete all join requests
	if err := tx.Where("ride_id = ?", rideID).Delete(&Request{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete join requests"})
		return
	}

	// 4. Finally delete the ride itself
	if err := tx.Delete(&ride).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete ride"})
		return
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// Send notifications to all participants about the ride cancellation
	title := "Ride Cancelled by Leader"
	message := fmt.Sprintf("The ride from %s to %s on %s at %s has been cancelled by the leader %s",
		ride.Origin, ride.Destination, ride.Date, ride.Time, user.Name)

	notificationCount := 0
	for _, participant := range participants {
		if err := createNotification(participant.UserID, title, message, "ride_cancelled", uint(rideID)); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to create notification for participant %s: %v\n", participant.UserID, err)
		} else {
			notificationCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":               fmt.Sprintf("Ride deleted successfully. %d participants have been notified.", notificationCount),
		"participants_notified": notificationCount,
		"ride_id":               rideID,
	})
}

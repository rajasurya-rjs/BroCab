package main

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// Participant represents users who have actually joined a ride (approved and confirmed)
type Participant struct {
	ID        uint      `gorm:"primaryKey"`
	RideID    uint      `gorm:"not null"`
	UserID    string    `gorm:"not null" json:"-"` // Firebase UID - hidden from JSON
	JoinedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// GET /ride/:rideID/participants - Get all participants in a ride with leader-specific details
func GetRideParticipants(c *gin.Context) {
	rideIDParam := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID := c.MustGet("uid").(string)

	// Check if the ride exists
	var ride Ride
	if err := DB.First(&ride, "id = ?", rideID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	// Get current user to check if they are the leader
	currentUser, err := getUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	isLeader := ride.LeaderID == currentUser.ID

	// Fetch all participants for the ride
	var participants []Participant
	if err := DB.Where("ride_id = ?", rideID).Find(&participants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participants"})
		return
	}

	// Build response with participant details (phone number only for leaders)
	var response []map[string]interface{}
	for _, p := range participants {
		user, err := getUser(p.UserID)
		if err != nil {
			continue // skip if user doesn't exist
		}

		entry := map[string]interface{}{
			"participant_id": p.ID,
			"name":           user.Name,
			"gender":         user.Gender,
			"joined_at":      p.JoinedAt,
		}

		// Only include phone number if the current user is the ride leader
		if isLeader {
			entry["phone"] = user.Phone
		}

		response = append(response, entry)
	}

	c.JSON(http.StatusOK, response)
}

// DELETE /ride/:rideID/participant/:participantID
func RemoveParticipant(c *gin.Context) {
	rideIDParam := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	participantIDParam := c.Param("participantID")
	participantID, err := strconv.Atoi(participantIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid participant ID"})
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

	var participant Participant
	if err := DB.Where("id = ? AND ride_id = ?", participantID, rideID).First(&participant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Participant not found in this ride"})
		return
	}

	if err := DB.Delete(&participant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove participant"})
		return
	}

	if err := DB.Model(&ride).Update("seats_filled", ride.SeatsFilled-1).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ride seats"})
		return
	}

	// Send notification to the removed participant
	title := "Removed from Ride"
	message := fmt.Sprintf("You have been removed from the ride from %s to %s on %s at %s",
		ride.Origin, ride.Destination, ride.Date, ride.Time)
	if err := createNotification(participant.UserID, title, message, "participant_removed", uint(rideID)); err != nil {
		// Log error but don't fail the request
		fmt.Printf("Failed to create notification: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Participant removed successfully"})
}

// POST /ride/:rideID/approve/:requestID - Approve a join request (gives user privilege to join)
func ApproveJoinRequest(c *gin.Context) {
	rideIDParam := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	requestIDParam := c.Param("requestID")
	requestID, err := strconv.Atoi(requestIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	userID := c.MustGet("uid").(string)

	// Check if the user is the leader of this ride
	var ride Ride
	if err := DB.First(&ride, "id = ?", rideID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	// Get user to find their ID for comparison
	user, err := getUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if ride.LeaderID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the leader of this ride"})
		return
	}

	// Find the join request
	var request Request
	if err := DB.Where("id = ? AND ride_id = ? AND status = ?", requestID, rideID, "pending").First(&request).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Join request not found or already processed"})
		return
	}

	// Update request status to approved (gives privilege to join)
	if err := DB.Model(&request).Update("status", "approved").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve request"})
		return
	}

	// Send notification to the approved user
	title := "Join Request Approved"
	message := fmt.Sprintf("Your request to join the ride from %s to %s on %s at %s has been approved. You can now join the ride!",
		ride.Origin, ride.Destination, ride.Date, ride.Time)
	if err := createNotification(request.UserID, title, message, "request_approved", uint(rideID)); err != nil {
		// Log error but don't fail the request
		fmt.Printf("Failed to create notification: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Join request approved - user can now join the ride"})
}

// POST /ride/:rideID/reject/:requestID - Reject a join request
func RejectJoinRequest(c *gin.Context) {
	rideIDParam := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	requestIDParam := c.Param("requestID")
	requestID, err := strconv.Atoi(requestIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	userID := c.MustGet("uid").(string)

	// Check if the user is the leader of this ride
	var ride Ride
	if err := DB.First(&ride, "id = ?", rideID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	// Get user to find their ID for comparison
	user, err := getUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if ride.LeaderID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the leader of this ride"})
		return
	}

	// Find the join request
	var request Request
	if err := DB.Where("id = ? AND ride_id = ? AND status = ?", requestID, rideID, "pending").First(&request).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Join request not found or already processed"})
		return
	}

	// Update request status to revoked and set revoked timestamp
	if err := DB.Model(&request).Updates(map[string]interface{}{
		"status":     "revoked",
		"revoked_at": time.Now(),
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Join request rejected"})
}

// GET /user/privileges - Get all approved ride privileges for the authenticated user
func GetUserPrivileges(c *gin.Context) {
	userID := c.MustGet("uid").(string)

	var requests []Request
	if err := DB.Where("user_id = ? AND status = ?", userID, "approved").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch privileges"})
		return
	}

	var response []map[string]interface{}
	for _, req := range requests {
		var ride Ride
		if err := DB.First(&ride, "id = ?", req.RideID).Error; err != nil {
			continue
		}

		seatsAvailable := ride.SeatsFilled < ride.Seats

		entry := map[string]interface{}{
			"request_id":      req.ID,
			"ride_id":         ride.ID,
			"origin":          ride.Origin,
			"destination":     ride.Destination,
			"date":            ride.Date,
			"time":            ride.Time,
			"price":           ride.Price,
			"seats_available": ride.Seats - ride.SeatsFilled,
			"total_seats":     ride.Seats,
			"can_join":        seatsAvailable,
			"approved_at":     req.UpdatedAt,
		}
		response = append(response, entry)
	}

	c.JSON(http.StatusOK, response)
}

// POST /ride/:rideID/join-ride - User joins a ride using their privilege
func JoinRideWithPrivilege(c *gin.Context) {
	rideIDParam := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID := c.MustGet("uid").(string)

	// Check if user has approved privilege for this ride
	var request Request
	if err := DB.Where("ride_id = ? AND user_id = ? AND status = ?", rideID, userID, "approved").First(&request).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have privilege to join this ride"})
		return
	}

	var ride Ride
	if err := DB.First(&ride, "id = ?", rideID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	if ride.SeatsFilled >= ride.Seats {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ride is full - no seats available"})
		return
	}

	var existingParticipant Participant
	if err := DB.Where("ride_id = ? AND user_id = ?", rideID, userID).First(&existingParticipant).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You are already a participant in this ride"})
		return
	}

	if err := DB.Where("user_id = ? AND status = ?", userID, "approved").Delete(&Request{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear other privileges"})
		return
	}

	// Create participant record
	participant := Participant{
		RideID:   uint(rideID),
		UserID:   userID,
		JoinedAt: time.Now(),
	}

	if err := DB.Create(&participant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join ride"})
		return
	}

	// Increase seats filled count
	if err := DB.Model(&ride).Update("seats_filled", ride.SeatsFilled+1).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ride seats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully joined the ride! All other privileges have been cleared.",
		"ride_id": rideID,
	})
}

// DELETE /user/cancel-ride/:rideID - Unified function to cancel either pending request or participation
func CancelRideParticipation(c *gin.Context) {
	rideIDParam := c.Param("rideID")
	rideID, err := strconv.Atoi(rideIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID := c.MustGet("uid").(string)

	// First check if user has a pending request
	var pendingRequest Request
	if err := DB.Where("ride_id = ? AND user_id = ? AND status = ?", rideID, userID, "pending").First(&pendingRequest).Error; err == nil {
		// User has a pending request - cancel it (no notification needed)
		if err := DB.Delete(&pendingRequest).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel request"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Join request cancelled successfully",
			"type":    "request_cancelled",
		})
		return
	}

	// Check if user is actually a participant
	var participant Participant
	if err := DB.Where("ride_id = ? AND user_id = ?", rideID, userID).First(&participant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "You have no involvement with this ride"})
		return
	}

	// User is a participant - proceed with cancellation and notify leader
	var ride Ride
	if err := DB.First(&ride, "id = ?", rideID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	// Get the cancelling user's details
	cancellingUser, err := getUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get the ride leader's details
	leader, err := getUser(ride.LeaderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride leader not found"})
		return
	}

	// Remove participant from ride
	if err := DB.Delete(&participant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel ride participation"})
		return
	}

	// Update seats filled count
	if err := DB.Model(&ride).Update("seats_filled", ride.SeatsFilled-1).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ride seats"})
		return
	}

	// Send notification to the ride leader
	title := "Participant Cancelled"
	message := fmt.Sprintf("%s has cancelled their participation in your ride from %s to %s on %s at %s",
		cancellingUser.Name, ride.Origin, ride.Destination, ride.Date, ride.Time)
	if err := createNotification(leader.FirebaseUID, title, message, "participant_cancelled", uint(rideID)); err != nil {
		// Log error but don't fail the request
		fmt.Printf("Failed to create notification: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully cancelled your participation in the ride",
		"type":    "participation_cancelled",
	})
}

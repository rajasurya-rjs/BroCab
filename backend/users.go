package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type User struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Email       string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Phone       string    `gorm:"type:varchar(15);not null" json:"phone"`
	Gender      string    `gorm:"type:varchar(10)" json:"gender,omitempty"`
	FirebaseUID string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"firebase_uid"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func getUser(uid interface{}) (*User, error) { //
	var user User
	switch v := uid.(type) {
	case string:
		if err := DB.Where("firebase_uid = ?", v).First(&user).Error; err != nil {
			return nil, err
		}
	case uint:
		if err := DB.First(&user, v).Error; err != nil {
			return nil, err
		}
	default:
		return nil, fmt.Errorf("invalid uid type")
	}
	return &user, nil
}

// Request body struct for creating user
type CreateUserRequest struct {
	Name   string `json:"name" binding:"required"`
	Email  string `json:"email" binding:"required,email"`
	Phone  string `json:"phone" binding:"required"`
	Gender string `json:"gender"`
}

// POST /user
func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	firebaseUID, exists := c.Get("firebaseUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	db := DB

	var user User
	result := db.Where("firebase_uid = ?", firebaseUID).First(&user)
	if result.Error == nil {
		c.JSON(http.StatusOK, user)
		return
	}
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	newUser := User{
		Name:        req.Name,
		Email:       req.Email,
		Phone:       req.Phone,
		Gender:      req.Gender,
		FirebaseUID: firebaseUID.(string),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := db.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, newUser)
}

// GET /user/:userID
func GetUserBasic(c *gin.Context) {
	userID := c.Param("userID")

	user, err := getUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	response := struct {
		Name   string `json:"name"`
		Gender string `json:"gender"`
	}{
		Name:   user.Name,
		Gender: user.Gender,
	}

	c.JSON(http.StatusOK, response)
}

// GET /ride/:rideID/leader
func GetRideLeader(c *gin.Context) {
	rideID := c.Param("rideID")

	var ride Ride
	if err := DB.First(&ride, "id = ?", rideID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	var leader User
	if err := DB.First(&leader, "firebase_uid = ?", ride.LeaderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Leader not found"})
		return
	}

	response := struct {
		Name        string `json:"name"`
		Gender      string `json:"gender"`
		PhoneNumber string `json:"phone"`
	}{
		Name:        leader.Name,
		Gender:      leader.Gender,
		PhoneNumber: leader.Phone,
	}

	c.JSON(http.StatusOK, response)
}

// GET /ride/:rideID/users
func GetUsersInRide(c *gin.Context) {
	rideID := c.Param("rideID")

	var participants []Participant
	if err := DB.Where("ride_id = ?", rideID).Find(&participants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participants"})
		return
	}

	type UserResponse struct {
		Name   string `json:"name"`
		Gender string `json:"gender"`
	}

	var users []UserResponse

	for _, p := range participants {
		user, err := getUser(p.UserID)
		if err != nil {
			continue // skip user if not found
		}

		users = append(users, UserResponse{
			Name:   user.Name,
			Gender: user.Gender,
		})
	}

	c.JSON(http.StatusOK, users)
}

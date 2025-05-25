# BroCab - Ride Sharing Platform

BroCab is a comprehensive ride-sharing platform designed to connect drivers and passengers for convenient and cost-effective travel. The platform facilitates coordination between users who plan to travel the same route, allowing them to share rides and split costs.

## Overview

BroCab consists of two main components:

1. **Backend**: Written in Go using the Gin framework, handling API requests, authentication, and database operations.
2. **Frontend**: Built with React, providing a responsive user interface for all platform functionalities.

## Key Features

- **User Authentication**: Secure login and signup using Firebase
- **Ride Management**: Create, join, and manage rides
- **Real-time Notifications**: Get updates on ride requests and approvals
- **Privilege System**: A unique feature that streamlines the ride-joining process

## Privilege System Explained

The privilege system in BroCab is a unique feature designed to make the ride-joining process more efficient while ensuring ride leaders maintain control over who joins their rides.

### What Are Privileges?

Privileges are special permissions granted to users by ride leaders. When a user requests to join a ride, the leader can approve this request, which grants the user a "privilege" to join the ride at their convenience.

### How The Privilege System Works

1. **Request Phase**:
   - User finds a ride they're interested in and sends a join request
   - The ride leader receives the request notification

2. **Approval Phase**:
   - The ride leader can approve the request, granting a privilege
   - This approval does NOT automatically add the user to the ride
   - The privilege is stored in the system

3. **Join Phase**:
   - Users with privileges can view all their approved rides in the "My Privilege" section
   - When ready to commit to the ride, they use their privilege to officially join
   - Once a privilege is used to join a ride, any other privileges for the same date are cleared

### Benefits of the Privilege System

- **Flexibility for Passengers**: Users can request to join multiple rides for the same route and decide later which one to actually join
- **Control for Leaders**: Leaders can pre-approve passengers without immediately filling seats
- **Reduced Last-Minute Cancellations**: Users commit to rides only when they're certain about their plans

### Using the Privilege System

#### As a Passenger:

1. **Find Available Rides**:
   - Navigate to the Dashboard
   - Search for rides by origin, destination, and date
   - Browse available rides that match your criteria

2. **Request to Join**:
   - Click on a ride card to view details
   - Click "Request to Join" button
   - Wait for the ride leader to respond

3. **View Your Privileges**:
   - Navigate to "My Privilege" from the navbar
   - See all rides where leaders have approved your join requests
   - Check available seats and other ride details

4. **Use a Privilege to Join**:
   - On the Privileges page, locate the ride you want to join
   - Click "Use Privilege to Join" button
   - Confirm your decision (this will clear other privileges for the same date)

#### As a Ride Leader:

1. **Create a Ride**:
   - Navigate to "Post Ride" from the navigation menu
   - Fill in origin, destination, date, time, available seats, and price details
   - Submit the ride listing

2. **Manage Join Requests**:
   - Review incoming requests from the notification center
   - For each request, you can:
     - Approve (granting a privilege)
     - Reject (declining the request)

3. **View Ride Participants**:
   - Check who has used their privileges to join your ride
   - Manage seats and monitor the booking status

### Important Notes

- You cannot request to join rides on dates when you've created a ride yourself
- Once you use a privilege to join a ride, all other privileges for the same date are automatically cleared
- There is a cooldown period after a request is rejected before you can request the same ride again
- Ride leaders can remove participants if necessary

## Getting Started

### Prerequisites

- Go 1.16+
- Node.js 14+
- Firebase account
- PostgreSQL or other supported database

### Setup and Installation

1. Clone the repository
2. Set up the backend:
   ```
   cd backend
   go mod tidy
   ```
3. Set up the frontend:
   ```
   cd Frontend
   npm install
   ```
4. Configure your Firebase credentials in both frontend and backend
5. Start the services:
   - Backend: `go run .` in the backend directory
   - Frontend: `npm start` in the Frontend directory

## Project Structure

- `/backend`: Go backend API
- `/Frontend`: React frontend application

## Contact and Support

For questions, issues, or feature suggestions, please use the "Contact Us" section in the application.
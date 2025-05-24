# BroCab Setup Instructions

## Firebase Credentials Setup

To run this application, you need to set up Firebase credentials securely:

### Option 1: Default Location (Recommended)
1. Place your Firebase credentials file in: `~/credentials/brocab-1c545-firebase-adminsdk-fbsvc-e3e6893c15.json`
2. The application will automatically find it there

### Option 2: Custom Location
1. Set the environment variable: `export FIREBASE_CREDENTIALS_PATH=/path/to/your/firebase-credentials.json`
2. The application will use the specified path

## Running the Application

### Backend (Go)
```bash
cd backend
go run .
```

### Frontend (React)
```bash
npm install
npm run dev
```

## Security Notes
- Firebase credentials are NOT stored in git repository
- Credentials file should be kept secure and not shared publicly
- Use environment variables in production environments
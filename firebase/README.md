# Firebase Authentication and Firestore Integration

This directory contains the Firebase configuration and utilities for FundLoop. The implementation includes:

1. Firebase Authentication for email/password and Google Sign-in
2. Firestore Database for storing user profile data
3. Error handling utilities for Firebase operations

## Setup Instructions

### 1. Firebase Console Configuration

Make sure your Firebase project has the following services enabled:

- **Authentication**: Enable Email/Password and Google Sign-in providers
- **Firestore Database**: Create a database in test mode initially

### 2. Security Rules

Copy the security rules from `firestore.rules` to your Firebase Console:

1. Go to Firestore Database in your Firebase Console
2. Click on the "Rules" tab
3. Replace the existing rules with the content from `firestore.rules`
4. Click "Publish"

These rules ensure that:

- Users can only read and write their own data
- Only authenticated users can create user documents
- All other access is denied by default

### 3. Google Sign-In Configuration

For Google Sign-in to work properly:

#### For Android:

1. Add your SHA-1 fingerprint to your Firebase project
2. Download the updated `google-services.json` file and place it in the `android/app/` directory

#### For iOS:

1. Download the `GoogleService-Info.plist` file from Firebase Console
2. Add it to your Xcode project

#### For Web:

The web client ID is already configured in the AuthContext.

## Usage

The Firebase integration is used through the AuthContext:

```typescript
import { useAuth } from "@/contexts/AuthContext";

// In your component
const { user, signInWithEmail, signInWithGoogle, signUp, signOut } = useAuth();

// Sign in with email/password
await signInWithEmail(email, password);

// Sign in with Google
await signInWithGoogle();

// Sign up with email/password
await signUp(
  name,
  email,
  password,
  phoneNumber,
  dateOfBirth,
  tradingExperience
);

// Sign out
await signOut();
```

## Files Overview

- `config.ts`: Firebase initialization and configuration
- `userService.ts`: Firestore operations for user data
- `errorHandler.ts`: User-friendly error messages for Firebase errors
- `test.ts`: Test script to verify Firebase configuration
- `firestore.rules`: Security rules for Firestore Database

## Troubleshooting

If you encounter any issues:

1. **Authentication Errors**: Check that your Firebase Authentication providers are properly enabled
2. **Firestore Permission Errors**: Verify that your security rules are published correctly
3. **Google Sign-In Issues**: Ensure your OAuth client IDs are correctly configured in the Firebase Console

For more detailed Firebase documentation, visit:

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)

/**
 * Firebase initialization module
 * This module initializes all Firebase services and should be imported early in the app lifecycle
 */

// First import the core config
import { app, auth, db, storage } from './config';

// Then import other services that depend on the core config
import { initializeAnalytics } from './analyticsUtils';

// Re-export everything for easier imports elsewhere
export { 
  app,
  auth, 
  db, 
  storage,
  initializeAnalytics
};

// Explicitly initialize analytics
initializeAnalytics().catch(error => {
  console.error("Failed to initialize analytics from index:", error);
});

// Export a function to initialize all Firebase services if needed
export const initializeFirebase = async () => {
  try {
    // Here you can add any additional initialization logic
    console.log("Firebase services initialized");
    return true;
  } catch (error) {
    console.error("Error initializing Firebase services:", error);
    return false;
  }
}; 
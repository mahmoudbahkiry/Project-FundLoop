import { User, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './config';

/**
 * Utility functions for Firebase Authentication
 * This file provides helper functions for working with Firebase Auth
 * and ensures proper persistence across platforms
 */

// Key for storing user data in AsyncStorage
const USER_STORAGE_KEY = 'fundloop_user_data';

/**
 * Save user data to AsyncStorage for persistence
 * @param user Firebase User object
 */
export const saveUserToStorage = async (user: any) => {
  if (!user) return;
  
  try {
    // Extract only the data we need to store
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: user.providerId || (user.providerData && user.providerData[0]?.providerId),
      lastLoginAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    console.log('User data saved to AsyncStorage');
  } catch (error) {
    console.error('Error saving user to AsyncStorage:', error);
  }
};

/**
 * Retrieve user data from AsyncStorage
 * @returns User data object or null if not found
 */
export const getUserFromStorage = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user from AsyncStorage:', error);
    return null;
  }
};

/**
 * Clear user data from AsyncStorage
 */
export const clearUserFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    console.log('User data cleared from AsyncStorage');
  } catch (error) {
    console.error('Error clearing user from AsyncStorage:', error);
  }
};

/**
 * Setup auth state listener that syncs with AsyncStorage
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const setupAuthStateListener = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in, save to AsyncStorage
      await saveUserToStorage(user);
      // Call the callback with the user
      callback(user);
    } else {
      // User is signed out
      // Check if user data still exists in AsyncStorage
      const storedUser = await getUserFromStorage();
      
      if (!storedUser) {
        // Only call the callback if there's no user in AsyncStorage
        // This prevents double logout when signOut() is called directly
        callback(null);
      }
      // Note: We don't clear AsyncStorage here anymore
      // That's now handled directly in the signOut function
    }
  });
};

/**
 * Check if user is authenticated by checking both Firebase Auth and AsyncStorage
 * @returns Promise that resolves to a boolean indicating if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  // First check Firebase Auth current user
  if (auth.currentUser) {
    return true;
  }
  
  // If no current user in Firebase Auth, check AsyncStorage
  const storedUser = await getUserFromStorage();
  return !!storedUser;
};

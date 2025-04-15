import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useTheme } from './ThemeContext';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { saveUserData, getUserData, UserData } from '../firebase/userService';
import { getFirebaseErrorMessage } from '../firebase/errorHandler';
import { 
  setupAuthStateListener, 
  saveUserToStorage, 
  clearUserFromStorage,
  isAuthenticated
} from '../firebase/authUtils';


interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  tradingExperience?: string;
  occupation?: string;
  authType: 'email';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoginAttemptInProgress: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetLoginAttempt: () => void;
  signUp: (
    firstName: string,
    lastName: string,
    email: string, 
    password: string,
    phoneNumber?: string,
    dateOfBirth?: Date,
    tradingExperience?: string,
    occupation?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginAttemptInProgress, setIsLoginAttemptInProgress] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    // Set up auth state listener with our utility function
    const unsubscribe = setupAuthStateListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log("Auth state changed: User is signed in with UID:", firebaseUser.uid);
          
          // Get user data from Firestore
          const userData = await getUserData(firebaseUser.uid);
          
          if (userData) {
            console.log("User data found in Firestore");
            
            // Use data from Firestore
            const user: User = {
              uid: firebaseUser.uid,
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              phoneNumber: userData.phoneNumber,
              dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth : undefined,
              tradingExperience: userData.tradingExperience,
              occupation: userData.occupation,
              authType: 'email',
            };
            
            // Store user in AsyncStorage with dateOfBirth as ISO string
            const userForStorage = {
              ...user,
              // Convert Date to ISO string for storage
              dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : undefined
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(userForStorage));
            setUser(user);
            
            console.log("User data saved to state and AsyncStorage");
          } else {
            console.log("No user data found in Firestore, using basic info");
            
            // Fallback to basic user info if Firestore data not available
            const displayName = firebaseUser.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            const user: User = {
              uid: firebaseUser.uid,
              firstName: firstName,
              lastName: lastName,
              email: firebaseUser.email || '',
              authType: 'email',
            };
            
            setUser(user);
            
            console.log("Saving basic user data to Firestore");
            
            // Save basic user data to Firestore
            await saveUserData({
              uid: firebaseUser.uid,
              firstName: firstName,
              lastName: lastName,
              email: user.email,
              authType: 'email',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user info
          const displayName = firebaseUser.displayName || '';
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          const user: User = {
            uid: firebaseUser.uid,
            firstName: firstName,
            lastName: lastName,
            email: firebaseUser.email || '',
            authType: 'email',
          };
          
          setUser(user);
        }
      } else {
        console.log("Auth state changed: No user is signed in");
        // No user is signed in, check AsyncStorage as fallback
        await loadStoredUser();
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const loadStoredUser = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      // Check if there's a stored user in AsyncStorage
      if (userString) {
        // If Firebase says no user but AsyncStorage has one, 
        // we might be in an inconsistent state
        if (!auth.currentUser) {
          // Double-check with our utility function
          const isStillAuthenticated = await isAuthenticated();
          if (!isStillAuthenticated) {
            // If not authenticated according to our utility, clear storage
            await clearUserFromStorage();
            setUser(null);
            return;
          }
        }
        
        // Parse the stored user data
        const storedUser = JSON.parse(userString);
        
        // Convert dateOfBirth from ISO string back to Date object if it exists
        if (storedUser.dateOfBirth) {
          try {
            storedUser.dateOfBirth = new Date(storedUser.dateOfBirth);
          } catch (e) {
            console.error('Error converting dateOfBirth to Date object:', e);
            // Keep the original value if conversion fails
          }
        }
        
        setUser(storedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setIsLoginAttemptInProgress(false);
    }
  };

  const resetLoginAttempt = () => {
    setIsLoginAttemptInProgress(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      // Set login attempt in progress at the beginning
      setIsLoginAttemptInProgress(true);
      setLoading(true);
      
      console.log("Starting sign-in process with email:", email);
      
      // Attempt to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log("Firebase user authenticated with UID:", firebaseUser.uid);
      
      // Get user data from Firestore
      const userData = await getUserData(firebaseUser.uid);
      
      if (userData) {
        console.log("User data retrieved from Firestore");
        
        // Use data from Firestore
        const user: User = {
          uid: firebaseUser.uid,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth : undefined,
          tradingExperience: userData.tradingExperience,
          occupation: userData.occupation,
          authType: 'email',
        };
        
        // Store user in AsyncStorage with dateOfBirth as ISO string
        const userForStorage = {
          ...user,
          // Convert Date to ISO string for storage
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : undefined
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(userForStorage));
        setUser(user);
        
        console.log("User data saved to AsyncStorage and state");
      } else {
        console.log("No user data found in Firestore, using basic info");
        
        // Fallback to basic user info if Firestore data not available
        const displayName = firebaseUser.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || email.split('@')[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        const user: User = {
          uid: firebaseUser.uid,
          firstName: firstName,
          lastName: lastName,
          email: firebaseUser.email || email,
          authType: 'email',
        };
        
        console.log("Saving basic user data to Firestore");
        
        // Save basic user data to Firestore
        await saveUserData({
          uid: firebaseUser.uid,
          firstName: firstName,
          lastName: lastName,
          email: user.email,
          authType: 'email',
        });
        
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      }
      
      // Login successful, reset the login attempt flag
      setIsLoginAttemptInProgress(false);
      console.log("Sign-in completed successfully");
    } catch (error) {
      console.error('Email sign-in error:', error);
      
      // No longer automatically resetting isLoginAttemptInProgress
      // It will remain true until explicitly reset by the login component
      
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const signUp = async (
    firstName: string,
    lastName: string,
    email: string, 
    password: string,
    phoneNumber?: string,
    dateOfBirth?: Date,
    tradingExperience?: string,
    occupation?: string
  ) => {
    try {
      setLoading(true);
      console.log("Starting signup process with data:", {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        tradingExperience,
        occupation
      });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user profile with the full name
      const fullName = `${firstName} ${lastName}`;
      await updateProfile(firebaseUser, {
        displayName: fullName
      });
      
      console.log("Firebase user created with UID:", firebaseUser.uid);
      
      // Create user object with additional data
      const user: User = {
        uid: firebaseUser.uid,
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        tradingExperience,
        occupation,
        authType: 'email',
      };
      
      console.log("Saving user data to Firestore with additional fields");
      
      // Save user data to Firestore
      await saveUserData({
        uid: firebaseUser.uid,
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        tradingExperience,
        occupation,
        authType: 'email',
      });
      
      // Store user in AsyncStorage
      const userForStorage = {
        ...user,
        // Convert Date to ISO string for storage
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userForStorage));
      setUser(user);
      
      console.log("User signup completed successfully");
    } catch (error) {
      console.error('Sign-up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // First clear user data from AsyncStorage to prevent race conditions
      await clearUserFromStorage();
      
      // Then set local state to null
      setUser(null);
      
      // Finally sign out from Firebase
      await firebaseSignOut(auth);
      
      // Set theme to light mode when user logs out
      setTheme('light');
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoginAttemptInProgress,
        signInWithEmail,
        resetLoginAttempt,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// Interface for user data
export interface UserData {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  tradingExperience?: string;
  authType: 'email';
  // Personal information
  nationality?: string;
  address?: string;
  // Financial information
  employmentStatus?: string;
  employerName?: string;
  monthlyIncome?: string;
  netWorth?: string;
  sourceOfFunds?: string;
  // Timestamps
  createdAt?: any;
  updatedAt?: any;
}

// Create or update user data in Firestore
export const saveUserData = async (userData: UserData): Promise<void> => {
  const userRef = doc(db, "users", userData.uid);
  
  try {
    console.log("Saving user data to Firestore:", JSON.stringify(userData, null, 2));
    
    // Create a new object with all fields explicitly defined
    // This ensures all fields are properly saved to Firestore
    const userDataToSave = {
      uid: userData.uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      authType: userData.authType,
      // Required fields
      phoneNumber: userData.phoneNumber,
      // Convert Date object to Firestore timestamp
      dateOfBirth: userData.dateOfBirth instanceof Date ? Timestamp.fromDate(userData.dateOfBirth) : null,
      // Optional fields - use "Not Specified" as default
      tradingExperience: userData.tradingExperience || "Not Specified",
      // Personal information
      nationality: userData.nationality || "Not Specified",
      address: userData.address || "Not Specified",
      // Financial information
      employmentStatus: userData.employmentStatus || "Not Specified",
      employerName: userData.employerName || "Not Specified",
      monthlyIncome: userData.monthlyIncome || "Not Specified",
      netWorth: userData.netWorth || "Not Specified",
      sourceOfFunds: userData.sourceOfFunds || "Not Specified",
    };
    
    console.log("Formatted user data for Firestore:", JSON.stringify(userDataToSave, null, 2));
    
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userDataToSave,
        updatedAt: serverTimestamp(),
      });
      console.log("Updated existing user in Firestore");
    } else {
      // Create new user
      await setDoc(userRef, {
        ...userDataToSave,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Created new user in Firestore");
    }
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userRef = doc(db, "users", uid);
  
  try {
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log("Retrieved user data from Firestore:", JSON.stringify(userData, null, 2));
      
      // Convert dateOfBirth from Firestore Timestamp to Date object if it exists
      if (userData.dateOfBirth && userData.dateOfBirth.toDate) {
        try {
          userData.dateOfBirth = userData.dateOfBirth.toDate();
        } catch (e) {
          console.error("Error converting dateOfBirth Timestamp to Date object:", e);
          // Keep the original value if conversion fails
        }
      }
      
      return userData as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

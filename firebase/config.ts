import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDsN_6srxPCIUSnaN6GIAnAfQx0iGsvn9U",
  authDomain: "fundloop-95918.firebaseapp.com",
  projectId: "fundloop-95918",
  storageBucket: "fundloop-95918.firebasestorage.app",
  messagingSenderId: "30774331836",
  appId: "1:30774331836:web:920ab438a38b2c9a7703b9",
  measurementId: "G-C72EPDF3N8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Set up persistence based on platform
if (Platform.OS === 'web') {
  // For web platform, use browserLocalPersistence
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Error setting auth persistence for web:", error);
    });
} else {
  // For native platforms (iOS, Android), AsyncStorage is used by default
  // Firebase will automatically use the appropriate persistence mechanism
  console.log("Using native persistence for Firebase Auth");
}

const db = getFirestore(app);
const storage = getStorage(app);

// Note: Analytics initialization is now handled separately in analyticsUtils.ts
// This removes the circular dependency

export { auth, db, storage };

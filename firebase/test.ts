import { auth, db } from './config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

console.log('Firebase Configuration Test');
console.log('==========================');

// Test Firebase Authentication
console.log('\nTesting Firebase Authentication...');
const unsubscribe = onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ User is signed in:', user.uid);
  } else {
    console.log('✅ Firebase Auth initialized successfully. No user is currently signed in.');
  }
});

// Test Firestore
console.log('\nTesting Firestore...');
const testFirestore = async () => {
  try {
    // Try to get a collection to verify Firestore connection
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    console.log(`✅ Successfully connected to Firestore. Found ${snapshot.size} users.`);
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Firestore:', error);
    return false;
  }
};

// Run tests and provide summary
(async () => {
  const firestoreSuccess = await testFirestore();
  
  console.log('\nTest Summary');
  console.log('===========');
  console.log('Firebase Authentication: ✅ Initialized');
  console.log(`Firestore Database: ${firestoreSuccess ? '✅ Connected' : '❌ Failed'}`);
  
  // Cleanup
  unsubscribe();
  console.log('\nTest completed.');
})();

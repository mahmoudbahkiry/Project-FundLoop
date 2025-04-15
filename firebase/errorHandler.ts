// Helper function to get user-friendly error messages for Firebase errors
export const getFirebaseErrorMessage = (error: any): string => {
  const errorCode = error.code;
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please try another email or sign in.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Please contact support.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/invalid-credential':
      return 'The authentication credential is invalid. Please try again.';
    case 'auth/invalid-verification-code':
      return 'The verification code is invalid. Please try again.';
    case 'auth/invalid-verification-id':
      return 'The verification ID is invalid. Please try again.';
    case 'auth/missing-verification-code':
      return 'Please provide a verification code.';
    case 'auth/missing-verification-id':
      return 'Please provide a verification ID.';
    case 'auth/quota-exceeded':
      return 'Quota exceeded. Please try again later.';
    case 'auth/timeout':
      return 'The operation has timed out. Please try again.';
    case 'auth/web-storage-unsupported':
      return 'Web storage is not supported or is disabled. Please enable cookies.';
    default:
      return 'An error occurred. Please try again later.';
  }
};

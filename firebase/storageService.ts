import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload an image to Firebase Storage
 * @param uri Local URI of the image
 * @param path Storage path where the image should be stored
 * @returns Promise resolving to the download URL of the uploaded image
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    // Convert the image to a blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a reference to the storage location
    const storageRef = ref(storage, path);
    
    // Upload the blob
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('Image uploaded successfully');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Image download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Get the download URL for an image in Firebase Storage
 * @param path Storage path of the image
 * @returns Promise resolving to the download URL of the image
 */
export const getImageURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
}; 
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  limit
} from "firebase/firestore";
import { db } from "./config";

// Interface for journal entry
export interface JournalEntry {
  id?: string; // Made optional since we'll use documentId as the primary identifier
  userId: string;
  date: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  notes?: string;
  hasScreenshot: boolean;
  createdAt?: any;
  updatedAt?: any;
  documentId?: string; // Store Firestore document ID for updates/deletes
}

// Calculate P/L based on trade details
export const calculateProfitLoss = (
  type: 'buy' | 'sell',
  entryPrice: number,
  exitPrice: number,
  quantity: number
): { pnl: number; pnlPercent: number } => {
  let pnl: number;
  if (type === 'buy') {
    pnl = (exitPrice - entryPrice) * quantity;
  } else {
    pnl = (entryPrice - exitPrice) * quantity;
  }
  
  const pnlPercent = type === 'buy' 
    ? ((exitPrice - entryPrice) / entryPrice) * 100
    : ((entryPrice - exitPrice) / entryPrice) * 100;
  
  return { pnl, pnlPercent };
};

// Add a new journal entry
export const addJournalEntry = async (userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'documentId'>): Promise<string> => {
  try {
    const journalCollection = collection(db, "journalEntries");
    
    const entryData = {
      userId,
      ...entry,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(journalCollection, entryData);
    
    // Update the entry with the document ID for future reference
    await updateDoc(docRef, {
      documentId: docRef.id
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding journal entry:", error);
    throw error;
  }
};

// Update an existing journal entry
export const updateJournalEntry = async (userId: string, documentId: string, updates: Partial<JournalEntry>): Promise<void> => {
  try {
    const entryRef = doc(db, "journalEntries", documentId);
    
    // Add updatedAt timestamp
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(entryRef, updatedData);
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw error;
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (documentId: string): Promise<void> => {
  try {
    const entryRef = doc(db, "journalEntries", documentId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
};

// Get all journal entries for a user
export const getUserJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  try {
    if (!userId) {
      console.error("No userId provided to getUserJournalEntries");
      throw new Error("User ID is required to fetch journal entries");
    }

    const journalCollection = collection(db, "journalEntries");
    
    console.log(`Fetching journal entries for user: ${userId}`);
    
    // Simplest possible query to just get documents with a limit
    const q = query(
      journalCollection,
      limit(100)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      console.log(`Retrieved ${querySnapshot.size} total journal entries, filtering for current user`);
      
      const entries: JournalEntry[] = [];
      
      // Filter entries client-side to only include those belonging to the current user
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          entries.push({
            ...data,
            documentId: doc.id
          } as JournalEntry);
        }
      });
      
      console.log(`Filtered to ${entries.length} journal entries for user ${userId}`);
      
      // Sort entries by date (descending) after fetching
      entries.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      return entries;
    } catch (error: any) {
      console.error("Error executing journal entries query:", error);
      if (error.toString().includes("permission")) {
        throw new Error("Permission denied: You do not have permission to access journal entries. Please ensure you are properly authenticated.");
      }
      throw error;
    }
  } catch (error) {
    console.error("Error getting journal entries:", error);
    throw error;
  }
};

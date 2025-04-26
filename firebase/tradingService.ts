import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc
} from "firebase/firestore";
import { db } from "./config";
import { Position, Order } from "@/contexts/TradingContext";

// Save a position to Firestore at the root level
export const savePosition = async (userId: string, position: Position): Promise<void> => {
  try {
    // Save to root collection
    const positionsCollection = collection(db, "positions");
    
    // Convert to Firestore format
    const positionData = {
      ...position,
      userId, // Critical for security rules
      openTime: position.openTime ? new Date(position.openTime) : new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Use addDoc to let Firestore generate the ID or setDoc with the existing ID
    if (position.id) {
      await setDoc(doc(db, "positions", position.id), positionData);
    } else {
      // This should never happen since we generate IDs in the context
      const docRef = await addDoc(positionsCollection, positionData);
      console.log(`Position saved with auto-generated ID: ${docRef.id}`);
    }
    
    console.log(`Position saved for user ${userId}`);
  } catch (error) {
    console.error("Error saving position:", error);
    throw error;
  }
};

// Get all positions for a user from the root level
export const getUserPositions = async (userId: string): Promise<Position[]> => {
  try {
    const positionsCollection = collection(db, "positions");
    // Query for positions with matching userId
    const q = query(
      positionsCollection, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const positions: Position[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      positions.push({
        ...data,
        id: doc.id,
        // Convert Firestore Timestamp to string
        openTime: data.openTime instanceof Timestamp ? data.openTime.toDate().toISOString() : data.openTime
      } as Position);
    });
    
    return positions;
  } catch (error) {
    console.error("Error getting positions:", error);
    throw error;
  }
};

// Delete a position from the root level
export const deletePosition = async (userId: string, positionId: string): Promise<void> => {
  try {
    // First verify that the position belongs to the user
    const positionRef = doc(db, "positions", positionId);
    const positionDoc = await getDoc(positionRef);
    
    if (!positionDoc.exists()) {
      throw new Error(`Position with ID ${positionId} not found`);
    }
    
    const positionData = positionDoc.data();
    if (positionData.userId !== userId) {
      throw new Error(`Position does not belong to user ${userId}`);
    }
    
    // Now delete it
    await deleteDoc(positionRef);
    console.log(`Position ${positionId} deleted for user ${userId}`);
  } catch (error) {
    console.error("Error deleting position:", error);
    throw error;
  }
};

// Save an order to Firestore at the root level
export const saveOrder = async (userId: string, order: Order): Promise<void> => {
  try {
    // Save to the root collection
    const ordersCollection = collection(db, "orders");
    
    // Convert to Firestore format
    const orderData = {
      ...order,
      userId, // Critical for security rules
      time: order.time ? new Date(order.time) : new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Use addDoc to let Firestore generate the ID or setDoc with the existing ID
    if (order.id) {
      await setDoc(doc(db, "orders", order.id), orderData);
    } else {
      // This should never happen since we generate IDs in the context
      const docRef = await addDoc(ordersCollection, orderData);
      console.log(`Order saved with auto-generated ID: ${docRef.id}`);
    }
    
    console.log(`Order saved for user ${userId}`);
  } catch (error) {
    console.error("Error saving order:", error);
    throw error;
  }
};

// Get all orders for a user from the root level
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersCollection = collection(db, "orders");
    // Query for orders with matching userId
    const q = query(
      ordersCollection, 
      where("userId", "==", userId),
      orderBy("time", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        ...data,
        id: doc.id,
        // Convert Firestore Timestamp to string
        time: data.time instanceof Timestamp ? data.time.toDate().toISOString() : data.time
      } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

// Update a position's current price
export const updatePositionPrice = async (
  userId: string, 
  positionId: string, 
  currentPrice: number
): Promise<void> => {
  try {
    // First verify that the position belongs to the user
    const positionRef = doc(db, "positions", positionId);
    const positionDoc = await getDoc(positionRef);
    
    if (!positionDoc.exists()) {
      throw new Error(`Position with ID ${positionId} not found`);
    }
    
    const positionData = positionDoc.data();
    if (positionData.userId !== userId) {
      throw new Error(`Position does not belong to user ${userId}`);
    }
    
    // Only update the price and updatedAt fields
    await setDoc(positionRef, {
      currentPrice,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`Position ${positionId} price updated to ${currentPrice} for user ${userId}`);
  } catch (error) {
    console.error("Error updating position price:", error);
    throw error;
  }
};

// Update a limit order status when it executes
export const updateOrderStatus = async (
  userId: string,
  orderId: string,
  status: "filled" | "cancelled",
  executionPrice?: number
): Promise<void> => {
  try {
    // First verify that the order belongs to the user
    const orderRef = doc(db, "orders", orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    const orderData = orderDoc.data();
    if (orderData.userId !== userId) {
      throw new Error(`Order does not belong to user ${userId}`);
    }
    
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (executionPrice) {
      updateData.executionPrice = executionPrice;
    }
    
    await setDoc(orderRef, updateData, { merge: true });
    console.log(`Order ${orderId} status updated to ${status} for user ${userId}`);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}; 
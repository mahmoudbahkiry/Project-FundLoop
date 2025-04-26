import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  savePosition,
  saveOrder,
  getUserPositions,
  getUserOrders,
  deletePosition,
  updateOrderStatus,
} from "@/firebase/tradingService";

export interface Position {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  openTime: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  orderType: "market" | "limit" | "stop";
  price: number;
  quantity: number;
  status: "filled" | "pending" | "cancelled";
  time: string;
  executionPrice?: number;
}

export type AccountMode = "Evaluation" | "Funded";

interface TradingContextType {
  positions: Position[];
  orders: Order[];
  addPosition: (position: Omit<Position, "id">) => Promise<void>;
  addOrder: (order: Omit<Order, "id">) => Promise<void>;
  closePosition: (id: string) => Promise<void>;
  loading: boolean;
  balance: number;
  updateBalance: (newBalance: number) => Promise<void>;
  accountMode: AccountMode;
  setAccountMode: (mode: AccountMode) => void;
  evaluationBalance: number;
  fundedBalance: number;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function useTradingContext() {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error("useTradingContext must be used within a TradingProvider");
  }
  return context;
}

interface TradingProviderProps {
  children: ReactNode;
}

// Store keys for AsyncStorage
const POSITIONS_STORAGE_KEY = "trading_positions";
const ORDERS_STORAGE_KEY = "trading_orders";
const BALANCE_STORAGE_KEY = "trading_balance";
const ACCOUNT_MODE_KEY = "account_mode";

// Default starting balance
const DEFAULT_BALANCE = 100000;

export function TradingProvider({ children }: TradingProviderProps) {
  // Trading data for Evaluation mode
  const [evaluationPositions, setEvaluationPositions] = useState<Position[]>(
    []
  );
  const [evaluationOrders, setEvaluationOrders] = useState<Order[]>([]);
  const [evaluationBalance, setEvaluationBalance] = useState(DEFAULT_BALANCE);

  // Trading data for Funded mode
  const [fundedPositions, setFundedPositions] = useState<Position[]>([]);
  const [fundedOrders, setFundedOrders] = useState<Order[]>([]);
  const [fundedBalance, setFundedBalance] = useState(DEFAULT_BALANCE);

  // Active mode state
  const [accountMode, setAccountMode] = useState<AccountMode>("Evaluation");

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Memoized values based on current account mode
  const positions =
    accountMode === "Evaluation" ? evaluationPositions : fundedPositions;
  const orders = accountMode === "Evaluation" ? evaluationOrders : fundedOrders;
  const balance =
    accountMode === "Evaluation" ? evaluationBalance : fundedBalance;

  // Save positions to AsyncStorage with mode prefix
  const savePositionsToStorage = async (
    newPositions: Position[],
    mode: AccountMode
  ) => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${POSITIONS_STORAGE_KEY}_${mode}_${userId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(newPositions));
    } catch (error) {
      console.error(`Error saving ${mode} positions to AsyncStorage:`, error);
    }
  };

  // Save orders to AsyncStorage with mode prefix
  const saveOrdersToStorage = async (newOrders: Order[], mode: AccountMode) => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${ORDERS_STORAGE_KEY}_${mode}_${userId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(newOrders));
    } catch (error) {
      console.error(`Error saving ${mode} orders to AsyncStorage:`, error);
    }
  };

  // Save balance to AsyncStorage with mode prefix
  const saveBalanceToStorage = async (
    newBalance: number,
    mode: AccountMode
  ) => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${BALANCE_STORAGE_KEY}_${mode}_${userId}`;
      await AsyncStorage.setItem(storageKey, newBalance.toString());
    } catch (error) {
      console.error(`Error saving ${mode} balance to AsyncStorage:`, error);
    }
  };

  // Save account mode to AsyncStorage
  const saveAccountModeToStorage = async (mode: AccountMode) => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${ACCOUNT_MODE_KEY}_${userId}`;
      await AsyncStorage.setItem(storageKey, mode);
    } catch (error) {
      console.error("Error saving account mode to AsyncStorage:", error);
    }
  };

  // Load positions from AsyncStorage with mode prefix
  const loadPositionsFromStorage = async (
    mode: AccountMode
  ): Promise<Position[]> => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${POSITIONS_STORAGE_KEY}_${mode}_${userId}`;
      const data = await AsyncStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(
        `Error loading ${mode} positions from AsyncStorage:`,
        error
      );
      return [];
    }
  };

  // Load orders from AsyncStorage with mode prefix
  const loadOrdersFromStorage = async (mode: AccountMode): Promise<Order[]> => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${ORDERS_STORAGE_KEY}_${mode}_${userId}`;
      const data = await AsyncStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading ${mode} orders from AsyncStorage:`, error);
      return [];
    }
  };

  // Load balance from AsyncStorage with mode prefix
  const loadBalanceFromStorage = async (mode: AccountMode): Promise<number> => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${BALANCE_STORAGE_KEY}_${mode}_${userId}`;
      const data = await AsyncStorage.getItem(storageKey);
      return data ? parseFloat(data) : DEFAULT_BALANCE;
    } catch (error) {
      console.error(`Error loading ${mode} balance from AsyncStorage:`, error);
      return DEFAULT_BALANCE;
    }
  };

  // Load account mode from AsyncStorage
  const loadAccountModeFromStorage = async (): Promise<AccountMode> => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${ACCOUNT_MODE_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(storageKey);
      return (data as AccountMode) || "Evaluation";
    } catch (error) {
      console.error("Error loading account mode from AsyncStorage:", error);
      return "Evaluation";
    }
  };

  // Handle account mode change
  const handleAccountModeChange = async (mode: AccountMode) => {
    setAccountMode(mode);
    await saveAccountModeToStorage(mode);
  };

  // Update balance based on current mode
  const updateBalance = async (newBalance: number) => {
    try {
      if (accountMode === "Evaluation") {
        setEvaluationBalance(newBalance);
        await saveBalanceToStorage(newBalance, "Evaluation");
      } else {
        setFundedBalance(newBalance);
        await saveBalanceToStorage(newBalance, "Funded");
      }
    } catch (error) {
      console.error(`Error updating ${accountMode} balance:`, error);
      throw error;
    }
  };

  // Load user's positions, orders, and account mode on mount and when user changes
  useEffect(() => {
    const loadUserTradingData = async () => {
      setLoading(true);
      try {
        // Load account mode first
        const savedMode = await loadAccountModeFromStorage();
        setAccountMode(savedMode);

        // Load Evaluation data
        const evalPositions = await loadPositionsFromStorage("Evaluation");
        const evalOrders = await loadOrdersFromStorage("Evaluation");
        const evalBalance = await loadBalanceFromStorage("Evaluation");

        setEvaluationPositions(evalPositions);
        setEvaluationOrders(evalOrders);
        setEvaluationBalance(evalBalance);

        // Load Funded data
        const fundedPositions = await loadPositionsFromStorage("Funded");
        const fundedOrders = await loadOrdersFromStorage("Funded");
        const fundedBalance = await loadBalanceFromStorage("Funded");

        setFundedPositions(fundedPositions);
        setFundedOrders(fundedOrders);
        setFundedBalance(fundedBalance);
      } catch (error) {
        console.error("Error loading trading data:", error);
        // Fallback to defaults
        setEvaluationPositions([]);
        setEvaluationOrders([]);
        setEvaluationBalance(DEFAULT_BALANCE);
        setFundedPositions([]);
        setFundedOrders([]);
        setFundedBalance(DEFAULT_BALANCE);
        setAccountMode("Evaluation");
      } finally {
        setLoading(false);
      }
    };

    loadUserTradingData();
  }, [user]);

  const addPosition = async (position: Omit<Position, "id">) => {
    try {
      // Generate unique ID for the position
      const positionId = `POS-${new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "")
        .substring(2)}-${positions.length + 1}`;
      const newPosition = { ...position, id: positionId };

      // Update local state based on account mode
      if (accountMode === "Evaluation") {
        const updatedPositions = [...evaluationPositions, newPosition];
        setEvaluationPositions(updatedPositions);
        await savePositionsToStorage(updatedPositions, "Evaluation");
      } else {
        const updatedPositions = [...fundedPositions, newPosition];
        setFundedPositions(updatedPositions);
        await savePositionsToStorage(updatedPositions, "Funded");
      }

      // Then try to save to Firestore if user is logged in
      if (user) {
        try {
          await savePosition(user.uid, newPosition);
          console.log("Position saved to Firestore successfully");
        } catch (error) {
          console.error("Error saving position to Firestore:", error);
          // Position is already saved to AsyncStorage, so no need to revert state
        }
      }
    } catch (error) {
      console.error("Error adding position:", error);
      throw error;
    }
  };

  const addOrder = async (order: Omit<Order, "id">) => {
    try {
      // Generate unique ID for the order
      const orderId = `ORD-${new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "")
        .substring(2)}-${orders.length + 1}`;
      const newOrder = { ...order, id: orderId };

      // Update local state based on account mode
      if (accountMode === "Evaluation") {
        const updatedOrders = [...evaluationOrders, newOrder];
        setEvaluationOrders(updatedOrders);
        await saveOrdersToStorage(updatedOrders, "Evaluation");
      } else {
        const updatedOrders = [...fundedOrders, newOrder];
        setFundedOrders(updatedOrders);
        await saveOrdersToStorage(updatedOrders, "Funded");
      }

      // Then try to save to Firestore if user is logged in
      if (user) {
        try {
          await saveOrder(user.uid, newOrder);
          console.log("Order saved to Firestore successfully");
        } catch (error) {
          console.error("Error saving order to Firestore:", error);
          // Order is already saved to AsyncStorage, so no need to revert state
        }
      }

      // If the order is filled, also add it as a position
      if (order.status === "filled" && order.type === "buy") {
        // Deduct the amount from user's balance
        const orderValue =
          (order.executionPrice || order.price) * order.quantity;
        const newBalance = balance - orderValue;
        await updateBalance(newBalance);

        await addPosition({
          symbol: order.symbol,
          type: order.type,
          entryPrice: order.executionPrice || order.price,
          currentPrice: order.executionPrice || order.price,
          quantity: order.quantity,
          openTime: order.time,
        });
      }
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  };

  const closePosition = async (id: string) => {
    try {
      // Find the position to close based on account mode
      const currentPositions =
        accountMode === "Evaluation" ? evaluationPositions : fundedPositions;
      const position = currentPositions.find((pos) => pos.id === id);

      if (!position) {
        console.warn(`Position with ID ${id} not found`);
        return;
      }

      // Update local state based on account mode
      if (accountMode === "Evaluation") {
        const updatedPositions = evaluationPositions.filter(
          (pos) => pos.id !== id
        );
        setEvaluationPositions(updatedPositions);
        await savePositionsToStorage(updatedPositions, "Evaluation");
      } else {
        const updatedPositions = fundedPositions.filter((pos) => pos.id !== id);
        setFundedPositions(updatedPositions);
        await savePositionsToStorage(updatedPositions, "Funded");
      }

      // Then try to delete from Firestore if user is logged in
      if (user) {
        try {
          await deletePosition(user.uid, id);
          console.log("Position deleted from Firestore successfully");
        } catch (error) {
          console.error("Error deleting position from Firestore:", error);
          // Position is already removed from AsyncStorage, so no need to revert state
        }
      }

      // Add a sell order when closing a position
      if (position) {
        const time = new Date().toISOString();

        // Add the sold amount to user's balance
        const saleValue = position.currentPrice * position.quantity;
        const newBalance = balance + saleValue;
        await updateBalance(newBalance);

        await addOrder({
          symbol: position.symbol,
          type: "sell",
          orderType: "market",
          price: position.currentPrice,
          quantity: position.quantity,
          status: "filled",
          time,
          executionPrice: position.currentPrice,
        });
      }
    } catch (error) {
      console.error("Error closing position:", error);
      throw error;
    }
  };

  return (
    <TradingContext.Provider
      value={{
        positions,
        orders,
        addPosition,
        addOrder,
        closePosition,
        loading,
        balance,
        updateBalance,
        accountMode,
        setAccountMode: handleAccountModeChange,
        evaluationBalance,
        fundedBalance,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

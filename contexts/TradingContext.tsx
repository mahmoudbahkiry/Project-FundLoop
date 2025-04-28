import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
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
  addStarredStock,
  removeStarredStock,
  getUserStarredStocks,
  StarredStock,
  migrateStarredStocks,
  updatePositionPrice,
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
  executionPrice?: number | null;
}

export type AccountMode = "Evaluation" | "Funded";

// Type for stock data
export interface Stock {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  bid?: number;
  ask?: number;
}

interface TradingContextType {
  positions: Position[];
  orders: Order[];
  starredStocks: StarredStock[];
  addPosition: (position: Omit<Position, "id">) => Promise<void>;
  addOrder: (order: Omit<Order, "id">) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  closePosition: (id: string) => Promise<void>;
  updatePositionCurrentPrice: (id: string, newPrice: number) => Promise<void>;
  starStock: (stock: { symbol: string; name: string }) => Promise<void>;
  unstarStock: (stockId: string) => Promise<void>;
  isStarred: (symbol: string) => boolean;
  loading: boolean;
  balance: number;
  updateBalance: (newBalance: number) => Promise<void>;
  accountMode: AccountMode;
  setAccountMode: (mode: AccountMode) => void;
  evaluationBalance: number;
  fundedBalance: number;
  // New stock price simulation properties
  liveStocks: Stock[];
  getStockPrice: (symbol: string) => Stock | null;
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
const STARRED_STOCKS_KEY = "starred_stocks";

// Default starting balance
const DEFAULT_BALANCE = 100000;

// Helper function to generate random price change (between -0.5% and +0.5%)
const getRandomPriceChange = (currentPrice: number): number => {
  // Random percentage between -0.5% and +0.5%
  const randomPercent = (Math.random() - 0.5) * 1;
  // Calculate actual change amount
  const changeAmount = currentPrice * (randomPercent / 100);
  // Return new price with 2 decimal places
  return Math.round((currentPrice + changeAmount) * 100) / 100;
};

// Sample stock data
const initialStockData: Stock[] = [
  {
    symbol: "COMI",
    name: "Commercial International Bank",
    lastPrice: 52.75,
    change: 0.75,
    changePercent: 1.44,
    volume: 1245000,
    bid: 52.7,
    ask: 52.8,
  },
  {
    symbol: "HRHO",
    name: "Hermes Holding",
    lastPrice: 18.3,
    change: -0.2,
    changePercent: -1.08,
    volume: 980000,
    bid: 18.25,
    ask: 18.35,
  },
  {
    symbol: "TMGH",
    name: "Talaat Moustafa Group",
    lastPrice: 9.45,
    change: 0.15,
    changePercent: 1.61,
    volume: 750000,
    bid: 9.4,
    ask: 9.5,
  },
  {
    symbol: "SWDY",
    name: "Elsewedy Electric",
    lastPrice: 12.8,
    change: -0.1,
    changePercent: -0.78,
    volume: 620000,
    bid: 12.75,
    ask: 12.85,
  },
  {
    symbol: "EAST",
    name: "Eastern Company",
    lastPrice: 15.2,
    change: 0.3,
    changePercent: 2.01,
    volume: 540000,
    bid: 15.15,
    ask: 15.25,
  },
  {
    symbol: "EFIH",
    name: "EFG Hermes Holding",
    lastPrice: 21.35,
    change: 0.45,
    changePercent: 2.15,
    volume: 890000,
    bid: 21.3,
    ask: 21.4,
  },
  {
    symbol: "ETEL",
    name: "Telecom Egypt",
    lastPrice: 17.65,
    change: -0.25,
    changePercent: -1.4,
    volume: 720000,
    bid: 17.6,
    ask: 17.7,
  },
  {
    symbol: "AMOC",
    name: "Alexandria Mineral Oils",
    lastPrice: 8.9,
    change: 0.2,
    changePercent: 2.3,
    volume: 680000,
    bid: 8.85,
    ask: 8.95,
  },
  {
    symbol: "SKPC",
    name: "Sidi Kerir Petrochemicals",
    lastPrice: 11.75,
    change: -0.15,
    changePercent: -1.26,
    volume: 510000,
    bid: 11.7,
    ask: 11.8,
  },
  {
    symbol: "ESRS",
    name: "Ezz Steel",
    lastPrice: 19.4,
    change: 0.35,
    changePercent: 1.84,
    volume: 630000,
    bid: 19.35,
    ask: 19.45,
  },
  {
    symbol: "ORWE",
    name: "Oriental Weavers",
    lastPrice: 10.25,
    change: 0.1,
    changePercent: 0.99,
    volume: 480000,
    bid: 10.2,
    ask: 10.3,
  },
  {
    symbol: "MNHD",
    name: "Madinet Nasr Housing",
    lastPrice: 7.85,
    change: -0.05,
    changePercent: -0.63,
    volume: 520000,
    bid: 7.8,
    ask: 7.9,
  },
  {
    symbol: "PHDC",
    name: "Palm Hills Development",
    lastPrice: 6.4,
    change: 0.15,
    changePercent: 2.4,
    volume: 950000,
    bid: 6.35,
    ask: 6.45,
  },
  {
    symbol: "HELI",
    name: "Heliopolis Housing",
    lastPrice: 8.15,
    change: -0.1,
    changePercent: -1.21,
    volume: 420000,
    bid: 8.1,
    ask: 8.2,
  },
  {
    symbol: "JUFO",
    name: "Juhayna Food Industries",
    lastPrice: 13.6,
    change: 0.25,
    changePercent: 1.87,
    volume: 380000,
    bid: 13.55,
    ask: 13.65,
  },
];

export function TradingProvider({ children }: TradingProviderProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Trading data for Evaluation mode
  const [evaluationPositions, setEvaluationPositions] = useState<Position[]>(
    []
  );
  const [evaluationOrders, setEvaluationOrders] = useState<Order[]>([]);
  const [evaluationBalance, setEvaluationBalance] = useState(DEFAULT_BALANCE);
  const [evaluationStarredStocks, setEvaluationStarredStocks] = useState<
    StarredStock[]
  >([]);

  // Trading data for Funded mode
  const [fundedPositions, setFundedPositions] = useState<Position[]>([]);
  const [fundedOrders, setFundedOrders] = useState<Order[]>([]);
  const [fundedBalance, setFundedBalance] = useState(DEFAULT_BALANCE);
  const [fundedStarredStocks, setFundedStarredStocks] = useState<
    StarredStock[]
  >([]);

  // Stock price simulation state
  const [liveStocks, setLiveStocks] = useState<Stock[]>(initialStockData);
  const priceUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active mode state
  const [accountMode, setAccountMode] = useState<AccountMode>("Evaluation");

  // Live stock price simulation
  useEffect(() => {
    console.log("Setting up stock price simulation interval");

    // Clear any existing interval
    if (priceUpdateIntervalRef.current) {
      clearInterval(priceUpdateIntervalRef.current);
    }

    // Create new interval to update prices every second
    priceUpdateIntervalRef.current = setInterval(() => {
      // Update the live stock prices
      setLiveStocks((prevStocks) => {
        const updatedStocks = prevStocks.map((stock) => {
          const newPrice = getRandomPriceChange(stock.lastPrice);
          const change = +(newPrice - stock.lastPrice).toFixed(2);
          const changePercent = +((change / stock.lastPrice) * 100).toFixed(2);

          return {
            ...stock,
            lastPrice: newPrice,
            change,
            changePercent,
            bid: +(newPrice - 0.05).toFixed(2),
            ask: +(newPrice + 0.05).toFixed(2),
          };
        });

        // After updating stocks, also update positions with these new prices
        if (evaluationPositions.length > 0) {
          const updatedPositions = evaluationPositions.map((position) => {
            const matchingStock = updatedStocks.find(
              (stock) => stock.symbol === position.symbol
            );
            if (matchingStock) {
              return {
                ...position,
                currentPrice: matchingStock.lastPrice,
              };
            }
            return position;
          });

          // Use updatedPositions directly instead of a state update callback
          setEvaluationPositions(updatedPositions);

          // Save to storage in the background
          savePositionsToStorage(updatedPositions, "Evaluation").catch((err) =>
            console.error("Error saving updated evaluation positions:", err)
          );
        }

        if (fundedPositions.length > 0) {
          const updatedPositions = fundedPositions.map((position) => {
            const matchingStock = updatedStocks.find(
              (stock) => stock.symbol === position.symbol
            );
            if (matchingStock) {
              return {
                ...position,
                currentPrice: matchingStock.lastPrice,
              };
            }
            return position;
          });

          // Use updatedPositions directly instead of a state update callback
          setFundedPositions(updatedPositions);

          // Save to storage in the background
          savePositionsToStorage(updatedPositions, "Funded").catch((err) =>
            console.error("Error saving updated funded positions:", err)
          );
        }

        return updatedStocks;
      });
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      if (priceUpdateIntervalRef.current) {
        clearInterval(priceUpdateIntervalRef.current);
        priceUpdateIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array to only set up once

  // Function to get stock data by symbol
  const getStockPrice = useCallback(
    (symbol: string): Stock | null => {
      return liveStocks.find((stock) => stock.symbol === symbol) || null;
    },
    [liveStocks]
  );

  // Memoized values based on current account mode
  const positions =
    accountMode === "Evaluation" ? evaluationPositions : fundedPositions;
  const orders = accountMode === "Evaluation" ? evaluationOrders : fundedOrders;
  const balance =
    accountMode === "Evaluation" ? evaluationBalance : fundedBalance;
  const starredStocks =
    accountMode === "Evaluation"
      ? evaluationStarredStocks
      : fundedStarredStocks;

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

  // Save starred stocks to AsyncStorage
  const saveStarredStocksToStorage = async (
    stocks: StarredStock[],
    mode: AccountMode
  ) => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${STARRED_STOCKS_KEY}_${mode}_${userId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(stocks));
    } catch (error) {
      console.error(
        `Error saving ${mode} starred stocks to AsyncStorage:`,
        error
      );
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

  // Load starred stocks from AsyncStorage
  const loadStarredStocksFromStorage = async (
    mode: AccountMode
  ): Promise<StarredStock[]> => {
    try {
      const userId = user?.uid || "guest";
      const storageKey = `${STARRED_STOCKS_KEY}_${mode}_${userId}`;
      const stocksData = await AsyncStorage.getItem(storageKey);
      return stocksData ? JSON.parse(stocksData) : [];
    } catch (error) {
      console.error(
        `Error loading ${mode} starred stocks from AsyncStorage:`,
        error
      );
      return [];
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

  // Load user's positions, orders, starred stocks, and account mode on mount and when user changes
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
        const evalStarredStocks = await loadStarredStocksFromStorage(
          "Evaluation"
        );

        setEvaluationPositions(evalPositions);
        setEvaluationOrders(evalOrders);
        setEvaluationBalance(evalBalance);
        setEvaluationStarredStocks(evalStarredStocks);

        // Load Funded data
        const fundedPositions = await loadPositionsFromStorage("Funded");
        const fundedOrders = await loadOrdersFromStorage("Funded");
        const fundedBalance = await loadBalanceFromStorage("Funded");
        const fundedStarredStocks = await loadStarredStocksFromStorage(
          "Funded"
        );

        setFundedPositions(fundedPositions);
        setFundedOrders(fundedOrders);
        setFundedBalance(fundedBalance);
        setFundedStarredStocks(fundedStarredStocks);

        // If user is logged in, try to get starred stocks from Firestore
        if (user) {
          try {
            // Attempt to migrate any old starred stocks to the new format
            try {
              await migrateStarredStocks(user.uid);
            } catch (migrationError) {
              console.error("Error migrating starred stocks:", migrationError);
              // Continue with loading even if migration fails
            }

            // Load evaluation starred stocks
            const evalFirestoreStocks = await getUserStarredStocks(
              user.uid,
              "Evaluation"
            );
            if (evalFirestoreStocks.length > 0) {
              setEvaluationStarredStocks(evalFirestoreStocks);
              await saveStarredStocksToStorage(
                evalFirestoreStocks,
                "Evaluation"
              );
            }

            // Load funded starred stocks
            const fundedFirestoreStocks = await getUserStarredStocks(
              user.uid,
              "Funded"
            );
            if (fundedFirestoreStocks.length > 0) {
              setFundedStarredStocks(fundedFirestoreStocks);
              await saveStarredStocksToStorage(fundedFirestoreStocks, "Funded");
            }
          } catch (error) {
            console.error(
              "Error loading starred stocks from Firestore:",
              error
            );
          }
        }
      } catch (error) {
        console.error("Error loading trading data:", error);
        // Fallback to defaults
        setEvaluationPositions([]);
        setEvaluationOrders([]);
        setEvaluationBalance(DEFAULT_BALANCE);
        setEvaluationStarredStocks([]);
        setFundedPositions([]);
        setFundedOrders([]);
        setFundedBalance(DEFAULT_BALANCE);
        setFundedStarredStocks([]);
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

      // Create a clean order object without undefined values for Firebase
      // This ensures optional fields like executionPrice won't cause Firebase errors
      const cleanOrderData = { ...order };

      // Remove executionPrice if it's undefined for pending limit orders
      if (
        cleanOrderData.orderType === "limit" &&
        cleanOrderData.status === "pending"
      ) {
        // For pending limit orders, executionPrice should be null rather than undefined
        cleanOrderData.executionPrice = null;
      }

      const newOrder = { ...cleanOrderData, id: orderId };

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

      // Get the current price from liveStocks if available
      const currentStock = liveStocks.find(
        (stock) => stock.symbol === position.symbol
      );
      const currentPrice = currentStock
        ? currentStock.lastPrice
        : position.currentPrice;

      // Update local state based on account mode - remove the position
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

      // Add a sell order when closing a position - use the current price
      const time = new Date().toISOString();

      // Add the sold amount to user's balance - use current price
      const saleValue = currentPrice * position.quantity;
      const newBalance = balance + saleValue;
      await updateBalance(newBalance);

      // Create the sell order with current price
      await addOrder({
        symbol: position.symbol,
        type: "sell",
        orderType: "market",
        price: currentPrice,
        quantity: position.quantity,
        status: "filled",
        time,
        executionPrice: currentPrice,
      });
    } catch (error) {
      console.error("Error closing position:", error);
      throw error;
    }
  };

  // Function to manually update a position's current price
  const updatePositionCurrentPrice = async (id: string, newPrice: number) => {
    try {
      // Find the position to update based on account mode
      const currentPositions =
        accountMode === "Evaluation" ? evaluationPositions : fundedPositions;
      const position = currentPositions.find((pos) => pos.id === id);

      if (!position) {
        console.warn(`Position with ID ${id} not found`);
        return;
      }

      // Update the position in the appropriate state
      if (accountMode === "Evaluation") {
        const updatedPositions = evaluationPositions.map((pos) =>
          pos.id === id ? { ...pos, currentPrice: newPrice } : pos
        );
        setEvaluationPositions(updatedPositions);
        await savePositionsToStorage(updatedPositions, "Evaluation");
      } else {
        const updatedPositions = fundedPositions.map((pos) =>
          pos.id === id ? { ...pos, currentPrice: newPrice } : pos
        );
        setFundedPositions(updatedPositions);
        await savePositionsToStorage(updatedPositions, "Funded");
      }

      // Update in Firestore if the user is logged in
      if (user) {
        try {
          // Using the imported function from tradingService
          await updatePositionPrice(user.uid, id, newPrice);
          console.log(
            `Position ${id} price updated to ${newPrice} in Firestore`
          );
        } catch (error) {
          console.error("Error updating position price in Firestore:", error);
        }
      }
    } catch (error) {
      console.error("Error updating position price:", error);
      throw error;
    }
  };

  // Star a stock
  const starStock = async (stock: { symbol: string; name: string }) => {
    try {
      // Add to Firestore if user is logged in
      let stockId;
      if (user) {
        try {
          stockId = await addStarredStock(user.uid, stock, accountMode);
        } catch (error) {
          console.error("Error adding starred stock to Firestore:", error);
          // Generate a local ID
          stockId = `local-${Date.now()}`;
        }
      } else {
        // Generate a local ID
        stockId = `local-${Date.now()}`;
      }

      // Create new starred stock object
      const newStock: StarredStock = {
        id: stockId,
        symbol: stock.symbol,
        name: stock.name,
        addedAt: new Date().toISOString(),
        accountMode: accountMode,
      };

      // Update local state based on account mode
      if (accountMode === "Evaluation") {
        const updatedStocks = [...evaluationStarredStocks, newStock];
        setEvaluationStarredStocks(updatedStocks);
        await saveStarredStocksToStorage(updatedStocks, "Evaluation");
      } else {
        const updatedStocks = [...fundedStarredStocks, newStock];
        setFundedStarredStocks(updatedStocks);
        await saveStarredStocksToStorage(updatedStocks, "Funded");
      }
    } catch (error) {
      console.error("Error starring stock:", error);
      throw error;
    }
  };

  // Unstar a stock
  const unstarStock = async (stockId: string) => {
    try {
      // Get the current starred stocks based on account mode
      const currentStocks =
        accountMode === "Evaluation"
          ? evaluationStarredStocks
          : fundedStarredStocks;

      // Remove from local state
      const updatedStocks = currentStocks.filter(
        (stock) => stock.id !== stockId
      );

      // Update the appropriate state and storage
      if (accountMode === "Evaluation") {
        setEvaluationStarredStocks(updatedStocks);
        await saveStarredStocksToStorage(updatedStocks, "Evaluation");
      } else {
        setFundedStarredStocks(updatedStocks);
        await saveStarredStocksToStorage(updatedStocks, "Funded");
      }

      // Remove from Firestore if user is logged in
      if (user) {
        try {
          await removeStarredStock(user.uid, stockId);
        } catch (error) {
          console.error("Error removing starred stock from Firestore:", error);
        }
      }
    } catch (error) {
      console.error("Error unstarring stock:", error);
      throw error;
    }
  };

  // Check if a stock is starred
  const isStarred = (symbol: string) => {
    const currentStocks =
      accountMode === "Evaluation"
        ? evaluationStarredStocks
        : fundedStarredStocks;
    return currentStocks.some((stock) => stock.symbol === symbol);
  };

  const cancelOrder = async (id: string) => {
    try {
      setLoading(true);

      // Find the order to cancel
      const orderToCancel = orders.find((order) => order.id === id);

      if (!orderToCancel) {
        console.error(`Order with ID ${id} not found`);
        setLoading(false);
        return;
      }

      // Order can only be cancelled if it's in pending status
      if (orderToCancel.status !== "pending") {
        console.error(`Cannot cancel order that is not pending`);
        setLoading(false);
        return;
      }

      // Update order status to cancelled
      const updatedOrders = orders.map((order) =>
        order.id === id ? { ...order, status: "cancelled" as const } : order
      );

      // Save to storage
      await saveOrdersToStorage(updatedOrders, accountMode);

      // Update state based on current account mode
      if (accountMode === "Evaluation") {
        setEvaluationOrders(updatedOrders);
      } else {
        setFundedOrders(updatedOrders);
      }

      // If we ever add database support, we'd update the database here
      console.log(`Order ${id} cancelled successfully`);

      setLoading(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setLoading(false);
      throw error;
    }
  };

  return (
    <TradingContext.Provider
      value={{
        positions,
        orders,
        starredStocks,
        addPosition,
        addOrder,
        cancelOrder,
        closePosition,
        updatePositionCurrentPrice,
        starStock,
        unstarStock,
        isStarred,
        loading,
        balance,
        updateBalance,
        accountMode,
        setAccountMode: handleAccountModeChange,
        evaluationBalance,
        fundedBalance,
        // New stock price simulation properties
        liveStocks,
        getStockPrice,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

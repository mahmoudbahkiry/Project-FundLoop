import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "react-native";
import { useTradingContext } from "@/contexts/TradingContext";

type OrderType = "cash" | "units" | "limit";

export default function BuyStockScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const router = useRouter();
  const params = useLocalSearchParams<{
    symbol: string;
    name: string;
    price: string;
  }>();
  const {
    addOrder,
    balance,
    starStock,
    unstarStock,
    isStarred,
    getStockPrice,
  } = useTradingContext();

  // Extract stock information from params
  const symbol = params.symbol || "";
  const stockName = params.name || "";
  const paramPrice = parseFloat(params.price || "0");

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [starred, setStarred] = useState(false);

  // Add state for buy confirmation modal
  const [buyConfirmVisible, setBuyConfirmVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    orderType: string;
    quantity: number;
    price: number;
    totalValue: number;
    isLimit: boolean;
  } | null>(null);

  // Separate state for tracking live modal price
  const [liveModalPrice, setLiveModalPrice] = useState(0);
  const [priceChanged, setPriceChanged] = useState(false);

  // Use ref to track the latest price without causing re-renders
  const latestPriceRef = useRef(0);

  // State variables
  const [orderType, setOrderType] = useState<OrderType>("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [units, setUnits] = useState("");
  const [limitPrice, setLimitPrice] = useState(paramPrice.toFixed(2));
  const [estimatedUnits, setEstimatedUnits] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  // Track the live price separately
  const [currentPrice, setCurrentPrice] = useState(paramPrice);

  // Use live stock data from context when available
  useEffect(() => {
    // Get the current stock price from the context
    const stockData = getStockPrice(symbol);
    if (stockData) {
      setCurrentPrice(stockData.lastPrice);

      // Update limitPrice only if it hasn't been modified by the user
      if (paramPrice === parseFloat(limitPrice)) {
        setLimitPrice(stockData.lastPrice.toFixed(2));
      }
    }
  }, [symbol, getStockPrice, paramPrice]);

  // Update calculations when values change
  useEffect(() => {
    if (orderType === "cash" && cashAmount) {
      const amount = parseFloat(cashAmount);
      if (!isNaN(amount) && amount > 0 && currentPrice > 0) {
        const units = amount / currentPrice;
        setEstimatedUnits(Math.floor(units)); // Round down to whole units only
      } else {
        setEstimatedUnits(0);
      }
    } else if (orderType === "units" && units) {
      const unitCount = parseFloat(units);
      if (!isNaN(unitCount) && unitCount > 0) {
        setTotalValue(unitCount * currentPrice);
      } else {
        setTotalValue(0);
      }
    } else if (orderType === "limit" && units && limitPrice) {
      const unitCount = parseFloat(units);
      const price = parseFloat(limitPrice);
      if (!isNaN(unitCount) && !isNaN(price) && unitCount > 0 && price > 0) {
        setTotalValue(unitCount * price);
      } else {
        setTotalValue(0);
      }
    }
  }, [orderType, cashAmount, units, limitPrice, currentPrice]);

  // Check if the stock is starred on mount
  useEffect(() => {
    if (symbol) {
      setStarred(isStarred(symbol));
    }
  }, [isStarred, symbol]);

  // Toggle star
  const handleToggleStar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (starred) {
        // Find the stock ID to unstar
        // For simplicity, we're just toggling the UI state
        // In a real app, you'd need to get the actual ID
        setStarred(false);
        // Actual implementation would use the ID
        // await unstarStock(stockId);
      } else {
        setStarred(true);
        await starStock({ symbol, name: stockName });
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      // Revert UI state if operation fails
      setStarred(!starred);
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get the latest price from context
    const stockData = getStockPrice(symbol);
    const latestPrice = stockData ? stockData.lastPrice : currentPrice;

    // Validate order
    if (orderType === "cash" && (!cashAmount || parseFloat(cashAmount) <= 0)) {
      Alert.alert("Invalid Amount", "Please enter a valid cash amount");
      return;
    } else if (orderType === "units" && (!units || parseFloat(units) <= 0)) {
      Alert.alert("Invalid Units", "Please enter a valid number of units");
      return;
    } else if (
      orderType === "limit" &&
      (!units ||
        parseFloat(units) <= 0 ||
        !limitPrice ||
        parseFloat(limitPrice) <= 0)
    ) {
      Alert.alert("Invalid Order", "Please enter valid units and price");
      return;
    }

    // Check if user has sufficient funds
    let orderValue = 0;
    if (orderType === "cash") {
      orderValue = parseFloat(cashAmount);
    } else if (orderType === "units") {
      orderValue = parseFloat(units) * latestPrice;
    } else if (orderType === "limit") {
      orderValue = parseFloat(units) * parseFloat(limitPrice);
    }

    if (orderValue > balance) {
      Alert.alert(
        "Insufficient Funds",
        "You do not have enough funds to place this order"
      );
      return;
    }

    // Create order details object for the modal
    let finalOrderType = "";
    let finalQuantity = 0;
    let finalPrice = 0;
    let totalValue = 0;
    let isLimit = false;

    if (orderType === "cash") {
      finalOrderType = "market";
      finalQuantity = Math.floor(estimatedUnits); // Ensure whole units only
      finalPrice = latestPrice;
      totalValue = finalQuantity * latestPrice;
    } else if (orderType === "units") {
      finalOrderType = "market";
      finalQuantity = Math.floor(parseFloat(units)); // Ensure whole units only
      finalPrice = latestPrice;
      totalValue = finalQuantity * latestPrice;
    } else if (orderType === "limit") {
      finalOrderType = "limit";
      finalQuantity = Math.floor(parseFloat(units)); // Ensure whole units only
      finalPrice = parseFloat(limitPrice);
      totalValue = finalQuantity * finalPrice;
      isLimit = true;
    }

    // Set order details and show modal instead of alert
    setOrderDetails({
      orderType: finalOrderType,
      quantity: finalQuantity,
      price: finalPrice,
      totalValue: totalValue,
      isLimit: isLimit,
    });

    setBuyConfirmVisible(true);
  };

  // Execute the buy order
  const executeBuyOrder = async () => {
    if (!orderDetails) return;

    try {
      setIsPlacingOrder(true);

      // Create a new order
      const time = new Date().toISOString();
      const status = orderDetails.isLimit ? "pending" : "filled";

      // Use the latest price for market orders
      const executionPrice = orderDetails.isLimit
        ? orderDetails.price
        : liveModalPrice || orderDetails.price;

      // Add the order to context
      await addOrder({
        symbol,
        type: "buy",
        orderType: orderDetails.orderType as "market" | "limit" | "stop",
        price: orderDetails.isLimit ? orderDetails.price : executionPrice,
        quantity: orderDetails.quantity,
        status: status as "filled" | "pending" | "cancelled",
        time,
        // Only include executionPrice for filled orders
        ...(status === "filled" ? { executionPrice } : {}),
      });

      // Close modal and show success alert
      setBuyConfirmVisible(false);
      Alert.alert("Order Placed", "Your order has been successfully placed!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert(
        "Error",
        "There was an error placing your order. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Navigate to Bid-Ask View
  const navigateToBidAsk = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/bid-ask-view",
      params: {
        symbol,
        name: stockName,
        price: currentPrice.toString(),
      },
    });
  };

  // Add effect to update price in modal
  useEffect(() => {
    // Only run this effect if the modal is visible with market order
    if (buyConfirmVisible && orderDetails && !orderDetails.isLimit) {
      // Initialize with current price
      const initialPrice = orderDetails.price;
      setLiveModalPrice(initialPrice);
      latestPriceRef.current = initialPrice;
      setPriceChanged(false);

      // Get initial stock data and update price immediately
      const stockData = getStockPrice(symbol);
      if (stockData) {
        const newPrice = stockData.lastPrice;
        setLiveModalPrice(newPrice);
        latestPriceRef.current = newPrice;

        // Mark that price has changed only if it's different from initial
        if (Math.abs(newPrice - initialPrice) > 0.001) {
          setPriceChanged(true);
        }
      }

      // Set up an interval to poll for price updates
      const intervalId = setInterval(() => {
        // Get the latest stock price from the context
        const stockData = getStockPrice(symbol);
        if (stockData) {
          const newPrice = stockData.lastPrice;
          const oldPrice = latestPriceRef.current;

          // Only update if price has actually changed
          if (Math.abs(newPrice - oldPrice) > 0.001) {
            // Update the ref immediately
            latestPriceRef.current = newPrice;

            // Then update state which will trigger re-render
            // Use a functional update to prevent unnecessary re-renders
            setLiveModalPrice((prevPrice) => newPrice);
            setPriceChanged(true);
          }
        }
      }, 1000); // Reduced frequency from 500ms to 1000ms to prevent excessive re-renders

      // Clean up interval on unmount or when modal closes
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [buyConfirmVisible, orderDetails, getStockPrice, symbol]);

  return (
    <>
      <Stack.Screen
        options={{
          title: `Buy ${symbol}`,
          headerRight: () => (
            <TouchableOpacity
              style={styles.starButton}
              onPress={handleToggleStar}
            >
              <Ionicons
                name={starred ? "star" : "star-outline"}
                size={24}
                color={starred ? "#FFB800" : Colors[theme].text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <SafeAreaView style={styles.container}>
          {isPlacingOrder && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors[theme].primary} />
              <ThemedText style={styles.loadingText}>
                Placing your order...
              </ThemedText>
            </View>
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            removeClippedSubviews={false}
          >
            {/* Stock Information */}
            <View style={styles.stockInfoContainer}>
              <View style={styles.stockHeader}>
                <View>
                  <ThemedText style={styles.stockSymbol}>{symbol}</ThemedText>
                  <ThemedText style={styles.stockName}>{stockName}</ThemedText>
                </View>
                <View style={styles.priceContainer}>
                  <ThemedText style={styles.stockPrice}>
                    {formatCurrency(currentPrice)}
                  </ThemedText>
                </View>
              </View>

              {/* Add Balance Information */}
              <View style={styles.balanceContainer}>
                <ThemedText style={styles.balanceLabel}>
                  Available Funds:
                </ThemedText>
                <ThemedText style={styles.balanceAmount}>
                  {formatCurrency(balance)}
                </ThemedText>
              </View>

              {/* Add Bid-Ask View Button */}
              <TouchableOpacity
                style={styles.bidAskButton}
                onPress={navigateToBidAsk}
              >
                <ThemedText style={styles.bidAskButtonText}>
                  View Market Depth
                </ThemedText>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors[theme].primary}
                />
              </TouchableOpacity>
            </View>

            {/* Order Type Selection */}
            <ThemedView variant="elevated" style={styles.orderTypeCard}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Order Type
              </ThemedText>

              <View style={styles.orderTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    orderType === "cash" && {
                      backgroundColor: "rgba(0, 168, 107, 0.1)",
                      borderColor: Colors[theme].primary,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setOrderType("cash");
                  }}
                >
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={
                      orderType === "cash"
                        ? Colors[theme].primary
                        : Colors[theme].text
                    }
                    style={styles.orderTypeIcon}
                  />
                  <ThemedText
                    style={[
                      styles.orderTypeText,
                      orderType === "cash" && { color: Colors[theme].primary },
                    ]}
                  >
                    Cash
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    orderType === "units" && {
                      backgroundColor: "rgba(0, 168, 107, 0.1)",
                      borderColor: Colors[theme].primary,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setOrderType("units");
                  }}
                >
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color={
                      orderType === "units"
                        ? Colors[theme].primary
                        : Colors[theme].text
                    }
                    style={styles.orderTypeIcon}
                  />
                  <ThemedText
                    style={[
                      styles.orderTypeText,
                      orderType === "units" && { color: Colors[theme].primary },
                    ]}
                  >
                    Units
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.orderTypeButton,
                    orderType === "limit" && {
                      backgroundColor: "rgba(0, 168, 107, 0.1)",
                      borderColor: Colors[theme].primary,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setOrderType("limit");
                  }}
                >
                  <Ionicons
                    name="trending-up-outline"
                    size={20}
                    color={
                      orderType === "limit"
                        ? Colors[theme].primary
                        : Colors[theme].text
                    }
                    style={styles.orderTypeIcon}
                  />
                  <ThemedText
                    style={[
                      styles.orderTypeText,
                      orderType === "limit" && { color: Colors[theme].primary },
                    ]}
                  >
                    Limit Order
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>

            {/* Order Details */}
            <ThemedView variant="elevated" style={styles.orderDetailsCard}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Order Details
              </ThemedText>

              {orderType === "cash" && (
                <>
                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.inputLabel}>
                      Cash Amount (EGP)
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.textInput,
                        { color: Colors[theme].text, borderColor: "#E0E0E0" },
                      ]}
                      value={cashAmount}
                      onChangeText={setCashAmount}
                      keyboardType="decimal-pad"
                      placeholder="Enter amount"
                      placeholderTextColor={Colors[theme].icon}
                    />
                  </View>

                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>
                        Current Price
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {formatCurrency(currentPrice)}
                      </ThemedText>
                    </View>

                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>
                        Estimated Units
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {Math.floor(estimatedUnits)}
                      </ThemedText>
                    </View>

                    <ThemedText type="caption" style={styles.wholeUnitsNote}>
                      Only whole units can be purchased. Partial units are
                      rounded down.
                    </ThemedText>
                  </View>
                </>
              )}

              {orderType === "units" && (
                <>
                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.inputLabel}>
                      Number of Units
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.textInput,
                        { color: Colors[theme].text, borderColor: "#E0E0E0" },
                      ]}
                      value={units}
                      onChangeText={setUnits}
                      keyboardType="decimal-pad"
                      placeholder="Enter units"
                      placeholderTextColor={Colors[theme].icon}
                    />
                  </View>

                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>
                        Current Price
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {formatCurrency(currentPrice)}
                      </ThemedText>
                    </View>

                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>
                        Total Value
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {formatCurrency(
                          Math.floor(parseFloat(units || "0")) * currentPrice
                        )}
                      </ThemedText>
                    </View>
                  </View>
                </>
              )}

              {orderType === "limit" && (
                <>
                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.inputLabel}>
                      Number of Units
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.textInput,
                        { color: Colors[theme].text, borderColor: "#E0E0E0" },
                      ]}
                      value={units}
                      onChangeText={setUnits}
                      keyboardType="decimal-pad"
                      placeholder="Enter units"
                      placeholderTextColor={Colors[theme].icon}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.inputLabel}>
                      Limit Price (EGP)
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.textInput,
                        { color: Colors[theme].text, borderColor: "#E0E0E0" },
                      ]}
                      value={limitPrice}
                      onChangeText={setLimitPrice}
                      keyboardType="decimal-pad"
                      placeholder="Enter price"
                      placeholderTextColor={Colors[theme].icon}
                    />
                  </View>

                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>
                        Current Market Price
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {formatCurrency(currentPrice)}
                      </ThemedText>
                    </View>

                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryLabel}>
                        Total Order Value
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {formatCurrency(
                          Math.floor(parseFloat(units || "0")) *
                            parseFloat(limitPrice || "0")
                        )}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText type="caption" style={styles.limitExplanation}>
                    Your order will execute only when the stock price reaches or
                    drops below your limit price.
                  </ThemedText>
                </>
              )}
            </ThemedView>

            {/* Place Order Button */}
            <TouchableOpacity
              style={[
                styles.placeOrderButton,
                { backgroundColor: Colors[theme].primary },
                isPlacingOrder && styles.disabledButton,
              ]}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              <ThemedText style={styles.placeOrderButtonText}>
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>

          {/* Buy Confirmation Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={buyConfirmVisible}
            onRequestClose={() => setBuyConfirmVisible(false)}
          >
            <View style={styles.modalContainer}>
              <ThemedView style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ThemedText type="subtitle" style={styles.modalTitle}>
                    Confirm Buy Order
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setBuyConfirmVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={Colors[theme].icon}
                    />
                  </TouchableOpacity>
                </View>

                {orderDetails && (
                  <View style={styles.buyModalContent}>
                    <ThemedText style={styles.confirmText}>
                      Are you sure you want to buy{" "}
                      <ThemedText style={styles.highlightText}>
                        {orderDetails.quantity}
                      </ThemedText>{" "}
                      shares of{" "}
                      <ThemedText style={styles.symbolText}>
                        {symbol}
                      </ThemedText>
                      ?
                    </ThemedText>

                    <View style={styles.sellDetailsCard}>
                      {orderDetails.isLimit ? (
                        <View style={styles.sellDetailRow}>
                          <ThemedText style={styles.sellDetailLabel}>
                            Limit Price:
                          </ThemedText>
                          <ThemedText style={styles.sellDetailValue}>
                            {formatCurrency(orderDetails.price)}
                          </ThemedText>
                        </View>
                      ) : (
                        <View style={styles.sellDetailRow}>
                          <ThemedText style={styles.sellDetailLabel}>
                            Market Price:
                          </ThemedText>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <ThemedText style={styles.sellDetailValue}>
                              {formatCurrency(liveModalPrice)}
                            </ThemedText>
                            {priceChanged && (
                              <Ionicons
                                name="sync-outline"
                                size={12}
                                color={Colors[theme].primary}
                                style={{ marginLeft: 4 }}
                              />
                            )}
                          </View>
                        </View>
                      )}

                      <View style={styles.sellDetailRow}>
                        <ThemedText style={styles.sellDetailLabel}>
                          Quantity:
                        </ThemedText>
                        <ThemedText style={styles.sellDetailValue}>
                          {orderDetails.quantity} shares
                        </ThemedText>
                      </View>

                      <View style={styles.sellDetailRow}>
                        <ThemedText style={styles.sellDetailLabel}>
                          Order Type:
                        </ThemedText>
                        <ThemedText style={styles.sellDetailValue}>
                          {orderDetails.isLimit ? "Limit" : "Market"}
                        </ThemedText>
                      </View>

                      <View
                        style={[styles.sellDetailRow, styles.totalValueRow]}
                      >
                        <ThemedText style={styles.totalValueLabel}>
                          Total Cost:
                        </ThemedText>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <ThemedText style={styles.totalValueAmount}>
                            {orderDetails.isLimit
                              ? formatCurrency(orderDetails.totalValue)
                              : formatCurrency(
                                  liveModalPrice * orderDetails.quantity
                                )}
                          </ThemedText>
                          {!orderDetails.isLimit && priceChanged && (
                            <Ionicons
                              name="sync-outline"
                              size={12}
                              color={Colors[theme].primary}
                              style={{ marginLeft: 4 }}
                            />
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setBuyConfirmVisible(false)}
                  >
                    <ThemedText style={styles.cancelButtonText}>
                      Cancel
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                    onPress={executeBuyOrder}
                  >
                    <ThemedText style={styles.confirmButtonText}>
                      Confirm
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            </View>
          </Modal>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  stockInfoContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#F5F5F7",
    marginHorizontal: 16,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stockName: {
    fontSize: 14,
    opacity: 0.7,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(0, 168, 107, 1)",
  },
  orderTypeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  orderTypeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderTypeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  orderTypeIcon: {
    marginBottom: 4,
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderDetailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  summaryContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    opacity: 0.7,
  },
  summaryValue: {
    fontWeight: "600",
  },
  limitExplanation: {
    marginTop: 16,
    opacity: 0.6,
  },
  placeOrderButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeOrderButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    color: "white",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  wholeUnitsNote: {
    marginTop: 8,
    fontStyle: "italic",
    opacity: 0.7,
  },
  starButton: {
    padding: 8,
    marginRight: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  buyModalContent: {
    paddingHorizontal: 24,
  },
  sellDetailsCard: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  sellDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  sellDetailLabel: {
    fontWeight: "500",
    opacity: 0.7,
    fontSize: 14,
  },
  sellDetailValue: {
    fontWeight: "600",
    fontSize: 15,
  },
  symbolText: {
    fontWeight: "700",
    color: Colors.light.primary,
  },
  highlightText: {
    fontWeight: "700",
  },
  confirmText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
  },
  totalValueRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    paddingTop: 12,
    marginTop: 4,
  },
  totalValueLabel: {
    fontWeight: "600",
    fontSize: 15,
  },
  totalValueAmount: {
    fontWeight: "700",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 24,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#F1F1F1",
    alignItems: "center",
    maxWidth: 140,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  cancelButtonText: {
    color: "#555555",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    maxWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bidAskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  bidAskButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.primary,
    marginRight: 4,
  },
});

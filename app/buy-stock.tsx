import React, { useState, useEffect } from "react";
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

    // Show order confirmation
    let message = "";
    let finalOrderType = "";
    let finalQuantity = 0;
    let finalPrice = 0;
    let finalExecutionPrice = 0;

    if (orderType === "cash") {
      finalOrderType = "market";
      finalQuantity = Math.floor(estimatedUnits); // Ensure whole units only
      finalPrice = latestPrice;
      finalExecutionPrice = latestPrice;
      // Calculate actual cash amount based on rounded units
      const actualCashAmount = finalQuantity * latestPrice;
      message = `Buy ${finalQuantity} units of ${symbol} for ${actualCashAmount.toLocaleString(
        "en-US",
        { style: "currency", currency: "EGP" }
      )}`;
    } else if (orderType === "units") {
      finalOrderType = "market";
      finalQuantity = Math.floor(parseFloat(units)); // Ensure whole units only
      finalPrice = latestPrice;
      finalExecutionPrice = latestPrice;
      message = `Buy ${finalQuantity} units of ${symbol} at market price (approximately ${(
        finalQuantity * latestPrice
      ).toLocaleString("en-US", { style: "currency", currency: "EGP" })})`;
    } else if (orderType === "limit") {
      finalOrderType = "limit";
      finalQuantity = Math.floor(parseFloat(units)); // Ensure whole units only
      finalPrice = parseFloat(limitPrice);
      message = `Place limit order to buy ${finalQuantity} units of ${symbol} at ${parseFloat(
        limitPrice
      ).toLocaleString("en-US", {
        style: "currency",
        currency: "EGP",
      })} per unit (total: ${(
        finalQuantity * parseFloat(limitPrice)
      ).toLocaleString("en-US", {
        style: "currency",
        currency: "EGP",
      })})`;
    }

    Alert.alert("Confirm Order", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "default",
        onPress: async () => {
          try {
            setIsPlacingOrder(true);
            // Create a new order
            const time = new Date().toISOString();
            const status = finalOrderType === "limit" ? "pending" : "filled";

            // Add the order to context
            await addOrder({
              symbol,
              type: "buy",
              orderType: finalOrderType as "market" | "limit" | "stop",
              price: finalPrice,
              quantity: finalQuantity,
              status: status as "filled" | "pending" | "cancelled",
              time,
              executionPrice:
                status === "filled" ? finalExecutionPrice : undefined,
            });

            Alert.alert(
              "Order Placed",
              "Your order has been successfully placed!",
              [{ text: "OK", onPress: () => router.back() }]
            );
          } catch (error) {
            console.error("Error placing order:", error);
            Alert.alert(
              "Error",
              "There was an error placing your order. Please try again."
            );
          } finally {
            setIsPlacingOrder(false);
          }
        },
      },
    ]);
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
                    Only whole units can be purchased. Partial units are rounded
                    down.
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
      </SafeAreaView>
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
});

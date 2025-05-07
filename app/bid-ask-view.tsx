import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useTradingContext } from "@/contexts/TradingContext";
import { BidAskView } from "./components/BidAskView";

export default function BidAskViewScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const router = useRouter();
  const params = useLocalSearchParams<{
    symbol: string;
    name: string;
    price: string;
  }>();
  const { getStockPrice } = useTradingContext();

  // Extract stock information from params
  const symbol = params.symbol || "";
  const stockName = params.name || "";
  const paramPrice = parseFloat(params.price || "0");

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stockData, setStockData] = useState({
    lastPrice: paramPrice,
    bidPrice: paramPrice * 0.995, // Default values
    askPrice: paramPrice * 1.005,
    bidVolume: 1000,
    askVolume: 800,
    change: 0,
    changePercent: 0,
  });

  // Function to handle back button press
  const handleBack = () => {
    router.back();
  };

  // Function to fetch and update stock data
  const fetchStockData = () => {
    // Get the current stock price and data from the context
    const data = getStockPrice(symbol);

    if (data) {
      // In a real app, this would come from an API with actual bid-ask data
      // For now, we're simulating it based on the last price
      setStockData({
        lastPrice: data.lastPrice,
        bidPrice: Math.round(data.lastPrice * 0.995 * 100) / 100,
        askPrice: Math.round(data.lastPrice * 1.005 * 100) / 100,
        // Simulate some realistic volumes with some randomness
        bidVolume: Math.floor(800 + Math.random() * 1200),
        askVolume: Math.floor(600 + Math.random() * 1000),
        change: data.change,
        changePercent: data.changePercent,
      });
    } else {
      // Fallback to default values with the param price
      setStockData({
        lastPrice: paramPrice,
        bidPrice: Math.round(paramPrice * 0.995 * 100) / 100,
        askPrice: Math.round(paramPrice * 1.005 * 100) / 100,
        bidVolume: Math.floor(800 + Math.random() * 1200),
        askVolume: Math.floor(600 + Math.random() * 1000),
        change: 0,
        changePercent: 0,
      });
    }

    setIsLoading(false);
    setRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchStockData();

    // Set up an interval to update data every few seconds
    const intervalId = setInterval(fetchStockData, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [symbol, getStockPrice]);

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchStockData();
  };

  // Format currency for display
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
          title: `${symbol} Market Depth`,
          headerBackTitle: "Back",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors[theme].text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[theme].primary} />
            <ThemedText style={styles.loadingText}>
              Loading market data...
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors[theme].primary]}
                tintColor={Colors[theme].primary}
              />
            }
          >
            {/* Stock Header */}
            <View style={styles.stockInfoContainer}>
              <View style={styles.stockHeader}>
                <View>
                  <ThemedText style={styles.stockSymbol}>{symbol}</ThemedText>
                  <ThemedText style={styles.stockName}>{stockName}</ThemedText>
                </View>
                <View style={styles.priceContainer}>
                  <ThemedText style={styles.stockPrice}>
                    {formatCurrency(stockData.lastPrice)}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.priceChange,
                      stockData.change >= 0
                        ? styles.positiveChange
                        : styles.negativeChange,
                    ]}
                  >
                    {stockData.change >= 0 ? "+" : ""}
                    {stockData.change.toFixed(2)} (
                    {stockData.change >= 0 ? "+" : ""}
                    {stockData.changePercent.toFixed(2)}%)
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Bid-Ask View */}
            <BidAskView
              bidPrice={stockData.bidPrice}
              bidVolume={stockData.bidVolume}
              askPrice={stockData.askPrice}
              askVolume={stockData.askVolume}
              lastPrice={stockData.lastPrice}
            />

            {/* Additional Info Card */}
            <ThemedView variant="elevated" style={styles.infoCard}>
              <ThemedText type="subtitle" style={styles.infoTitle}>
                About Market Depth
              </ThemedText>
              <ThemedText style={styles.infoText}>
                The bid price is the highest price a buyer is willing to pay for
                a stock. The ask price is the lowest price a seller is willing
                to accept. The spread is the difference between these prices.
              </ThemedText>
              <ThemedText style={styles.infoText}>
                Lower spreads typically indicate higher liquidity and more
                active trading. The depth chart shows the volume of orders at
                different price levels.
              </ThemedText>
              <ThemedText style={styles.infoText}>
                Pull down to refresh data.
              </ThemedText>
            </ThemedView>

            {/* Return Button - You can remove this since we now have a back button in the header */}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  priceChange: {
    fontSize: 12,
    marginTop: 4,
  },
  positiveChange: {
    color: "rgba(0, 168, 107, 1)",
  },
  negativeChange: {
    color: "rgba(255, 59, 48, 1)",
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 8,
  },
  returnButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  returnButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

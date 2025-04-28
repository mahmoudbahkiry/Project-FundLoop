import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTradingContext } from "@/contexts/TradingContext";
import { StarredStock } from "@/firebase/tradingService";

// Format currency in EGP
const formatCurrency = (value: number): string => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function StarredStocksScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const router = useRouter();
  const { starredStocks, unstarStock, getStockPrice, liveStocks } =
    useTradingContext();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set up the screen
  useEffect(() => {
    // Simulate loading stocks
    const loadStocks = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(loadStocks);
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Get stock price info from context
  const getStockInfo = (symbol: string) => {
    const stockData = getStockPrice(symbol);

    if (stockData) {
      return {
        price: stockData.lastPrice,
        change: stockData.change,
        changePercent: stockData.changePercent,
      };
    }

    // Fallback to default values if stock not found
    return { price: 0, change: 0, changePercent: 0 };
  };

  // Handle unstar
  const handleUnstar = async (stockId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await unstarStock(stockId);
    } catch (error) {
      console.error("Error unstarring stock:", error);
    }
  };

  // Handle stock selection
  const handleSelectStock = (stock: StarredStock) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const stockInfo = getStockInfo(stock.symbol);
    router.push({
      pathname: "/stock-details",
      params: {
        symbol: stock.symbol,
        name: stock.name,
        price: stockInfo.price.toString(),
        change: stockInfo.change.toString(),
        changePercent: stockInfo.changePercent.toString(),
      },
    });
  };

  // Render stock item
  const renderStockItem = ({ item }: { item: StarredStock }) => {
    const stockInfo = getStockInfo(item.symbol);
    const isPriceUp = stockInfo.change >= 0;

    return (
      <ThemedView variant="card" style={styles.stockItem}>
        <TouchableOpacity
          style={styles.stockItemContent}
          onPress={() => handleSelectStock(item)}
          activeOpacity={0.7}
        >
          <View style={styles.stockMainInfo}>
            <ThemedText type="defaultSemiBold" style={styles.stockSymbol}>
              {item.symbol}
            </ThemedText>
            <View style={styles.stockPriceRow}>
              <ThemedText type="default" style={styles.stockPrice}>
                {formatCurrency(stockInfo.price)}
              </ThemedText>
              <View
                style={[
                  styles.changeContainer,
                  {
                    backgroundColor: isPriceUp
                      ? "rgba(0, 168, 107, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.changeText,
                    { color: isPriceUp ? Colors[theme].success : "#EF4444" },
                  ]}
                >
                  {isPriceUp ? "+" : ""}
                  {stockInfo.change.toFixed(2)} (
                  {stockInfo.changePercent.toFixed(2)}%)
                </ThemedText>
              </View>
            </View>
            <ThemedText
              type="caption"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.stockName}
            >
              {item.name}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.unstarButton}
            onPress={() => handleUnstar(item.id || "")}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="star" size={24} color="#FFB800" />
          </TouchableOpacity>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  // Render header component
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.headerTitle}>
          {starredStocks.length}{" "}
          {starredStocks.length === 1 ? "stock" : "stocks"}
        </ThemedText>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors[theme].primary} />
          <ThemedText style={styles.emptyText}>
            Loading starred stocks...
          </ThemedText>
        </View>
      );
    }

    return (
      <ThemedView variant="card" style={styles.emptyStateCard}>
        <Ionicons
          name="star-outline"
          size={64}
          color="#FFB800"
          style={styles.emptyIcon}
        />
        <ThemedText type="subtitle" style={styles.emptyText}>
          No starred stocks yet
        </ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Add stocks to your watchlist to quickly track their performance
        </ThemedText>
        <TouchableOpacity
          style={[
            styles.browseButton,
            { backgroundColor: Colors[theme].primary },
          ]}
          onPress={() => router.push("/trading")}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <ThemedText style={styles.browseButtonText}>Browse Stocks</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack.Screen
        options={{
          title: "Your Watchlist",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors[theme].background,
          },
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
          headerBackVisible: true,
          headerBackTitle: "Back",
        }}
      />

      <ThemedView style={styles.container}>
        <FlatList
          data={starredStocks}
          renderItem={renderStockItem}
          keyExtractor={(item) => item.id || `stock-${item.symbol}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={starredStocks.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors[theme].primary]}
              tintColor={Colors[theme].primary}
            />
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background, // This will be overridden by ThemedView
  },
  container: {
    flex: 1,
    paddingTop: 0,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  stockItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stockItemContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  stockMainInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  stockPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockName: {
    fontSize: 14,
    opacity: 0.7,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  unstarButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    minHeight: 400,
  },
  emptyStateCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    minHeight: 320,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

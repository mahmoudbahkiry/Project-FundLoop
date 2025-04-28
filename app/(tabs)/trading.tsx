import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  useTradingContext,
  Position,
  Order,
  Stock,
} from "@/contexts/TradingContext";

// Format currency in EGP
const formatCurrency = (value: number): string => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Helper function to generate random price change (between -0.5% and +0.5%)
const getRandomPriceChange = (currentPrice: number): number => {
  // Random percentage between -0.5% and +0.5%
  const randomPercent = (Math.random() - 0.5) * 1;
  // Calculate actual change amount
  const changeAmount = currentPrice * (randomPercent / 100);
  // Return new price with 2 decimal places
  return Math.round((currentPrice + changeAmount) * 100) / 100;
};

// Types
interface Alert {
  id: string;
  type: "drawdown" | "position" | "rule";
  message: string;
  severity: "warning" | "critical";
}

export default function TradingScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const router = useRouter();
  const {
    positions,
    orders,
    closePosition,
    loading: tradingDataLoading,
    starredStocks,
    liveStocks, // Use centralized live stock data
  } = useTradingContext();

  // State
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("positions");
  const [alertsVisible, setAlertsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sell confirmation modal state
  const [sellConfirmVisible, setSellConfirmVisible] = useState(false);
  const [positionToSell, setPositionToSell] = useState<Position | null>(null);

  // Mock alerts
  const alerts: Alert[] = [
    {
      id: "1",
      type: "drawdown",
      message: "Account drawdown approaching 3% daily limit",
      severity: "warning",
    },
    {
      id: "2",
      type: "position",
      message: "Position size for COMI exceeds 5% of account balance",
      severity: "warning",
    },
    {
      id: "3",
      type: "rule",
      message: "Trading outside allowed market hours",
      severity: "critical",
    },
  ];

  // Handle manual refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    // Wait a moment to simulate network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Add an effect to refresh positions display when liveStocks change
  useEffect(() => {
    // This empty effect will trigger re-renders when liveStocks change,
    // ensuring position cards show the latest prices and P&L calculations
  }, [liveStocks]);

  // Filter stocks based on search query
  const filteredStocks = liveStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate profit/loss for a position
  const calculatePnL = (position: Position) => {
    const diff =
      position.type === "buy"
        ? position.currentPrice - position.entryPrice
        : position.entryPrice - position.currentPrice;
    return diff * position.quantity;
  };

  // Calculate profit/loss percentage
  const calculatePnLPercent = (position: Position) => {
    const diff =
      position.type === "buy"
        ? position.currentPrice - position.entryPrice
        : position.entryPrice - position.currentPrice;
    return (diff / position.entryPrice) * 100;
  };

  // Render stock item
  const renderStockItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity
      style={[
        styles.stockItem,
        selectedStock?.symbol === item.symbol && styles.selectedStockItem,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedStock(item);
        router.push({
          pathname: "/stock-details",
          params: {
            symbol: item.symbol,
            name: item.name,
            price: item.lastPrice.toString(),
            change: item.change.toString(),
            changePercent: item.changePercent.toString(),
          },
        });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.stockSymbolContainer}>
        <ThemedText type="defaultSemiBold">{item.symbol}</ThemedText>
        <ThemedText
          type="caption"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.stockName}
        >
          {item.name}
        </ThemedText>
      </View>
      <View style={styles.stockPriceContainer}>
        <ThemedText type="defaultSemiBold">
          {formatCurrency(item.lastPrice)}
        </ThemedText>
        <ThemedText
          style={[
            styles.changeText,
            { color: item.change >= 0 ? Colors[theme].success : "#EF4444" },
          ]}
        >
          {item.change >= 0 ? "+" : ""}
          {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  // Render position item
  const renderPositionItem = ({ item }: { item: Position }) => {
    // Get the most up-to-date stock price
    const currentStock = liveStocks.find(
      (stock) => stock.symbol === item.symbol
    );
    const currentPrice = currentStock
      ? currentStock.lastPrice
      : item.currentPrice;

    // Use current stock price for calculations instead of position.currentPrice
    const pnl =
      item.type === "buy"
        ? (currentPrice - item.entryPrice) * item.quantity
        : (item.entryPrice - currentPrice) * item.quantity;

    const pnlPercent =
      item.type === "buy"
        ? ((currentPrice - item.entryPrice) / item.entryPrice) * 100
        : ((item.entryPrice - currentPrice) / item.entryPrice) * 100;

    const isProfitable = pnl > 0;
    const priceUpdated =
      currentStock && Math.abs(currentPrice - item.currentPrice) > 0.001;

    return (
      <ThemedView
        variant="innerCard"
        style={[
          styles.positionItem,
          { borderLeftColor: Colors[theme].primary },
        ]}
      >
        {/* Top Section: Symbol, Type Badge, and Performance */}
        <View style={styles.positionTop}>
          <View style={styles.positionTopLeft}>
            <View style={styles.positionSymbolContainer}>
              <ThemedText type="heading" style={styles.positionSymbol}>
                {item.symbol}
              </ThemedText>
              <View
                style={[
                  styles.positionTypeBadge,
                  {
                    backgroundColor:
                      item.type === "buy"
                        ? "rgba(0, 168, 107, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color:
                      item.type === "buy" ? Colors[theme].success : "#EF4444",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {item.type.toUpperCase()}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.positionQuantity}>
              {item.quantity} shares
            </ThemedText>
          </View>
          <View style={styles.positionTopRight}>
            <ThemedText
              style={[
                styles.positionPnL,
                {
                  color: isProfitable ? Colors[theme].success : "#EF4444",
                },
              ]}
            >
              {isProfitable ? "+" : ""}
              {formatCurrency(pnl)}
            </ThemedText>
            <ThemedText
              style={[
                styles.positionPnLPercent,
                {
                  color: isProfitable ? Colors[theme].success : "#EF4444",
                },
              ]}
            >
              {isProfitable ? "+" : ""}
              {pnlPercent.toFixed(2)}%
            </ThemedText>
          </View>
        </View>

        {/* Middle Section: Prices */}
        <View style={styles.positionPrices}>
          <View style={styles.priceItem}>
            <ThemedText type="caption">Entry Price</ThemedText>
            <ThemedText style={styles.priceValue}>
              {formatCurrency(item.entryPrice)}
            </ThemedText>
          </View>
          <View style={styles.priceIndicator}>
            <Ionicons
              name={isProfitable ? "arrow-up" : "arrow-down"}
              size={20}
              color={isProfitable ? Colors[theme].success : "#EF4444"}
            />
          </View>
          <View style={styles.priceItem}>
            <ThemedText type="caption">Current Price</ThemedText>
            <View style={styles.priceValueContainer}>
              <ThemedText style={styles.priceValue}>
                {formatCurrency(currentPrice)}
              </ThemedText>
              {priceUpdated && (
                <Ionicons
                  name="sync-outline"
                  size={12}
                  color={Colors[theme].primary}
                  style={styles.syncIcon}
                />
              )}
            </View>
          </View>
        </View>

        {/* Bottom Section: Date and Sell Button */}
        <View style={styles.positionBottom}>
          <ThemedText type="caption" style={styles.positionDate}>
            Opened{" "}
            {new Date(item.openTime).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </ThemedText>
          <TouchableOpacity
            style={[styles.sellButton, { backgroundColor: "#EF4444" }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Pass the original position object to avoid state inconsistencies
              // The closePosition function will handle getting the latest price
              setPositionToSell(item);
              setSellConfirmVisible(true);
            }}
          >
            <Ionicons
              name="cash-outline"
              size={16}
              color="white"
              style={{ marginRight: 4 }}
            />
            <ThemedText style={styles.sellButtonText}>Sell</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  // Group orders by date
  const groupOrdersByDate = (orders: Order[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    // Sort orders by time (newest first)
    const sortedOrders = [...orders].sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    const groups: { title: string; data: Order[] }[] = [
      { title: "Today", data: [] },
      { title: "Yesterday", data: [] },
      { title: "This Week", data: [] },
      { title: "Earlier", data: [] },
    ];

    sortedOrders.forEach((order) => {
      const orderDate = new Date(order.time);

      if (orderDate >= today) {
        groups[0].data.push(order);
      } else if (orderDate >= yesterday) {
        groups[1].data.push(order);
      } else if (orderDate >= thisWeekStart) {
        groups[2].data.push(order);
      } else {
        groups[3].data.push(order);
      }
    });

    // Remove empty groups
    return groups.filter((group) => group.data.length > 0);
  };

  // Format order time
  const formatOrderTime = (timeString: string) => {
    const orderDate = new Date(timeString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // For today's orders, show only time
    if (orderDate >= today) {
      return orderDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    // For yesterday and older, show date and time
    return orderDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => {
    const formattedTime = formatOrderTime(item.time);
    const statusColor =
      item.status === "filled"
        ? Colors[theme].success
        : item.status === "pending"
        ? "#EAB308"
        : "#EF4444";

    const orderTypeColor =
      item.type === "buy" ? Colors[theme].success : "#EF4444";

    return (
      <ThemedView
        variant="innerCard"
        style={[
          styles.orderItem,
          { borderLeftWidth: 4, borderLeftColor: Colors[theme].primary },
        ]}
      >
        {/* Top Section: Symbol, Type/Status, and Time */}
        <View style={styles.orderTop}>
          <View style={styles.orderTopLeft}>
            <ThemedText type="heading" style={styles.orderSymbol}>
              {item.symbol}
            </ThemedText>
            <View style={styles.orderTypeContainer}>
              <View
                style={[
                  styles.orderTypeBadge,
                  {
                    backgroundColor:
                      item.type === "buy"
                        ? "rgba(0, 168, 107, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color: orderTypeColor,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {item.type.toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText type="caption" style={styles.orderTypeLabel}>
                {item.orderType}
              </ThemedText>
            </View>
          </View>

          <View style={styles.orderTopRight}>
            <View
              style={[
                styles.orderStatusBadge,
                {
                  backgroundColor:
                    item.status === "filled"
                      ? "rgba(0, 168, 107, 0.1)"
                      : item.status === "pending"
                      ? "rgba(234, 179, 8, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                },
              ]}
            >
              <Ionicons
                name={
                  item.status === "filled"
                    ? "checkmark-circle"
                    : item.status === "pending"
                    ? "time"
                    : "close-circle"
                }
                size={16}
                color={statusColor}
                style={{ marginRight: 4 }}
              />
              <ThemedText
                style={{
                  color: statusColor,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {item.status.toUpperCase()}
              </ThemedText>
            </View>

            <ThemedText type="caption" style={styles.orderTime}>
              {formattedTime}
            </ThemedText>
          </View>
        </View>

        {/* Middle Section: Price and Quantity */}
        <View style={styles.orderMiddle}>
          <View style={styles.priceQuantityContainer}>
            <View style={styles.orderValueItem}>
              <ThemedText type="caption">Price</ThemedText>
              <ThemedText style={styles.orderValueText}>
                {formatCurrency(
                  item.status === "filled" && item.executionPrice
                    ? item.executionPrice
                    : item.price
                )}
              </ThemedText>
            </View>

            <View style={styles.orderValueItem}>
              <ThemedText type="caption">Quantity</ThemedText>
              <ThemedText style={styles.orderValueText}>
                {item.quantity.toLocaleString()} shares
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Bottom Section: Order Details */}
        <View style={styles.orderBottom}>
          <View style={styles.orderDetail}>
            <ThemedText type="caption">Order ID</ThemedText>
            <ThemedText
              style={styles.orderDetailValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.id}
            </ThemedText>
          </View>

          <View style={styles.orderTotalValue}>
            <ThemedText type="caption">Total Value</ThemedText>
            <ThemedText
              style={[styles.orderTotalText, { color: orderTypeColor }]}
            >
              {formatCurrency(
                (item.status === "filled" && item.executionPrice
                  ? item.executionPrice
                  : item.price) * item.quantity
              )}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  };

  // Render alert item
  const renderAlertItem = ({ item }: { item: Alert }) => (
    <ThemedView
      variant="card"
      style={[
        styles.alertItem,
        {
          borderLeftWidth: 4,
          borderLeftColor: item.severity === "critical" ? "#EF4444" : "#EAB308",
        },
      ]}
    >
      <View style={styles.alertIconContainer}>
        <Ionicons
          name={item.severity === "critical" ? "alert-circle" : "warning"}
          size={24}
          color={item.severity === "critical" ? "#EF4444" : "#EAB308"}
        />
      </View>
      <View style={styles.alertContent}>
        <ThemedText type="defaultSemiBold">
          {item.type === "drawdown"
            ? "Drawdown Warning"
            : item.type === "position"
            ? "Position Size Warning"
            : "Trading Rule Violation"}
        </ThemedText>
        <ThemedText type="caption">{item.message}</ThemedText>
      </View>
    </ThemedView>
  );

  // Render positions and orders sections with loading states
  const renderPositionsSection = () => {
    if (tradingDataLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[theme].primary} />
          <ThemedText style={styles.loadingText}>
            Loading positions...
          </ThemedText>
        </View>
      );
    }

    if (positions.length === 0) {
      return (
        <ThemedView variant="card" style={styles.emptyState}>
          <Ionicons
            name="wallet-outline"
            size={32}
            color={Colors[theme].icon}
          />
          <ThemedText style={styles.emptyStateText}>
            No open positions
          </ThemedText>
        </ThemedView>
      );
    }

    return positions.map((position) => (
      <React.Fragment key={position.id}>
        {renderPositionItem({ item: position })}
      </React.Fragment>
    ));
  };

  const renderOrdersSection = () => {
    if (tradingDataLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[theme].primary} />
          <ThemedText style={styles.loadingText}>
            Loading order history...
          </ThemedText>
        </View>
      );
    }

    if (orders.length === 0) {
      return (
        <ThemedView variant="card" style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={32}
            color={Colors[theme].icon}
          />
          <ThemedText style={styles.emptyStateText}>
            No order history
          </ThemedText>
        </ThemedView>
      );
    }

    return groupOrdersByDate(orders).map((group, index) => (
      <View key={index} style={styles.orderGroup}>
        <View style={styles.orderGroupHeader}>
          <ThemedText type="defaultSemiBold" style={styles.orderGroupTitle}>
            {group.title}
          </ThemedText>
          <ThemedText type="caption" style={styles.orderGroupCount}>
            {group.data.length} {group.data.length === 1 ? "order" : "orders"}
          </ThemedText>
        </View>

        {group.data.map((order) => (
          <React.Fragment key={order.id}>
            {renderOrderItem({ item: order })}
          </React.Fragment>
        ))}
      </View>
    ));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <ThemedText type="heading" style={styles.headerTitle}>
            Trading
          </ThemedText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.starredButton}
            onPress={() => router.push("/starred-stocks")}
          >
            {starredStocks.length > 0 && (
              <View style={styles.starredBadge}>
                <ThemedText style={styles.starredBadgeText}>
                  {starredStocks.length}
                </ThemedText>
              </View>
            )}
            <Ionicons name="star" size={24} color="#FFB800" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.alertButton}
            onPress={() => setAlertsVisible(true)}
          >
            {alerts.some((alert) => alert.severity === "critical") && (
              <View style={styles.alertBadge}>
                <ThemedText style={styles.alertBadgeText}>
                  {alerts.length}
                </ThemedText>
              </View>
            )}
            <Ionicons
              name="warning"
              size={24}
              color={
                alerts.some((alert) => alert.severity === "critical")
                  ? "#EF4444"
                  : alerts.length > 0
                  ? "#EAB308"
                  : Colors[theme].primary
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors[theme].primary]}
            tintColor={Colors[theme].primary}
          />
        }
      >
        {/* Market Overview Card */}
        <ThemedView variant="elevated" style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Market Watch
            </ThemedText>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={Colors[theme].icon}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: Colors[theme].text }]}
              placeholder="Search stocks..."
              placeholderTextColor={Colors[theme].icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.stocksHeader}>
            <ThemedText type="caption" style={styles.stocksHeaderSymbol}>
              Symbol
            </ThemedText>
            <ThemedText type="caption" style={styles.stocksHeaderPrice}>
              Price
            </ThemedText>
          </View>

          <FlatList
            data={filteredStocks}
            renderItem={renderStockItem}
            keyExtractor={(item) => item.symbol}
            style={styles.stocksList}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.stocksListContent}
            removeClippedSubviews={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </ThemedView>

        {/* Positions and Orders Card */}
        <ThemedView variant="elevated" style={styles.card}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "positions" && [
                  styles.activeTab,
                  {
                    backgroundColor:
                      currentTheme === "dark" ? "#333333" : "#fff",
                  },
                ],
              ]}
              onPress={() => setActiveTab("positions")}
            >
              <ThemedText
                style={
                  activeTab === "positions"
                    ? [
                        styles.activeTabText,
                        { color: Colors[currentTheme].primary },
                      ]
                    : {}
                }
              >
                Positions
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "orders" && [
                  styles.activeTab,
                  {
                    backgroundColor:
                      currentTheme === "dark" ? "#333333" : "#fff",
                  },
                ],
              ]}
              onPress={() => setActiveTab("orders")}
            >
              <ThemedText
                style={
                  activeTab === "orders"
                    ? [
                        styles.activeTabText,
                        { color: Colors[currentTheme].primary },
                      ]
                    : {}
                }
              >
                Order History
              </ThemedText>
            </TouchableOpacity>
          </View>

          {activeTab === "positions" ? (
            <View style={styles.positionsContainer}>
              {renderPositionsSection()}
            </View>
          ) : (
            <View style={styles.ordersContainer}>{renderOrdersSection()}</View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Risk Management Alerts Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={alertsVisible}
        onRequestClose={() => setAlertsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Risk Management Alerts</ThemedText>
              <TouchableOpacity onPress={() => setAlertsVisible(false)}>
                <Ionicons name="close" size={24} color={Colors[theme].text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.alertsContainer}>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <React.Fragment key={alert.id}>
                    {renderAlertItem({ item: alert })}
                  </React.Fragment>
                ))
              ) : (
                <ThemedView variant="card" style={styles.emptyState}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={32}
                    color={Colors[theme].success}
                  />
                  <ThemedText style={styles.emptyStateText}>
                    No active alerts
                  </ThemedText>
                </ThemedView>
              )}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>

      {/* Sell Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sellConfirmVisible}
        onRequestClose={() => setSellConfirmVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Confirm Sell Order
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSellConfirmVisible(false)}
              >
                <Ionicons name="close" size={24} color={Colors[theme].icon} />
              </TouchableOpacity>
            </View>

            {positionToSell && (
              <View style={styles.sellModalContent}>
                {/* Get the latest price from liveStocks */}
                {(() => {
                  const currentStock = liveStocks.find(
                    (stock) => stock.symbol === positionToSell.symbol
                  );
                  const currentPrice = currentStock
                    ? currentStock.lastPrice
                    : positionToSell.currentPrice;

                  // Calculate PnL with the latest price
                  const pnl =
                    positionToSell.type === "buy"
                      ? (currentPrice - positionToSell.entryPrice) *
                        positionToSell.quantity
                      : (positionToSell.entryPrice - currentPrice) *
                        positionToSell.quantity;

                  const isProfitable = pnl > 0;
                  const priceUpdated =
                    currentStock &&
                    Math.abs(currentPrice - positionToSell.currentPrice) >
                      0.001;

                  return (
                    <>
                      <ThemedText style={styles.confirmText}>
                        Are you sure you want to sell{" "}
                        <ThemedText style={styles.highlightText}>
                          {positionToSell.quantity}
                        </ThemedText>{" "}
                        shares of{" "}
                        <ThemedText style={styles.symbolText}>
                          {positionToSell.symbol}
                        </ThemedText>
                        ?
                      </ThemedText>

                      <View style={styles.sellDetailsCard}>
                        <View style={styles.sellDetailRow}>
                          <ThemedText style={styles.sellDetailLabel}>
                            Entry Price:
                          </ThemedText>
                          <ThemedText style={styles.sellDetailValue}>
                            {formatCurrency(positionToSell.entryPrice)}
                          </ThemedText>
                        </View>

                        <View style={styles.sellDetailRow}>
                          <ThemedText style={styles.sellDetailLabel}>
                            Current Price:
                          </ThemedText>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <ThemedText style={styles.sellDetailValue}>
                              {formatCurrency(currentPrice)}
                            </ThemedText>
                            {priceUpdated && (
                              <Ionicons
                                name="sync-outline"
                                size={12}
                                color={Colors[theme].primary}
                                style={{ marginLeft: 4 }}
                              />
                            )}
                          </View>
                        </View>

                        <View style={styles.sellDetailRow}>
                          <ThemedText style={styles.sellDetailLabel}>
                            Profit/Loss:
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.sellDetailValue,
                              {
                                color: isProfitable
                                  ? Colors[theme].success
                                  : "#EF4444",
                              },
                            ]}
                          >
                            {isProfitable ? "+" : ""}
                            {formatCurrency(pnl)}
                          </ThemedText>
                        </View>

                        <View
                          style={[styles.sellDetailRow, styles.totalValueRow]}
                        >
                          <ThemedText style={styles.totalValueLabel}>
                            Total Value:
                          </ThemedText>
                          <ThemedText style={styles.totalValueAmount}>
                            {formatCurrency(
                              currentPrice * positionToSell.quantity
                            )}
                          </ThemedText>
                        </View>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSellConfirmVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (positionToSell?.id) {
                    // Close position directly - the context will handle the sale with the current price
                    closePosition(positionToSell.id);
                  }
                  setSellConfirmVisible(false);
                }}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Confirm
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Header styles
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flex: 1,
  },
  headerTitle: {
    color: "#2ECC71",
    fontSize: 32,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  starredButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  alertBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  alertBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 18,
    paddingBottom: 1, // Slight adjustment to vertically center the text
  },
  starredBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FFB800",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  starredBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 18,
    paddingBottom: 1,
  },

  // Card styles
  card: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
  },

  // Market Watch styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  stocksHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 4,
  },
  stocksHeaderSymbol: {
    flex: 3,
    fontWeight: "500",
  },
  stocksHeaderPrice: {
    flex: 2,
    textAlign: "right",
    fontWeight: "500",
  },
  stocksList: {
    maxHeight: 300,
  },
  stocksListContent: {
    paddingRight: 4,
  },
  stockItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    marginBottom: 2,
  },
  selectedStockItem: {
    backgroundColor: "rgba(0, 168, 107, 0.1)",
    borderRadius: 8,
  },
  stockSymbolContainer: {
    flex: 3,
    paddingRight: 8,
  },
  stockName: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  stockPriceContainer: {
    flex: 2,
    alignItems: "flex-end",
  },
  changeText: {
    fontSize: 12,
    marginTop: 2,
  },

  // Tabs styles
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  activeTabText: {
    fontWeight: "600",
  },

  // Positions and orders styles
  positionsContainer: {
    gap: 16,
  },
  ordersContainer: {
    gap: 16,
  },
  orderGroup: {
    marginBottom: 16,
  },
  orderGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  orderGroupTitle: {
    fontSize: 14,
  },
  orderGroupCount: {
    opacity: 0.6,
  },
  positionItem: {
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  positionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  positionTopLeft: {
    flex: 1,
  },
  positionTopRight: {
    alignItems: "flex-end",
  },
  positionSymbolContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  positionSymbol: {
    fontSize: 20,
    fontWeight: "700",
  },
  positionQuantity: {
    fontSize: 14,
    opacity: 0.7,
  },
  positionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  positionPnL: {
    fontSize: 18,
    fontWeight: "700",
  },
  positionPnLPercent: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  positionPrices: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  priceItem: {
    flex: 1,
  },
  priceValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  syncIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  priceIndicator: {
    width: 40,
    alignItems: "center",
  },
  positionBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  positionDate: {
    opacity: 0.6,
  },
  sellButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sellButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  orderItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderTopLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  orderTopRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  orderTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  orderSymbol: {
    fontSize: 16,
    fontWeight: "700",
  },
  orderTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  orderTypeLabel: {
    opacity: 0.7,
  },
  orderStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  orderTime: {
    marginTop: 2,
    opacity: 0.7,
  },
  orderMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceQuantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderValueItem: {
    flex: 1,
  },
  orderValueText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  orderBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  orderDetail: {
    alignItems: "flex-start",
    width: "48%",
    marginBottom: 8,
  },
  orderDetailValue: {
    marginTop: 4,
    fontWeight: "500",
    flexShrink: 1,
  },
  orderTotalValue: {
    alignItems: "flex-end",
  },
  orderTotalText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Alert styles
  alertItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  alertIconContainer: {
    marginRight: 12,
    alignSelf: "center",
  },
  alertContent: {
    flex: 1,
  },

  // Empty state styles
  emptyState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  emptyStateText: {
    marginTop: 8,
    opacity: 0.7,
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
  alertsContainer: {
    paddingHorizontal: 20,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // Add new styles for loading states
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    opacity: 0.7,
  },

  // Sell confirmation modal styles
  sellModalContent: {
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

  // Button styles
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
    backgroundColor: "#EF4444",
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
});

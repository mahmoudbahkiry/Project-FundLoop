import React, { useState, useEffect, Component } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Text,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTradingContext, Stock } from "@/contexts/TradingContext";

const { width: screenWidth } = Dimensions.get("window");

// Error Boundary for chart components
class ChartErrorBoundary extends Component<
  { children: React.ReactNode; theme: "light" | "dark" },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; theme: "light" | "dark" }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Chart Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.chartErrorContainer}>
          <Ionicons
            name="warning-outline"
            size={32}
            color={Colors[this.props.theme].icon}
          />
          <Text
            style={[
              styles.chartErrorText,
              { color: Colors[this.props.theme].text },
            ]}
          >
            There was an issue displaying the chart.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Types
interface StockData {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  peRatio?: number;
  dividendYield?: number;
  bid?: number;
  ask?: number;
  marketStatus: "open" | "closed";
}

interface ChartDataPoint {
  timestamp: number;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export default function StockDetailsScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const router = useRouter();
  const params = useLocalSearchParams<{
    symbol: string;
    price?: string;
    change?: string;
    changePercent?: string;
    name?: string;
  }>();
  const { starStock, unstarStock, isStarred, starredStocks, liveStocks } =
    useTradingContext();
  const symbol = params.symbol || "COMI";

  // State
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">(
    "1D"
  );
  const [chartType, setChartType] = useState<"line" | "candle">("line");
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartDataCache, setChartDataCache] = useState<
    Record<string, Record<string, ChartDataPoint[]>>
  >({});
  const [starred, setStarred] = useState(false);

  // Company descriptions for each stock
  const companyDescriptions: Record<string, string> = {
    COMI: "Commercial International Bank (CIB) is Egypt's leading private sector bank, offering a comprehensive range of financial products and services to enterprises and individuals. Founded in 1975, CIB operates primarily in Corporate Banking, Retail Banking, and Investment Banking with an extensive network across Egypt.",
    HRHO: "Hermes Holding is a leading investment bank in the Middle East and North Africa. Established in 1984, the company offers investment banking, asset management, securities brokerage, research and private equity services to clients across the region.",
    TMGH: "Talaat Moustafa Group Holding is one of the largest real estate developers in Egypt. The company specializes in developing integrated residential communities, hotels, resorts, and commercial properties across Egypt, particularly known for its flagship projects like Madinaty and Al Rehab City.",
    SWDY: "Elsewedy Electric is a global provider of energy solutions. Founded in 1938, it has grown to become a leader in electrical components, cables, and integrated energy solutions with operations in more than 30 countries and a focus on sustainable energy.",
    EAST: "Eastern Company is Egypt's largest tobacco producer, manufacturing cigarettes and other tobacco products. Established in 1920, it is one of the oldest industrial entities in Egypt with a dominant market share in the local tobacco market.",
    EFIH: "EFG Hermes Holding operates in investment banking, asset management, securities brokerage, research and private equity. It is one of the largest financial services corporations in the Middle East with a growing presence in frontier markets.",
    ETEL: "Telecom Egypt is the country's primary telephone company, providing fixed-line, mobile, and internet services. It is Egypt's first integrated telecom operator and owns a significant stake in Vodafone Egypt.",
    AMOC: "Alexandria Mineral Oils Company is a key player in Egypt's petroleum sector, specializing in the production of essential petroleum products and derivatives. It supplies the local market with various oil products and exports to international markets.",
    SKPC: "Sidi Kerir Petrochemicals produces and markets ethylene, polyethylene, and related products. It is one of Egypt's largest petrochemical companies, serving both domestic and international markets.",
    ESRS: "Ezz Steel is Egypt's largest steel producer and one of the leading steel companies in the Middle East and North Africa region. The company manufactures and distributes a wide range of steel products for construction and industrial use.",
    ORWE: "Oriental Weavers is the world's largest producer of machine-made carpets with manufacturing facilities in Egypt, the United States, and China. The company exports to over 130 countries worldwide.",
    MNHD: "Madinet Nasr Housing & Development is a leading urban developer specializing in premium residential communities in Egypt. The company has a land bank in prime locations across Greater Cairo.",
    PHDC: "Palm Hills Developments is one of Egypt's premier real estate developers, focusing on luxury residential, commercial and resort projects. The company has developed multiple properties across Cairo, Alexandria, and the North Coast.",
    HELI: "Heliopolis Housing and Development is one of Egypt's oldest real estate development companies, established in 1906. It develops and manages residential, commercial, and leisure properties primarily in the Heliopolis area of Cairo.",
    JUFO: "Juhayna Food Industries is Egypt's leading manufacturer of dairy, yogurt, and juice products. Founded in 1983, it has grown to become one of the most recognized food brands in Egypt and the wider Middle East region.",
  };

  // Simplified initialization function that runs only once
  useEffect(() => {
    const initializeStockData = () => {
      try {
        // Get initial values from params or live data
        let stockInfo = {
          symbol: symbol,
          name: params.name || "",
          lastPrice: Number(params.price) || 0,
          change: Number(params.change) || 0,
          changePercent: Number(params.changePercent) || 0,
        };

        // Try to find the stock in live stocks first
        const liveStock = liveStocks.find((s) => s.symbol === symbol);
        if (liveStock) {
          stockInfo = {
            symbol: symbol,
            name: liveStock.name,
            lastPrice: liveStock.lastPrice,
            change: liveStock.change,
            changePercent: liveStock.changePercent,
          };
        }
        // If we don't have live data or params, use default
        else if (!stockInfo.name || !stockInfo.lastPrice) {
          // Default values based on symbol
          const symbolToInfo = {
            COMI: {
              name: "Commercial International Bank",
              price: 52.75,
              change: 0.75,
              changePercent: 1.44,
            },
            HRHO: {
              name: "Hermes Holding",
              price: 18.3,
              change: -0.2,
              changePercent: -1.08,
            },
            TMGH: {
              name: "Talaat Moustafa Group",
              price: 9.45,
              change: 0.15,
              changePercent: 1.61,
            },
            SWDY: {
              name: "Elsewedy Electric",
              price: 12.8,
              change: -0.1,
              changePercent: -0.78,
            },
            EAST: {
              name: "Eastern Company",
              price: 15.2,
              change: 0.3,
              changePercent: 2.01,
            },
            // Add other symbols as needed
          };

          const defaultInfo = symbolToInfo[
            symbol as keyof typeof symbolToInfo
          ] || {
            name: "Unknown Stock",
            price: 50.0,
            change: 0,
            changePercent: 0,
          };

          stockInfo = {
            symbol: symbol,
            name: defaultInfo.name,
            lastPrice: defaultInfo.price,
            change: defaultInfo.change,
            changePercent: defaultInfo.changePercent,
          };
        }

        // Create complete stock data object
        const price = stockInfo.lastPrice;
        const fullStockData: StockData = {
          symbol: symbol,
          name: stockInfo.name,
          lastPrice: price,
          change: stockInfo.change,
          changePercent: stockInfo.changePercent,
          volume: 1245000 + symbol.charCodeAt(0) * 10000,
          open: price * 0.99,
          previousClose: price - stockInfo.change,
          dayHigh: price * 1.02,
          dayLow: price * 0.98,
          yearHigh: price * 1.3,
          yearLow: price * 0.7,
          marketCap: price * 1000000000 * (1 + symbol.length / 10),
          peRatio: 8.5 + (symbol.charCodeAt(0) % 10),
          dividendYield: (3.2 + (symbol.charCodeAt(1) % 5)) / 2,
          marketStatus: "open",
          bid: price - 0.05,
          ask: price + 0.05,
        };

        // Generate chart data for the current symbol
        const generateChartData = (tf: "1D" | "1W" | "1M" | "3M" | "1Y") => {
          const now = new Date();
          const data: ChartDataPoint[] = [];
          let points = 0;
          let startDate = new Date();

          switch (tf) {
            case "1D":
              points = 24;
              startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              break;
            case "1W":
              points = 7;
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "1M":
              points = 30;
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              break;
            case "3M":
              points = 12;
              startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
              break;
            case "1Y":
              points = 12;
              startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
              break;
          }

          // Deterministic values based on symbol
          const symbolSum = symbol
            .split("")
            .reduce((sum, char) => sum + char.charCodeAt(0), 0);
          const volatilityFactor = (symbolSum % 10) / 20;
          const trendFactor = ((symbolSum % 20) - 10) / 100;
          const priceBase = price - stockInfo.change;

          let lastValue = priceBase;
          for (let i = 0; i <= points; i++) {
            const pointDate = new Date(
              startDate.getTime() +
                (i * (now.getTime() - startDate.getTime())) / points
            );

            // Deterministic pattern
            const hashValue =
              ((symbolSum * (i + 1) * (tf.length + 1)) % 100) / 100;
            const deterministicChange =
              (hashValue * 2 - 1) * volatilityFactor * priceBase;
            const trend = (i / points) * trendFactor * price;

            let pointValue;
            if (i === points) {
              pointValue = price;
            } else {
              pointValue = lastValue + deterministicChange + trend / points;
              lastValue = pointValue;
            }

            // Candlestick data
            const openFactor = ((symbolSum + i) % 10) / 1000;
            const open = pointValue * (1 - openFactor * volatilityFactor);
            const close = i === points ? price : pointValue;
            const highFactor = ((symbolSum + i * 2) % 10) / 1000;
            const high =
              Math.max(open, close) * (1 + highFactor * volatilityFactor);
            const lowFactor = ((symbolSum + i * 3) % 10) / 1000;
            const low =
              Math.min(open, close) * (1 - lowFactor * volatilityFactor);

            data.push({
              timestamp: pointDate.getTime(),
              value: pointValue,
              open,
              high,
              low,
              close,
            });
          }

          return data;
        };

        // Generate and cache chart data for all timeframes
        const cache: Record<string, ChartDataPoint[]> = {};
        const allTimeframes: ("1D" | "1W" | "1M" | "3M" | "1Y")[] = [
          "1D",
          "1W",
          "1M",
          "3M",
          "1Y",
        ];

        allTimeframes.forEach((tf) => {
          cache[tf] = generateChartData(tf);
        });

        // Update state
        setStockData(fullStockData);
        setChartDataCache((prev) => ({ ...prev, [symbol]: cache }));
        setChartData(cache[timeframe]);
        setStarred(isStarred(symbol));
        setLoading(false);
      } catch (err) {
        console.error("Error initializing stock data:", err);
        setError("Failed to load stock data. Please try again.");
        setLoading(false);
      }
    };

    // Introduce a small delay to simulate loading
    const timer = setTimeout(() => {
      initializeStockData();
    }, 500);

    return () => clearTimeout(timer);
    // Include the dependencies explicitly needed for initialization
  }, [symbol, params, liveStocks, timeframe, isStarred]);

  // Separate effect for updating prices from live data
  useEffect(() => {
    if (!loading && stockData) {
      const liveStock = liveStocks.find((s) => s.symbol === symbol);
      if (liveStock) {
        setStockData((prev) => {
          if (!prev) return prev;

          // Only update if price changed
          if (prev.lastPrice === liveStock.lastPrice) return prev;

          return {
            ...prev,
            lastPrice: liveStock.lastPrice,
            change: liveStock.change,
            changePercent: liveStock.changePercent,
            bid: liveStock.bid || prev.bid,
            ask: liveStock.ask || prev.ask,
            dayHigh: Math.max(prev.dayHigh, liveStock.lastPrice),
            dayLow: Math.min(prev.dayLow, liveStock.lastPrice),
          };
        });
      }
    }
  }, [liveStocks, loading, symbol]);

  // Update chart data when timeframe changes
  useEffect(() => {
    if (chartDataCache[symbol] && chartDataCache[symbol][timeframe]) {
      const cachedData = [...chartDataCache[symbol][timeframe]];

      // Update the last data point with the current live price if available
      if (stockData && cachedData.length > 0) {
        const lastIndex = cachedData.length - 1;
        cachedData[lastIndex] = {
          ...cachedData[lastIndex],
          value: stockData.lastPrice,
          close: stockData.lastPrice,
        };
      }

      setChartData(cachedData);
    }
  }, [timeframe, chartDataCache, stockData?.lastPrice, symbol]);

  // Check if stock is starred
  useEffect(() => {
    if (symbol) {
      setStarred(isStarred(symbol));
    }
  }, [isStarred, symbol, starredStocks]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[theme].primary} />
        <ThemedText style={styles.loadingText}>
          Loading stock data...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors[theme].primary }]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stockData) {
    return null;
  }

  const toggleWatchlist = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (starred) {
        // Find the stock ID to unstar
        const starredStock = starredStocks.find(
          (stock) => stock.symbol === symbol
        );
        if (starredStock?.id) {
          await unstarStock(starredStock.id);
        }
      } else {
        if (stockData) {
          await starStock({
            symbol: stockData.symbol,
            name: stockData.name,
          });
        }
      }
      setStarred(!starred);
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T EGP`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B EGP`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M EGP`;
    return `${value.toLocaleString()} EGP`;
  };

  const navigateToBuyScreen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/buy-stock",
      params: {
        symbol: stockData?.symbol,
        name: stockData?.name,
        price: stockData?.lastPrice.toString(),
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: stockData?.symbol || "Stock Details",
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={navigateToBuyScreen}
                style={styles.buyButton}
              >
                <ThemedText style={styles.buyButtonText}>Buy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleWatchlist}
              >
                <Ionicons
                  name={starred ? "star" : "star-outline"}
                  size={24}
                  color={starred ? "#FFB800" : Colors[theme].text}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={[
          styles.container,
          { backgroundColor: Colors[theme].background },
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Stock Header Info */}
        <ThemedView variant="elevated" style={styles.stockInfoCard}>
          <View style={styles.stockHeader}>
            <View style={styles.stockTitleContainer}>
              <ThemedText type="title" style={styles.stockSymbol}>
                {stockData.symbol}
              </ThemedText>
              <ThemedText type="caption" style={styles.stockName}>
                {stockData.name}
              </ThemedText>
            </View>
            <View style={styles.stockStatusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      stockData.marketStatus === "open"
                        ? Colors[theme].success
                        : "#EF4444",
                  },
                ]}
              />
              <ThemedText type="caption" style={styles.statusText}>
                Market {stockData.marketStatus}
              </ThemedText>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <ThemedText type="heading" style={styles.price}>
              {formatCurrency(stockData.lastPrice)}
            </ThemedText>
            <ThemedText
              style={[
                styles.priceChange,
                {
                  color:
                    stockData.change >= 0 ? Colors[theme].success : "#EF4444",
                },
              ]}
            >
              {stockData.change >= 0 ? "+" : ""}
              {formatCurrency(stockData.change)} (
              {stockData.changePercent.toFixed(2)}%)
            </ThemedText>
          </View>
        </ThemedView>

        {/* Chart */}
        <ThemedView variant="elevated" style={styles.chartCard}>
          <View style={styles.chartTypeContainer}>
            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                chartType === "line" && {
                  backgroundColor: "#F5F5F5",
                  borderColor: "#E0E0E0",
                },
              ]}
              onPress={() => setChartType("line")}
            >
              <Ionicons
                name="analytics-outline"
                size={16}
                color={Colors[theme].text}
              />
              <ThemedText style={styles.chartTypeText}>Line</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                chartType === "candle" && {
                  backgroundColor: "#F5F5F5",
                  borderColor: "#E0E0E0",
                },
              ]}
              onPress={() => setChartType("candle")}
            >
              <Ionicons
                name="bar-chart-outline"
                size={16}
                color={Colors[theme].text}
              />
              <ThemedText style={styles.chartTypeText}>Candle</ThemedText>
            </TouchableOpacity>
          </View>

          <ChartErrorBoundary theme={theme}>
            <View style={styles.chartContainer}>
              {chartType === "line" ? (
                <LineChart.Provider
                  data={chartData.map((point) => ({
                    timestamp: point.timestamp,
                    value: point.value,
                  }))}
                >
                  <LineChart height={200} width={screenWidth - 64}>
                    <LineChart.Path
                      color={
                        stockData.change >= 0
                          ? Colors[theme].success
                          : "#EF4444"
                      }
                    />
                    <LineChart.CursorCrosshair color={Colors[theme].primary} />
                  </LineChart>
                </LineChart.Provider>
              ) : (
                <CandlestickChart.Provider
                  data={chartData.map((point) => ({
                    timestamp: point.timestamp,
                    open: point.open!,
                    high: point.high!,
                    low: point.low!,
                    close: point.close!,
                  }))}
                >
                  <CandlestickChart height={200} width={screenWidth - 64}>
                    <CandlestickChart.Candles
                      positiveColor={Colors[theme].success}
                      negativeColor="#EF4444"
                      strokeWidth={2}
                    />
                    <CandlestickChart.Crosshair />
                  </CandlestickChart>
                </CandlestickChart.Provider>
              )}
            </View>
          </ChartErrorBoundary>

          <View style={styles.timeframeContainer}>
            {(["1D", "1W", "1M", "3M", "1Y"] as const).map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[
                  styles.timeframeButton,
                  timeframe === tf && {
                    backgroundColor: "rgba(0, 168, 107, 0.1)",
                    borderColor: Colors[theme].primary,
                  },
                ]}
                onPress={() => setTimeframe(tf)}
              >
                <ThemedText
                  style={[
                    styles.timeframeText,
                    timeframe === tf && { color: Colors[theme].primary },
                  ]}
                >
                  {tf}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Market Data */}
        <ThemedView variant="elevated" style={styles.marketDataCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Market Data
          </ThemedText>
          <View style={styles.marketDataGrid}>
            <View style={styles.marketDataRow}>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  Open
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {formatCurrency(stockData.open)}
                </ThemedText>
              </View>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  Previous Close
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {formatCurrency(stockData.previousClose)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.marketDataRow}>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  Day High
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {formatCurrency(stockData.dayHigh)}
                </ThemedText>
              </View>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  Day Low
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {formatCurrency(stockData.dayLow)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.marketDataRow}>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  52-Week High
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {formatCurrency(stockData.yearHigh)}
                </ThemedText>
              </View>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  52-Week Low
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {formatCurrency(stockData.yearLow)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.marketDataRow}>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  Volume
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {stockData.volume.toLocaleString()}
                </ThemedText>
              </View>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  Market Cap
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {formatMarketCap(stockData.marketCap)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.marketDataRow}>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  P/E Ratio
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {stockData.peRatio ? stockData.peRatio.toFixed(2) : "N/A"}
                </ThemedText>
              </View>
              <View style={styles.marketDataItem}>
                <ThemedText type="caption" style={styles.marketDataLabel}>
                  Dividend Yield
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.marketDataValue}
                >
                  {stockData.dividendYield
                    ? `${stockData.dividendYield.toFixed(2)}%`
                    : "N/A"}
                </ThemedText>
              </View>
            </View>
            {stockData.bid && stockData.ask && (
              <View style={styles.marketDataRow}>
                <View style={styles.marketDataItem}>
                  <ThemedText type="caption" style={styles.marketDataLabel}>
                    Bid
                  </ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.marketDataValue}
                  >
                    {formatCurrency(stockData.bid)}
                  </ThemedText>
                </View>
                <View style={styles.marketDataItem}>
                  <ThemedText type="caption" style={styles.marketDataLabel}>
                    Ask
                  </ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.marketDataValue}
                  >
                    {formatCurrency(stockData.ask)}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Company Information - Optional */}
        <ThemedView variant="elevated" style={styles.companyInfoCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About {stockData.name}
          </ThemedText>
          <ThemedText style={styles.companyDescription}>
            {companyDescriptions[symbol] ||
              `${stockData.name} is a company listed on the Egyptian Exchange. More detailed information about the company's operations, history, and financial performance will be provided soon.`}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  watchlistButton: {
    padding: 8,
  },
  stockInfoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  stockTitleContainer: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 20,
  },
  stockName: {
    opacity: 0.8,
  },
  stockStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  priceContainer: {
    marginTop: 8,
  },
  price: {
    fontSize: 30,
    fontWeight: "600",
  },
  priceChange: {
    fontSize: 16,
    fontWeight: "500",
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTypeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  chartTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chartTypeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  chartContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  timeframeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  marketDataCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  marketDataGrid: {
    marginBottom: 8,
  },
  marketDataRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  marketDataItem: {
    flex: 1,
  },
  marketDataLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  marketDataValue: {
    fontSize: 15,
  },
  companyInfoCard: {
    borderRadius: 16,
    padding: 16,
  },
  companyDescription: {
    lineHeight: 20,
  },
  chartErrorContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 8,
  },
  chartErrorText: {
    marginTop: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  buyButton: {
    backgroundColor: "#00A86B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  buyButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 4,
  },
});

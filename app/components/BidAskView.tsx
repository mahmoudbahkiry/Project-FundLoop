import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import Svg, { Path, Line } from "react-native-svg";

interface BidAskViewProps {
  bidPrice: number;
  bidVolume: number;
  askPrice: number;
  askVolume: number;
  lastPrice: number;
  spread?: number;
}

interface PriceLevel {
  price: number;
  volume: number;
}

// Helper to generate multiple price levels for the order book display
const generateOrderBookLevels = (
  basePrice: number,
  baseVolume: number,
  isAsk: boolean,
  levels: number = 8
): PriceLevel[] => {
  const result: PriceLevel[] = [];
  const priceStep = isAsk ? 0.02 : -0.02; // 2 cents up for asks, down for bids
  const volumeVariation = 0.3; // 30% variation in volume for realism

  for (let i = 0; i < levels; i++) {
    // More volume near the current price, less as we move away
    const volumeMultiplier = Math.max(0.2, 1 - i * 0.15);
    const randomVariation = 0.7 + Math.random() * volumeVariation;
    const volume = Math.floor(baseVolume * volumeMultiplier * randomVariation);

    result.push({
      price: Math.round((basePrice + priceStep * i) * 100) / 100,
      volume: volume,
    });
  }

  return result;
};

export function BidAskView({
  bidPrice,
  bidVolume,
  askPrice,
  askVolume,
  lastPrice,
  spread,
}: BidAskViewProps) {
  const { currentTheme } = useTheme();
  const theme = currentTheme;

  // Generate multiple price levels for bids and asks
  const bidLevels = generateOrderBookLevels(bidPrice, bidVolume, false);
  const askLevels = generateOrderBookLevels(askPrice, askVolume, true);

  // Find max volume for scaling
  const allVolumes = [...bidLevels, ...askLevels].map((level) => level.volume);
  const maxVolume = Math.max(...allVolumes);

  // Calculate spread if not provided
  const calculatedSpread = spread ?? askPrice - bidPrice;
  const spreadPercentage = ((calculatedSpread / bidPrice) * 100).toFixed(2);

  // Format price to just show the number with 2 decimal places
  const formatPrice = (value: number): string => {
    return value.toFixed(2);
  };

  // Format volume with K or M for thousands/millions
  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + "M";
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + "K";
    }
    return volume.toString();
  };

  // Get full screen width for the chart
  const screenWidth = Dimensions.get("window").width - 32; // Account for container padding

  // Generate price chart paths
  const generateChartPath = (levels: PriceLevel[], isAsk: boolean): string => {
    // Normalize values for the chart
    const height = 150; // Height of the chart
    const width = screenWidth / 2; // Half the width for each side

    // Calculate the price range for scaling
    const prices = levels.map((level) => level.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    let path = "";

    levels.forEach((level, index) => {
      // Scale volume to height
      const volumeHeight = (level.volume / maxVolume) * height;
      // Scale price to width
      const pricePosition =
        width *
        (Math.abs(level.price - (isAsk ? minPrice : maxPrice)) / priceRange);

      // Starting point
      if (index === 0) {
        path += `M ${isAsk ? 0 : width} ${height} `;
      }

      // Line to price/volume point
      path += `L ${isAsk ? pricePosition : width - pricePosition} ${
        height - volumeHeight
      } `;

      // If last point, close the path to the bottom
      if (index === levels.length - 1) {
        path += `L ${isAsk ? width : 0} ${height} Z`;
      }
    });

    return path;
  };

  // Generate paths for bid and ask charts
  const bidPath = generateChartPath(bidLevels, false);
  const askPath = generateChartPath(askLevels, true);

  return (
    <ThemedView variant="elevated" style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Market Depth
      </ThemedText>

      {/* Best Bid & Ask Summary */}
      <View style={styles.bestBidAskContainer}>
        <View style={styles.bestBidContainer}>
          <ThemedText style={styles.bestBidAskLabel}>BEST BID</ThemedText>
          <ThemedText style={styles.bestBidValue}>
            EGP {formatPrice(bidPrice)}
          </ThemedText>
          <ThemedText style={styles.volumeText}>
            × {formatVolume(bidVolume)}
          </ThemedText>
        </View>

        <View style={styles.bestAskContainer}>
          <ThemedText style={styles.bestBidAskLabel}>BEST ASK</ThemedText>
          <ThemedText style={styles.bestAskValue}>
            EGP {formatPrice(askPrice)}
          </ThemedText>
          <ThemedText style={styles.volumeText}>
            × {formatVolume(askVolume)}
          </ThemedText>
        </View>
      </View>

      {/* Depth Chart - Full Width */}
      <View style={styles.depthChartContainer}>
        <Svg height="150" width={screenWidth}>
          {/* Vertical center line */}
          <Line
            x1={screenWidth / 2}
            y1="0"
            x2={screenWidth / 2}
            y2="150"
            stroke="#E0E0E0"
            strokeWidth="1"
          />

          {/* Bid side (green) */}
          <Path
            d={bidPath}
            fill="rgba(0, 168, 107, 0.15)"
            stroke="rgba(0, 168, 107, 0.8)"
            strokeWidth="1.5"
          />

          {/* Ask side (red) */}
          <Path
            d={askPath}
            fill="rgba(255, 59, 48, 0.15)"
            stroke="rgba(255, 59, 48, 0.8)"
            strokeWidth="1.5"
          />
        </Svg>

        {/* Price scale */}
        <View style={styles.priceScale}>
          <ThemedText style={styles.priceScaleText}>
            EGP {formatPrice(bidPrice - 0.2)}
          </ThemedText>
          <ThemedText style={styles.priceScaleText}>
            EGP {formatPrice(bidPrice - 0.1)}
          </ThemedText>
          <ThemedText style={styles.priceScaleText}>
            EGP {formatPrice(lastPrice)}
          </ThemedText>
          <ThemedText style={styles.priceScaleText}>
            EGP {formatPrice(askPrice + 0.1)}
          </ThemedText>
          <ThemedText style={styles.priceScaleText}>
            EGP {formatPrice(askPrice + 0.2)}
          </ThemedText>
        </View>
      </View>

      {/* Order Book */}
      <View style={styles.orderBookContainer}>
        {/* Header */}
        <View style={styles.orderBookHeader}>
          <ThemedText style={[styles.orderBookHeaderText, styles.sizeColumn]}>
            Size
          </ThemedText>
          <ThemedText style={[styles.orderBookHeaderText, styles.priceColumn]}>
            Bid
          </ThemedText>
          <ThemedText style={[styles.orderBookHeaderText, styles.priceColumn]}>
            Ask
          </ThemedText>
          <ThemedText style={[styles.orderBookHeaderText, styles.sizeColumn]}>
            Size
          </ThemedText>
        </View>

        {/* Price Levels */}
        <View style={styles.priceLevels}>
          {/* Map the first 6 levels to match the photo */}
          {bidLevels.slice(0, 6).map((bid, index) => {
            const ask = askLevels[index];
            return (
              <View key={index} style={styles.priceRow}>
                <ThemedText style={[styles.volumeText, styles.sizeColumn]}>
                  {formatVolume(bid.volume)}
                </ThemedText>
                <ThemedText style={[styles.bidPriceText, styles.priceColumn]}>
                  {formatPrice(bid.price)}
                </ThemedText>
                <ThemedText style={[styles.askPriceText, styles.priceColumn]}>
                  {formatPrice(ask.price)}
                </ThemedText>
                <ThemedText style={[styles.volumeText, styles.sizeColumn]}>
                  {formatVolume(ask.volume)}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>

      {/* Last Price & Spread Info */}
      <View style={styles.lastPriceInfoContainer}>
        <ThemedText style={styles.lastPriceLabel}>MEDIAN</ThemedText>
        <ThemedText style={styles.lastPriceValue}>
          EGP {formatPrice(lastPrice)}
          <ThemedText style={styles.changePercentage}>
            {" "}
            {lastPrice > bidPrice ? "+" : ""}
            {(((lastPrice - bidPrice) / bidPrice) * 100).toFixed(2)}%
          </ThemedText>
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  bestBidAskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  bestBidContainer: {
    alignItems: "flex-start",
  },
  bestAskContainer: {
    alignItems: "flex-end",
  },
  bestBidAskLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    fontWeight: "600",
  },
  bestBidValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(0, 168, 107, 1)",
    marginBottom: 2,
  },
  bestAskValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255, 59, 48, 1)",
    marginBottom: 2,
  },
  volumeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  depthChartContainer: {
    marginBottom: 20,
  },
  priceScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: 5,
  },
  priceScaleText: {
    fontSize: 11,
    opacity: 0.6,
  },
  orderBookContainer: {
    marginBottom: 20,
  },
  orderBookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    marginBottom: 8,
  },
  orderBookHeaderText: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: "500",
    textAlign: "center",
  },
  sizeColumn: {
    flex: 1,
    textAlign: "center",
  },
  priceColumn: {
    flex: 1.2,
    textAlign: "center",
  },
  priceLevels: {
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  bidPriceText: {
    color: "rgba(0, 168, 107, 1)",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
  },
  askPriceText: {
    color: "rgba(255, 59, 48, 1)",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
  },
  lastPriceInfoContainer: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 15,
  },
  lastPriceLabel: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: "500",
    marginBottom: 4,
  },
  lastPriceValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  changePercentage: {
    fontSize: 16,
    color: "rgba(0, 168, 107, 1)",
    fontWeight: "600",
  },
});

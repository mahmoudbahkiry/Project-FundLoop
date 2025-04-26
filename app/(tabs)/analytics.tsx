import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { JournalEntryModal } from "@/components/JournalEntryModal";
import {
  getUserJournalEntries,
  JournalEntry as JournalEntryType,
} from "@/firebase/journalService";

// Types
interface TradeMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  riskPerTrade: number;
  dailyRisk: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

interface TradeLog extends Omit<JournalEntryType, "id"> {
  id: string; // Make id required for TradeLog
  date: string;
  symbol: string;
  type: "buy" | "sell";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  notes?: string;
  hasScreenshot: boolean;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  status: "compliant" | "warning" | "violated";
  violations: number;
}

interface Violation {
  id: string;
  ruleId: string;
  date: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export default function AnalyticsScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;

  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // State
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [activeTab, setActiveTab] = useState("performance");
  const [isJournalModalVisible, setIsJournalModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(
    null
  );
  const [journalEntries, setJournalEntries] = useState<JournalEntryType[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const { user } = useAuth();

  // State for error handling
  const [journalError, setJournalError] = useState<string | null>(null);

  // Load journal entries when the journal tab is active
  useEffect(() => {
    if (activeTab === "journal" && user) {
      loadJournalEntries();
    }
  }, [activeTab, user]);

  // Function to load journal entries
  const loadJournalEntries = async () => {
    if (!user) {
      setJournalError("You must be logged in to view journal entries");
      return;
    }

    try {
      setIsLoadingEntries(true);
      setJournalError(null); // Clear any previous errors

      console.log(`Attempting to load journal entries for user: ${user.uid}`);
      const entries = await getUserJournalEntries(user.uid);
      console.log(`Successfully loaded ${entries.length} journal entries`);

      setJournalEntries(entries);
    } catch (error) {
      console.error("Error loading journal entries:", error);
      setJournalError(
        "Failed to load journal entries. Please try again later."
      );
    } finally {
      setIsLoadingEntries(false);
    }
  };

  // Function to handle opening the edit modal
  const handleEditEntry = (entry: JournalEntryType) => {
    setSelectedEntry(entry);
    setIsJournalModalVisible(true);
  };

  // Function to handle saving a journal entry
  const handleSaveEntry = async (entry: JournalEntryType) => {
    setIsJournalModalVisible(false);
    await loadJournalEntries();
  };

  // Mock data
  const tradeMetrics: TradeMetrics = {
    totalTrades: 87,
    winningTrades: 52,
    losingTrades: 35,
    winRate: 59.8,
    averageWin: 320.45,
    averageLoss: -185.3,
    profitFactor: 2.3,
    sharpeRatio: 1.8,
    maxDrawdown: 7.2,
    riskPerTrade: 1.5,
    dailyRisk: 3.2,
  };

  // Mock chart data
  const profitLossData: Record<string, ChartData> = {
    daily: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [{ data: [350, -120, 480, 200, -80] }],
    },
    weekly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{ data: [1200, 850, -400, 1500] }],
    },
    monthly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{ data: [3500, 2800, -1200, 4200, 3800, 5100] }],
    },
  };

  const equityCurveData: ChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [100000, 103500, 106300, 105100, 109300, 113100] }],
  };

  const drawdownData: ChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [-1.2, -2.5, -4.8, -3.2, -1.5, -0.8] }],
  };

  // Mock trade logs
  const tradeLogs: TradeLog[] = [
    {
      id: "1",
      userId: "mock",
      date: "2025-03-09 14:30",
      symbol: "COMI",
      type: "buy",
      entryPrice: 51.2,
      exitPrice: 52.75,
      quantity: 200,
      pnl: 310,
      pnlPercent: 3.03,
      notes: "Strong breakout above resistance with high volume",
      hasScreenshot: true,
    },
    {
      id: "2",
      userId: "mock",
      date: "2025-03-08 10:15",
      symbol: "HRHO",
      type: "sell",
      entryPrice: 18.5,
      exitPrice: 18.3,
      quantity: 500,
      pnl: 100,
      pnlPercent: 1.08,
      notes: "Bearish engulfing pattern at resistance",
      hasScreenshot: true,
    },
    {
      id: "3",
      userId: "mock",
      date: "2025-03-07 11:45",
      symbol: "TMGH",
      type: "buy",
      entryPrice: 9.3,
      exitPrice: 9.1,
      quantity: 1000,
      pnl: -200,
      pnlPercent: -2.15,
      notes: "Failed breakout, stopped out",
      hasScreenshot: false,
    },
    {
      id: "4",
      userId: "mock",
      date: "2025-03-06 13:20",
      symbol: "SWDY",
      type: "buy",
      entryPrice: 12.75,
      exitPrice: 13.2,
      quantity: 300,
      pnl: 135,
      pnlPercent: 3.53,
      notes: "Bounce off support level with increasing volume",
      hasScreenshot: true,
    },
    {
      id: "5",
      userId: "mock",
      date: "2025-03-05 09:45",
      symbol: "EAST",
      type: "sell",
      entryPrice: 15.4,
      exitPrice: 15.1,
      quantity: 200,
      pnl: 60,
      pnlPercent: 1.95,
      notes: "Short at resistance with bearish divergence",
      hasScreenshot: false,
    },
  ];

  // Mock compliance rules
  const complianceRules: ComplianceRule[] = [
    {
      id: "1",
      name: "Daily Loss Limit",
      description: "Maximum daily loss must not exceed 5% of account balance",
      status: "compliant",
      violations: 0,
    },
    {
      id: "2",
      name: "Position Size",
      description: "No single position should exceed 10% of account balance",
      status: "warning",
      violations: 2,
    },
    {
      id: "3",
      name: "Trading Hours",
      description: "Trading only allowed during market hours (10:00 - 14:30)",
      status: "compliant",
      violations: 0,
    },
    {
      id: "4",
      name: "Stop Loss",
      description: "All trades must have a stop loss set",
      status: "violated",
      violations: 5,
    },
    {
      id: "5",
      name: "Risk-Reward Ratio",
      description: "Minimum risk-reward ratio of 1:2 for all trades",
      status: "warning",
      violations: 3,
    },
  ];

  // Mock violations
  const violations: Violation[] = [
    {
      id: "v1",
      ruleId: "4",
      date: "2025-03-08 11:30",
      description: "Trade opened without stop loss (COMI)",
      severity: "high",
    },
    {
      id: "v2",
      ruleId: "2",
      date: "2025-03-07 10:15",
      description: "Position size exceeded 10% (HRHO - 12.5%)",
      severity: "medium",
    },
    {
      id: "v3",
      ruleId: "5",
      date: "2025-03-06 13:45",
      description: "Risk-reward ratio below minimum (TMGH - 1:1.2)",
      severity: "low",
    },
    {
      id: "v4",
      ruleId: "4",
      date: "2025-03-05 14:20",
      description: "Trade opened without stop loss (SWDY)",
      severity: "high",
    },
    {
      id: "v5",
      ruleId: "2",
      date: "2025-03-04 11:10",
      description: "Position size exceeded 10% (EAST - 11.2%)",
      severity: "medium",
    },
  ];

  // Render chart placeholder
  const renderChartPlaceholder = (title: string, height: number = 180) => (
    <ThemedView variant="innerCard" style={[styles.chartContainer, { height }]}>
      <View style={styles.chartPlaceholder}>
        <Ionicons name="stats-chart" size={32} color={Colors[theme].icon} />
        <ThemedText style={styles.chartPlaceholderText}>{title}</ThemedText>
      </View>
    </ThemedView>
  );

  // Render metric card
  const renderMetricCard = (
    title: string,
    value: string,
    subtitle?: string,
    positive: boolean = true
  ) => (
    <ThemedView variant="innerCard" style={styles.metricCard}>
      <ThemedText type="caption" style={styles.metricTitle}>
        {title}
      </ThemedText>
      <ThemedText
        type="defaultSemiBold"
        style={[
          styles.metricValue,
          { color: positive ? Colors[theme].success : "#EF4444" },
        ]}
      >
        {value}
      </ThemedText>
      {subtitle && (
        <ThemedText type="caption" style={styles.metricSubtitle}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );

  // Render trade log item
  const renderTradeLogItem = ({ item }: { item: JournalEntryType }) => {
    const isProfitable = item.pnl > 0;
    const hasNotes = !!item.notes && item.notes.trim().length > 0;

    const handlePress = () => {
      handleEditEntry(item);
    };

    // Format date to be more readable
    const formattedDate = (() => {
      try {
        const date = new Date(item.date);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch (e) {
        return item.date;
      }
    })();

    // Get trade direction icon
    const getDirectionIcon = () => {
      if (item.type === "buy") {
        return (
          <Ionicons
            name="arrow-up-circle"
            size={16}
            color={Colors[theme].success}
            style={{ marginRight: 4 }}
          />
        );
      } else {
        return (
          <Ionicons
            name="arrow-down-circle"
            size={16}
            color="#EF4444"
            style={{ marginRight: 4 }}
          />
        );
      }
    };

    // Get PL direction icon
    const getPLIcon = () => {
      if (isProfitable) {
        return (
          <Ionicons
            name="trending-up"
            size={18}
            color={Colors[theme].success}
          />
        );
      } else {
        return <Ionicons name="trending-down" size={18} color="#EF4444" />;
      }
    };

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={[
            isProfitable
              ? "rgba(0, 168, 107, 0.03)"
              : "rgba(239, 68, 68, 0.03)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.journalCardGradient}
        >
          <ThemedView variant="innerCard" style={styles.journalCard}>
            {/* Top Ribbon - Indicator of trade result */}
            <View
              style={[
                styles.journalCardRibbon,
                {
                  backgroundColor: isProfitable
                    ? Colors[theme].success
                    : "#EF4444",
                },
              ]}
            />

            {/* Card Header */}
            <View style={styles.journalCardHeader}>
              {/* Left Side - Symbol and Type */}
              <View style={styles.symbolSection}>
                <View style={styles.symbolBadge}>
                  <ThemedText style={styles.symbolText}>
                    {item.symbol}
                  </ThemedText>
                </View>
                <View style={styles.typeContainer}>
                  {getDirectionIcon()}
                  <ThemedText
                    style={[
                      styles.typeText,
                      {
                        color:
                          item.type === "buy"
                            ? Colors[theme].success
                            : "#EF4444",
                      },
                    ]}
                  >
                    {item.type.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              {/* Right Side - Date */}
              <View style={styles.dateContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={Colors[theme].icon}
                  style={styles.dateIcon}
                />
                <ThemedText type="caption" style={styles.dateText}>
                  {formattedDate}
                </ThemedText>
              </View>
            </View>

            {/* Card Content */}
            <View style={styles.journalCardContent}>
              {/* Price Details */}
              <View style={styles.priceDetailsSection}>
                <View style={styles.priceBox}>
                  <ThemedText type="caption" style={styles.priceLabel}>
                    Entry
                  </ThemedText>
                  <View style={styles.priceValueContainer}>
                    <Ionicons
                      name="log-in-outline"
                      size={14}
                      color={Colors[theme].icon}
                      style={{ marginRight: 4 }}
                    />
                    <ThemedText style={styles.priceValue}>
                      {formatCurrency(item.entryPrice)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.priceArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={Colors[theme].icon}
                  />
                </View>

                <View style={styles.priceBox}>
                  <ThemedText type="caption" style={styles.priceLabel}>
                    Exit
                  </ThemedText>
                  <View style={styles.priceValueContainer}>
                    <Ionicons
                      name="log-out-outline"
                      size={14}
                      color={Colors[theme].icon}
                      style={{ marginRight: 4 }}
                    />
                    <ThemedText style={styles.priceValue}>
                      {formatCurrency(item.exitPrice)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.quantityBox}>
                  <ThemedText type="caption" style={styles.quantityLabel}>
                    Size
                  </ThemedText>
                  <View style={styles.quantityValueContainer}>
                    <Ionicons
                      name="layers-outline"
                      size={14}
                      color={Colors[theme].icon}
                      style={{ marginRight: 4 }}
                    />
                    <ThemedText style={styles.quantityValue}>
                      {item.quantity.toLocaleString()}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Profit/Loss Card */}
              <View
                style={[
                  styles.profitLossCard,
                  {
                    backgroundColor: isProfitable
                      ? "rgba(0, 168, 107, 0.08)"
                      : "rgba(239, 68, 68, 0.08)",
                  },
                ]}
              >
                <View style={styles.profitHeader}>
                  {getPLIcon()}
                  <ThemedText type="caption" style={styles.profitLabel}>
                    P/L
                  </ThemedText>
                </View>

                <ThemedText
                  style={[
                    styles.profitAmount,
                    { color: isProfitable ? Colors[theme].success : "#EF4444" },
                  ]}
                >
                  {isProfitable ? "+" : ""}
                  {formatCurrency(item.pnl)}
                </ThemedText>

                <ThemedText
                  style={[
                    styles.profitPercent,
                    { color: isProfitable ? Colors[theme].success : "#EF4444" },
                  ]}
                >
                  {isProfitable ? "+" : ""}
                  {item.pnlPercent.toFixed(1)}%
                </ThemedText>
              </View>
            </View>

            {/* Notes Preview (if available) */}
            {hasNotes && (
              <View style={styles.notesPreview}>
                <View style={styles.notesHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={Colors[theme].icon}
                  />
                  <ThemedText type="caption" style={styles.notesLabel}>
                    Notes
                  </ThemedText>
                </View>
                <ThemedText
                  style={styles.notesText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.notes}
                </ThemedText>
              </View>
            )}

            {/* Card Footer */}
            <View style={styles.journalCardFooter}>
              <TouchableOpacity style={styles.editButton} onPress={handlePress}>
                <Ionicons
                  name="create-outline"
                  size={14}
                  color={Colors[theme].primary}
                />
                <ThemedText style={styles.editText}>Edit</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render compliance rule item
  const renderComplianceRuleItem = ({ item }: { item: ComplianceRule }) => {
    const statusColor =
      item.status === "compliant"
        ? Colors[theme].success
        : item.status === "warning"
        ? "#EAB308"
        : "#EF4444";

    const statusIcon =
      item.status === "compliant"
        ? "checkmark-circle"
        : item.status === "warning"
        ? "warning"
        : "alert-circle";

    return (
      <ThemedView
        variant="innerCard"
        style={[
          styles.complianceItem,
          { borderLeftWidth: 4, borderLeftColor: statusColor },
        ]}
      >
        <View style={styles.complianceContent}>
          <View style={styles.complianceHeader}>
            <View style={styles.complianceTitle}>
              <Ionicons
                name={statusIcon}
                size={20}
                color={statusColor}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <ThemedText
                  type="defaultSemiBold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={styles.complianceDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </ThemedText>
              </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              {item.violations > 0 ? (
                <View
                  style={[
                    styles.violationsBadge,
                    { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: "#EF4444",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {item.violations}{" "}
                    {item.violations === 1 ? "violation" : "violations"}
                  </ThemedText>
                </View>
              ) : (
                <View
                  style={[
                    styles.compliantBadge,
                    { backgroundColor: "rgba(46, 204, 113, 0.1)" },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: Colors[theme].success,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Compliant
                  </ThemedText>
                </View>
              )}

              <TouchableOpacity style={styles.detailsButton}>
                <ThemedText
                  style={{ fontSize: 12, color: Colors[theme].primary }}
                >
                  Details
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };

  // Render violation item
  const renderViolationItem = ({ item }: { item: Violation }) => {
    const severityColor =
      item.severity === "low"
        ? "#EAB308"
        : item.severity === "medium"
        ? "#F97316"
        : "#EF4444";

    return (
      <ThemedView variant="innerCard" style={styles.violationItem}>
        <View style={styles.violationContent}>
          <View style={styles.violationHeader}>
            <ThemedText
              type="defaultSemiBold"
              style={{ flex: 1, marginRight: 8 }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.description}
            </ThemedText>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: `${severityColor}20` },
              ]}
            >
              <ThemedText
                style={{
                  color: severityColor,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {item.severity.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="caption" style={styles.violationDate}>
            {item.date}
          </ThemedText>
        </View>
      </ThemedView>
    );
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "performance":
        return (
          <ScrollView style={styles.container}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Performance Overview
              </ThemedText>

              {/* Timeframe selector */}
              <View style={styles.timeframeSelector}>
                <TouchableOpacity
                  style={[
                    styles.timeframeButton,
                    timeframe === "daily" && [
                      styles.activeTimeframe,
                      {
                        backgroundColor:
                          currentTheme === "dark" ? "#333333" : "#fff",
                      },
                    ],
                  ]}
                  onPress={() => setTimeframe("daily")}
                >
                  <ThemedText
                    style={
                      timeframe === "daily"
                        ? [
                            styles.activeTimeframeText,
                            { color: Colors[currentTheme].primary },
                          ]
                        : {}
                    }
                  >
                    Daily
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.timeframeButton,
                    timeframe === "weekly" && [
                      styles.activeTimeframe,
                      {
                        backgroundColor:
                          currentTheme === "dark" ? "#333333" : "#fff",
                      },
                    ],
                  ]}
                  onPress={() => setTimeframe("weekly")}
                >
                  <ThemedText
                    style={
                      timeframe === "weekly"
                        ? [
                            styles.activeTimeframeText,
                            { color: Colors[currentTheme].primary },
                          ]
                        : {}
                    }
                  >
                    Weekly
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.timeframeButton,
                    timeframe === "monthly" && [
                      styles.activeTimeframe,
                      {
                        backgroundColor:
                          currentTheme === "dark" ? "#333333" : "#fff",
                      },
                    ],
                  ]}
                  onPress={() => setTimeframe("monthly")}
                >
                  <ThemedText
                    style={
                      timeframe === "monthly"
                        ? [
                            styles.activeTimeframeText,
                            { color: Colors[currentTheme].primary },
                          ]
                        : {}
                    }
                  >
                    Monthly
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Charts and other content remain the same, just remove the outer card container */}
              <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Profit/Loss
              </ThemedText>
              {renderChartPlaceholder("Profit/Loss Chart")}

              <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Equity Curve
              </ThemedText>
              {renderChartPlaceholder("Equity Curve")}

              <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Drawdown
              </ThemedText>
              {renderChartPlaceholder("Drawdown Chart")}
            </View>

            {/* Quick Stats */}
            <View style={styles.sectionHeader}>
              <View style={styles.quickStatsHeader}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  Quick Stats
                </ThemedText>
                <View
                  style={[
                    styles.periodBadge,
                    {
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={Colors[theme].primary}
                    style={{ marginRight: 4 }}
                  />
                  <ThemedText style={styles.periodText}>
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </ThemedText>
                </View>
              </View>

              {/* Main Stats Grid */}
              <View style={styles.statsGrid}>
                {/* Total P/L Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? `${Colors[theme].success}30`
                      : `${Colors[theme].success}15`,
                    "transparent",
                  ]}
                  style={styles.mainStatCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(46, 204, 113, 0.2)"
                                : "rgba(46, 204, 113, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="trending-up"
                          size={20}
                          color={Colors[theme].success}
                        />
                      </View>
                      <View
                        style={[
                          styles.trendBadge,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(46, 204, 113, 0.2)"
                                : "rgba(46, 204, 113, 0.1)",
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.trendText,
                            { color: Colors[theme].success },
                          ]}
                        >
                          +2.1%
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>Total P/L</ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: Colors[theme].success },
                      ]}
                    >
                      {formatCurrency(8320)}
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      vs. previous {timeframe}
                    </ThemedText>
                  </View>
                </LinearGradient>

                {/* Win Rate Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? `${Colors[theme].primary}30`
                      : `${Colors[theme].primary}15`,
                    "transparent",
                  ]}
                  style={styles.statCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(66, 153, 225, 0.2)"
                                : "rgba(66, 153, 225, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={Colors[theme].primary}
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>Win Rate</ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: Colors[theme].primary },
                      ]}
                    >
                      {tradeMetrics.winRate}%
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      {tradeMetrics.winningTrades}/{tradeMetrics.totalTrades}{" "}
                      trades
                    </ThemedText>
                  </View>
                </LinearGradient>

                {/* Average Win Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? `${Colors[theme].success}30`
                      : `${Colors[theme].success}15`,
                    "transparent",
                  ]}
                  style={styles.statCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(46, 204, 113, 0.2)"
                                : "rgba(46, 204, 113, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="arrow-up-circle"
                          size={20}
                          color={Colors[theme].success}
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>
                      Average Win
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: Colors[theme].success },
                      ]}
                    >
                      {formatCurrency(tradeMetrics.averageWin)}
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      per winning trade
                    </ThemedText>
                  </View>
                </LinearGradient>

                {/* Average Loss Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? "rgba(239, 68, 68, 0.3)"
                      : "rgba(239, 68, 68, 0.15)",
                    "transparent",
                  ]}
                  style={styles.statCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(239, 68, 68, 0.2)"
                                : "rgba(239, 68, 68, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="arrow-down-circle"
                          size={20}
                          color="#EF4444"
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>
                      Average Loss
                    </ThemedText>
                    <ThemedText
                      style={[styles.statValue, { color: "#EF4444" }]}
                    >
                      {formatCurrency(tradeMetrics.averageLoss)}
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      per losing trade
                    </ThemedText>
                  </View>
                </LinearGradient>

                {/* Profit Factor Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? `${Colors[theme].primary}30`
                      : `${Colors[theme].primary}15`,
                    "transparent",
                  ]}
                  style={styles.statCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(66, 153, 225, 0.2)"
                                : "rgba(66, 153, 225, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="analytics"
                          size={20}
                          color={Colors[theme].primary}
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>
                      Profit Factor
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: Colors[theme].primary },
                      ]}
                    >
                      {tradeMetrics.profitFactor.toFixed(2)}
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      gross profit/loss ratio
                    </ThemedText>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>
        );

      case "trades":
        return (
          <ScrollView style={styles.container}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Trade Analysis
              </ThemedText>

              {/* Trade Overview Stats */}
              <View style={styles.statsGrid}>
                {/* Total Trades Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? `${Colors[theme].primary}30`
                      : `${Colors[theme].primary}15`,
                    "transparent",
                  ]}
                  style={styles.mainStatCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(66, 153, 225, 0.2)"
                                : "rgba(66, 153, 225, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="bar-chart"
                          size={20}
                          color={Colors[theme].primary}
                        />
                      </View>
                      <View
                        style={[
                          styles.trendBadge,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(66, 153, 225, 0.2)"
                                : "rgba(66, 153, 225, 0.1)",
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.trendText,
                            { color: Colors[theme].primary },
                          ]}
                        >
                          This Month
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>
                      Total Trades
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: Colors[theme].primary },
                      ]}
                    >
                      {tradeMetrics.totalTrades}
                    </ThemedText>
                    <View style={styles.tradeSplit}>
                      <ThemedText
                        style={[
                          styles.tradeSubstat,
                          { color: Colors[theme].success },
                        ]}
                      >
                        {tradeMetrics.winningTrades} Won
                      </ThemedText>
                      <ThemedText
                        style={[styles.tradeSubstat, { color: "#EF4444" }]}
                      >
                        {tradeMetrics.losingTrades} Lost
                      </ThemedText>
                    </View>
                  </View>
                </LinearGradient>

                {/* Win Rate Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? `${Colors[theme].success}30`
                      : `${Colors[theme].success}15`,
                    "transparent",
                  ]}
                  style={styles.statCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(46, 204, 113, 0.2)"
                                : "rgba(46, 204, 113, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="trophy"
                          size={20}
                          color={Colors[theme].success}
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>Win Rate</ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: Colors[theme].success },
                      ]}
                    >
                      {tradeMetrics.winRate}%
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      success rate
                    </ThemedText>
                  </View>
                </LinearGradient>

                {/* Average Win Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? `${Colors[theme].success}30`
                      : `${Colors[theme].success}15`,
                    "transparent",
                  ]}
                  style={styles.statCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(46, 204, 113, 0.2)"
                                : "rgba(46, 204, 113, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="trending-up"
                          size={20}
                          color={Colors[theme].success}
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>
                      Average Win
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: Colors[theme].success },
                      ]}
                    >
                      {formatCurrency(tradeMetrics.averageWin)}
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      per winning trade
                    </ThemedText>
                  </View>
                </LinearGradient>

                {/* Average Loss Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? "rgba(239, 68, 68, 0.3)"
                      : "rgba(239, 68, 68, 0.15)",
                    "transparent",
                  ]}
                  style={styles.statCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(239, 68, 68, 0.2)"
                                : "rgba(239, 68, 68, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="arrow-down-circle"
                          size={20}
                          color="#EF4444"
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>
                      Average Loss
                    </ThemedText>
                    <ThemedText
                      style={[styles.statValue, { color: "#EF4444" }]}
                    >
                      {formatCurrency(tradeMetrics.averageLoss)}
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      per losing trade
                    </ThemedText>
                  </View>
                </LinearGradient>

                {/* Profit Factor Card */}
                <LinearGradient
                  colors={[
                    theme === "dark"
                      ? `${Colors[theme].primary}30`
                      : `${Colors[theme].primary}15`,
                    "transparent",
                  ]}
                  style={styles.statCardNew}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              theme === "dark"
                                ? "rgba(66, 153, 225, 0.2)"
                                : "rgba(66, 153, 225, 0.1)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="analytics"
                          size={20}
                          color={Colors[theme].primary}
                        />
                      </View>
                    </View>
                    <ThemedText style={styles.statLabel}>
                      Profit Factor
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: Colors[theme].primary },
                      ]}
                    >
                      {tradeMetrics.profitFactor.toFixed(2)}
                    </ThemedText>
                    <ThemedText style={styles.statSubtext}>
                      gross profit/loss ratio
                    </ThemedText>
                  </View>
                </LinearGradient>
              </View>

              {/* Win/Loss Distribution */}
              <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Win/Loss Distribution
              </ThemedText>
              <ThemedView variant="innerCard" style={styles.distributionCard}>
                <View style={styles.distributionBar}>
                  <View
                    style={[
                      styles.distributionFill,
                      {
                        backgroundColor: Colors[theme].success,
                        width: `${
                          (tradeMetrics.winningTrades /
                            tradeMetrics.totalTrades) *
                          100
                        }%`,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.distributionFill,
                      {
                        backgroundColor: "#EF4444",
                        width: `${
                          (tradeMetrics.losingTrades /
                            tradeMetrics.totalTrades) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.distributionLabels}>
                  <View style={styles.distributionLabel}>
                    <View
                      style={[
                        styles.labelDot,
                        { backgroundColor: Colors[theme].success },
                      ]}
                    />
                    <ThemedText style={styles.labelText}>
                      Winning Trades ({tradeMetrics.winRate}%)
                    </ThemedText>
                  </View>
                  <View style={styles.distributionLabel}>
                    <View
                      style={[styles.labelDot, { backgroundColor: "#EF4444" }]}
                    />
                    <ThemedText style={styles.labelText}>
                      Losing Trades ({(100 - tradeMetrics.winRate).toFixed(1)}%)
                    </ThemedText>
                  </View>
                </View>
              </ThemedView>

              {/* Trade Size Distribution */}
              <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Trade Size Distribution
              </ThemedText>
              {renderChartPlaceholder("Trade Size Chart", 200)}

              {/* Trade Duration */}
              <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Trade Duration
              </ThemedText>
              {renderChartPlaceholder("Trade Duration Chart", 200)}
            </View>
          </ScrollView>
        );

      case "journal":
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.journalHeader}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Trading Journal
              </ThemedText>

              {/* Add Entry Button */}
              <TouchableOpacity
                style={styles.addEntryButton}
                onPress={() => {
                  setSelectedEntry(null);
                  setIsJournalModalVisible(true);
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={Colors[theme].primary}
                />
                <ThemedText
                  style={{ color: Colors[theme].primary, marginLeft: 8 }}
                >
                  Add Journal Entry
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Journal Entries List */}
            {isLoadingEntries ? (
              <ThemedView variant="innerCard" style={styles.loadingContainer}>
                <ThemedText>Loading journal entries...</ThemedText>
              </ThemedView>
            ) : journalError ? (
              <ThemedView variant="innerCard" style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#EF4444"
                />
                <ThemedText style={styles.errorText}>{journalError}</ThemedText>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadJournalEntries}
                >
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ) : journalEntries.length === 0 ? (
              <ThemedView variant="innerCard" style={styles.emptyContainer}>
                <Ionicons
                  name="journal-outline"
                  size={48}
                  color={Colors[theme].icon}
                />
                <ThemedText style={styles.emptyText}>
                  No journal entries yet
                </ThemedText>
                <ThemedText type="caption" style={styles.emptySubtext}>
                  Start documenting your trades to track your progress and learn
                  from your experiences.
                </ThemedText>
              </ThemedView>
            ) : (
              <FlatList
                data={journalEntries}
                renderItem={renderTradeLogItem}
                keyExtractor={(item) => item.documentId || ""}
                contentContainerStyle={styles.journalList}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              />
            )}

            {/* Journal Entry Modal */}
            <JournalEntryModal
              visible={isJournalModalVisible}
              onClose={() => setIsJournalModalVisible(false)}
              onEntryAdded={loadJournalEntries}
              onEntryUpdated={loadJournalEntries}
              onEntryDeleted={loadJournalEntries}
              editEntry={selectedEntry}
            />
          </View>
        );

      case "compliance":
        return (
          <ScrollView style={styles.container}>
            <ThemedView variant="elevated" style={styles.card}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Trading Rules Compliance
              </ThemedText>

              {/* Compliance Summary Card */}
              <ThemedView
                variant="innerCard"
                style={styles.complianceSummaryCard}
              >
                <View style={styles.complianceSummaryHeader}>
                  <ThemedText type="defaultSemiBold">
                    Compliance Status
                  </ThemedText>
                  <View
                    style={[
                      styles.complianceStatusBadge,
                      {
                        backgroundColor: complianceRules.some(
                          (rule) => rule.status === "violated"
                        )
                          ? "rgba(239, 68, 68, 0.15)"
                          : complianceRules.some(
                              (rule) => rule.status === "warning"
                            )
                          ? "rgba(234, 179, 8, 0.15)"
                          : "rgba(46, 204, 113, 0.15)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        complianceRules.some(
                          (rule) => rule.status === "violated"
                        )
                          ? "alert-circle"
                          : complianceRules.some(
                              (rule) => rule.status === "warning"
                            )
                          ? "warning"
                          : "checkmark-circle"
                      }
                      size={16}
                      color={
                        complianceRules.some(
                          (rule) => rule.status === "violated"
                        )
                          ? "#EF4444"
                          : complianceRules.some(
                              (rule) => rule.status === "warning"
                            )
                          ? "#EAB308"
                          : Colors[theme].success
                      }
                      style={{ marginRight: 4 }}
                    />
                    <ThemedText
                      style={{
                        color: complianceRules.some(
                          (rule) => rule.status === "violated"
                        )
                          ? "#EF4444"
                          : complianceRules.some(
                              (rule) => rule.status === "warning"
                            )
                          ? "#EAB308"
                          : Colors[theme].success,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {complianceRules.some(
                        (rule) => rule.status === "violated"
                      )
                        ? "At Risk"
                        : complianceRules.some(
                            (rule) => rule.status === "warning"
                          )
                        ? "Caution"
                        : "Compliant"}
                    </ThemedText>
                  </View>
                </View>

                {/* Compliance Progress Bar */}
                <View style={styles.complianceProgress}>
                  <View style={styles.complianceProgressBar}>
                    <View
                      style={[
                        styles.complianceProgressFill,
                        {
                          width: `${
                            (complianceRules.filter(
                              (rule) => rule.status === "compliant"
                            ).length /
                              complianceRules.length) *
                            100
                          }%`,
                          backgroundColor: Colors[theme].success,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.complianceProgressFill,
                        {
                          width: `${
                            (complianceRules.filter(
                              (rule) => rule.status === "warning"
                            ).length /
                              complianceRules.length) *
                            100
                          }%`,
                          backgroundColor: "#EAB308",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.complianceProgressFill,
                        {
                          width: `${
                            (complianceRules.filter(
                              (rule) => rule.status === "violated"
                            ).length /
                              complianceRules.length) *
                            100
                          }%`,
                          backgroundColor: "#EF4444",
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.complianceStatsRow}>
                  <View style={styles.complianceStat}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={Colors[theme].success}
                    />
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ color: Colors[theme].success, marginLeft: 4 }}
                    >
                      {
                        complianceRules.filter(
                          (rule) => rule.status === "compliant"
                        ).length
                      }
                    </ThemedText>
                    <ThemedText type="caption" style={{ marginLeft: 4 }}>
                      Compliant
                    </ThemedText>
                  </View>
                  <View style={styles.complianceStat}>
                    <Ionicons name="warning" size={18} color="#EAB308" />
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ color: "#EAB308", marginLeft: 4 }}
                    >
                      {
                        complianceRules.filter(
                          (rule) => rule.status === "warning"
                        ).length
                      }
                    </ThemedText>
                    <ThemedText type="caption" style={{ marginLeft: 4 }}>
                      Warning
                    </ThemedText>
                  </View>
                  <View style={styles.complianceStat}>
                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ color: "#EF4444", marginLeft: 4 }}
                    >
                      {
                        complianceRules.filter(
                          (rule) => rule.status === "violated"
                        ).length
                      }
                    </ThemedText>
                    <ThemedText type="caption" style={{ marginLeft: 4 }}>
                      Violated
                    </ThemedText>
                  </View>
                </View>

                {/* Total Violations */}
                <View style={styles.totalViolations}>
                  <ThemedText type="caption">Total Violations</ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: "#EF4444" }}
                  >
                    {complianceRules.reduce(
                      (total, rule) => total + rule.violations,
                      0
                    )}
                  </ThemedText>
                </View>
              </ThemedView>

              {/* Compliance Rules Section */}
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Trading Rules
                </ThemedText>
                <View style={styles.filterPills}>
                  <View style={[styles.filterPill, styles.activePill]}>
                    <ThemedText style={styles.activePillText}>All</ThemedText>
                  </View>
                  <View style={styles.filterPill}>
                    <ThemedText type="caption">Issues</ThemedText>
                  </View>
                </View>
              </View>

              {/* Compliance Rules List */}
              <FlatList
                data={complianceRules}
                renderItem={renderComplianceRuleItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.rulesList}
                scrollEnabled={false}
              />

              {/* Recent Violations Section */}
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Recent Violations
                </ThemedText>
                <TouchableOpacity style={styles.viewAllButton}>
                  <ThemedText
                    type="caption"
                    style={{ color: Colors[theme].primary }}
                  >
                    View All
                  </ThemedText>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={Colors[theme].primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Violations List */}
              <FlatList
                data={violations.slice(0, 3)}
                renderItem={renderViolationItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.violationsList}
                scrollEnabled={false}
                ListFooterComponent={
                  violations.length > 3 ? (
                    <TouchableOpacity style={styles.seeMoreButton}>
                      <ThemedText
                        style={{ color: Colors[theme].primary, fontSize: 14 }}
                      >
                        See more violations
                      </ThemedText>
                    </TouchableOpacity>
                  ) : null
                }
              />
            </ThemedView>
          </ScrollView>
        );

      default:
        return (
          <ScrollView style={styles.container}>
            <ThemedView variant="elevated" style={styles.card}>
              <ThemedText type="subtitle">
                Select a tab to view analytics
              </ThemedText>
            </ThemedView>
          </ScrollView>
        );
    }
  };

  // Render main screen
  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <ThemedText type="heading" style={styles.headerTitle}>
            Analytics
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "performance" && [
                  styles.activeTab,
                  { backgroundColor: `${Colors[theme].primary}15` },
                ],
              ]}
              onPress={() => setActiveTab("performance")}
            >
              <Ionicons
                name="stats-chart"
                size={20}
                color={
                  activeTab === "performance"
                    ? Colors[theme].primary
                    : Colors[theme].icon
                }
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "performance" && {
                    color: Colors[theme].primary,
                  },
                ]}
              >
                Performance
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "trades" && [
                  styles.activeTab,
                  { backgroundColor: `${Colors[theme].primary}15` },
                ],
              ]}
              onPress={() => setActiveTab("trades")}
            >
              <Ionicons
                name="trending-up"
                size={20}
                color={
                  activeTab === "trades"
                    ? Colors[theme].primary
                    : Colors[theme].icon
                }
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "trades" && { color: Colors[theme].primary },
                ]}
              >
                Trades
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "journal" && [
                  styles.activeTab,
                  { backgroundColor: `${Colors[theme].primary}15` },
                ],
              ]}
              onPress={() => setActiveTab("journal")}
            >
              <Ionicons
                name="journal"
                size={20}
                color={
                  activeTab === "journal"
                    ? Colors[theme].primary
                    : Colors[theme].icon
                }
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "journal" && { color: Colors[theme].primary },
                ]}
              >
                Journal
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content Area */}
        <View style={styles.container}>{renderTabContent()}</View>
      </ScrollView>
    </ThemedView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  tabContainer: {
    paddingTop: 10,
    paddingBottom: 8,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 100,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  activeTab: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  timeframeSelector: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTimeframe: {
    borderRadius: 8,
  },
  activeTimeframeText: {
    fontWeight: "600",
  },
  chartTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  chartContainer: {
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  chartPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  chartPlaceholderText: {
    marginTop: 8,
    opacity: 0.6,
  },
  quickStatsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  periodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  periodText: {
    fontSize: 12,
    fontWeight: "500",
  },
  mainStatsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  mainStatCard: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 8,
  },
  mainStatContent: {
    padding: 16,
  },
  mainStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mainStatLabel: {
    opacity: 0.8,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
    color: Colors.light.success,
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  mainStatFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainStatPercent: {
    fontWeight: "600",
    marginRight: 4,
    color: Colors.light.success,
  },
  mainStatPeriod: {
    opacity: 0.6,
    fontSize: 12,
  },
  secondaryStatsContainer: {
    flex: 1,
  },
  secondaryStatCard: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  secondaryStatContent: {
    padding: 12,
  },
  secondaryStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  secondaryStatLabel: {
    opacity: 0.8,
    fontSize: 12,
  },
  secondaryStatValue: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 2,
  },
  secondaryStatFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryStatDetail: {
    opacity: 0.6,
    fontSize: 11,
  },
  additionalMetricsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 12,
    overflow: "hidden",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  metricItem: {
    alignItems: "center",
  },
  metricLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  metricValue: {
    fontWeight: "600",
  },
  metricDivider: {
    width: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  metricCard: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  metricTitle: {
    marginBottom: 4,
  },
  metricSubtitle: {
    opacity: 0.6,
  },
  ratioContainer: {
    padding: 16,
    marginBottom: 16,
  },
  ratioChart: {
    borderRadius: 8,
  },
  ratioBarContainer: {
    flexDirection: "row",
    height: 24,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  ratioBar: {
    height: "100%",
  },
  ratioLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalTrades: {
    textAlign: "center",
    marginTop: 12,
    opacity: 0.7,
  },
  averageContainer: {
    padding: 16,
    marginBottom: 16,
  },
  averageContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  averageItem: {
    flex: 1,
    alignItems: "center",
  },
  averageDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  metricDetailCard: {
    padding: 16,
    marginBottom: 16,
  },
  metricDetailContent: {
    borderRadius: 8,
  },
  metricDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoButton: {
    padding: 4,
  },
  metricDescription: {
    opacity: 0.7,
    lineHeight: 20,
  },
  addEntryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
  },
  journalList: {
    paddingBottom: 16,
  },
  journalCardGradient: {
    borderRadius: 12,
    marginBottom: 16,
  },
  journalCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    padding: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  journalCardRibbon: {
    height: 4,
    width: "100%",
  },
  journalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  symbolSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  symbolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  symbolText: {
    fontWeight: "700",
    fontSize: 14,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    opacity: 0.7,
  },
  journalCardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceDetailsSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  priceBox: {
    alignItems: "center",
    marginRight: 4,
  },
  priceLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  priceValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceValue: {
    fontWeight: "500",
  },
  priceArrow: {
    marginHorizontal: 4,
  },
  quantityBox: {
    alignItems: "center",
    marginLeft: 12,
  },
  quantityLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  quantityValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityValue: {
    fontWeight: "500",
  },
  profitLossCard: {
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    minWidth: 80,
  },
  profitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  profitLabel: {
    marginLeft: 4,
    opacity: 0.8,
  },
  profitAmount: {
    fontWeight: "700",
    fontSize: 16,
  },
  profitPercent: {
    fontSize: 12,
    fontWeight: "600",
  },
  notesPreview: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  notesLabel: {
    marginLeft: 6,
    fontWeight: "600",
  },
  notesText: {
    lineHeight: 18,
    opacity: 0.8,
    paddingLeft: 22,
  },
  journalCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editText: {
    marginLeft: 4,
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  complianceSummaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  complianceSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  complianceStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  complianceProgress: {
    marginBottom: 16,
  },
  complianceProgressBar: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  complianceProgressFill: {
    height: "100%",
  },
  complianceStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  complianceStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalViolations: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  filterPills: {
    flexDirection: "row",
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  activePill: {
    backgroundColor: Colors.light.primary,
  },
  activePillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  violationsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  compliantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  detailsButton: {
    marginTop: 4,
  },
  seeMoreButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  complianceOverview: {
    padding: 16,
    marginBottom: 16,
  },
  complianceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  rulesList: {
    marginBottom: 16,
  },
  complianceItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  complianceContent: {
    padding: 16,
  },
  complianceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  complianceTitle: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 8,
  },
  complianceDescription: {
    opacity: 0.7,
    lineHeight: 18,
    marginTop: 4,
  },
  violationsList: {
    marginBottom: 8,
  },
  violationItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  violationContent: {
    padding: 16,
  },
  violationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  violationDate: {
    opacity: 0.7,
  },
  errorContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  journalHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  mainStatCardNew: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statCardNew: {
    width: "48.5%",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statCardContent: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
  tradeSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  tradeSubstat: {
    fontSize: 12,
    fontWeight: "600",
  },
  distributionCard: {
    padding: 16,
    marginBottom: 16,
  },
  distributionBar: {
    height: 24,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  distributionFill: {
    height: "100%",
  },
  distributionLabels: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  distributionLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  labelText: {
    fontSize: 12,
    opacity: 0.8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  header: {
    flex: 1,
  },
  headerTitle: {
    color: "#2ECC71",
    fontSize: 32,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
});

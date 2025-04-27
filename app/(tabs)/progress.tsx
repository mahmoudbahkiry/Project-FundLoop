import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTradingContext } from "@/contexts/TradingContext";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function ProgressScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const { balance, accountMode, setAccountMode } = useTradingContext();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Add useEffect to log account mode when component mounts and simulate data loading
  useEffect(() => {
    console.log("ProgressScreen - Current account mode:", accountMode);
    // Simulate data loading and set state to indicate data is ready
    const timer = setTimeout(() => {
      setIsDataLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [accountMode]);

  // Function to switch to Evaluation mode
  const switchToEvaluationMode = () => {
    setAccountMode("Evaluation");
    console.log("Switched to Evaluation mode");
  };

  // Mock data for the evaluation progress
  const evaluationProgress = {
    currentPhase: 1,
    totalPhases: 2,
    phaseData: [
      {
        phase: 1,
        name: "Evaluation Phase 1",
        progress: 65, // percentage
        duration: "14 days",
        daysRemaining: 5,
        profitTarget: {
          required: 8, // 8%
          achieved: 5.2, // 5.2%
        },
        maxDrawdown: {
          limit: 5, // 5%
          current: 2.8, // 2.8%
        },
        tradingDays: {
          required: 10,
          completed: 6,
        },
      },
      {
        phase: 2,
        name: "Evaluation Phase 2",
        progress: 0, // percentage
        duration: "30 days",
        daysRemaining: null,
        profitTarget: {
          required: 5, // 5%
          achieved: 0, // 0%
        },
        maxDrawdown: {
          limit: 5, // 5%
          current: 0, // 0%
        },
        tradingDays: {
          required: 20,
          completed: 0,
        },
      },
    ],
  };

  const tradingStats = {
    winRate: 58, // percentage
    averageWin: 320, // EGP
    averageLoss: 180, // EGP
    profitFactor: 1.8,
    sharpeRatio: 1.2,
    totalTrades: 24,
    bestTrade: 950, // EGP
    worstTrade: -450, // EGP
  };

  const dayPerformance = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        data: [2.1, -0.8, 1.5, 0.6, 1.8],
      },
    ],
  };

  // Calculate the completion percentage for the entire evaluation
  const totalCompletionPercentage =
    (evaluationProgress.phaseData[0].progress +
      evaluationProgress.phaseData[1].progress) /
    2;

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "#FF6B6B"; // Red
    if (progress < 70) return "#FFD166"; // Yellow
    return "#06D6A0"; // Green
  };

  const renderPhaseCard = (phase: any) => {
    const isCurrentPhase = evaluationProgress.currentPhase === phase.phase;

    return (
      <ThemedView
        key={`phase-${phase.phase}`}
        variant="elevated"
        style={[
          styles.phaseCard,
          isCurrentPhase && {
            borderLeftWidth: 4,
            borderLeftColor: Colors[theme].primary,
          },
        ]}
      >
        <View style={styles.phaseHeader}>
          <View>
            <ThemedText style={styles.phaseName}>{phase.name}</ThemedText>
            <ThemedText style={styles.phaseDuration}>
              Duration: {phase.duration}
              {phase.daysRemaining
                ? ` (${phase.daysRemaining} days remaining)`
                : ""}
            </ThemedText>
          </View>
          <View
            style={[
              styles.phaseStatusBadge,
              {
                backgroundColor: isCurrentPhase
                  ? "rgba(46, 204, 113, 0.1)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.phaseStatusText,
                {
                  color: isCurrentPhase ? "#2ecc71" : Colors[theme].secondary,
                },
              ]}
            >
              {isCurrentPhase ? "Current" : "Upcoming"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${phase.progress}%`,
                backgroundColor: getProgressColor(phase.progress),
              },
            ]}
          />
          <ThemedText style={styles.progressText}>{phase.progress}%</ThemedText>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <ThemedText style={styles.metricLabel}>Profit Target</ThemedText>
            <View style={styles.metricValueContainer}>
              <ThemedText
                style={[
                  styles.metricValue,
                  {
                    color:
                      phase.profitTarget.achieved >= phase.profitTarget.required
                        ? "#2ecc71"
                        : Colors[theme].text,
                  },
                ]}
              >
                {phase.profitTarget.achieved}%
              </ThemedText>
              <ThemedText style={styles.metricTarget}>
                /{phase.profitTarget.required}%
              </ThemedText>
            </View>
          </View>

          <View style={styles.metricItem}>
            <ThemedText style={styles.metricLabel}>Max Drawdown</ThemedText>
            <View style={styles.metricValueContainer}>
              <ThemedText
                style={[
                  styles.metricValue,
                  {
                    color:
                      phase.maxDrawdown.current <= phase.maxDrawdown.limit
                        ? "#2ecc71"
                        : "#e74c3c",
                  },
                ]}
              >
                {phase.maxDrawdown.current}%
              </ThemedText>
              <ThemedText style={styles.metricTarget}>
                /max {phase.maxDrawdown.limit}%
              </ThemedText>
            </View>
          </View>

          <View style={styles.metricItem}>
            <ThemedText style={styles.metricLabel}>Trading Days</ThemedText>
            <View style={styles.metricValueContainer}>
              <ThemedText
                style={[
                  styles.metricValue,
                  {
                    color:
                      phase.tradingDays.completed >= phase.tradingDays.required
                        ? "#2ecc71"
                        : Colors[theme].text,
                  },
                ]}
              >
                {phase.tradingDays.completed}
              </ThemedText>
              <ThemedText style={styles.metricTarget}>
                /{phase.tradingDays.required}
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };

  const renderTradingStatsCard = () => (
    <ThemedView variant="elevated" style={styles.statsCard}>
      <ThemedText style={styles.cardTitle}>Trading Statistics</ThemedText>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Win Rate</ThemedText>
          <ThemedText
            style={[
              styles.statValue,
              { color: tradingStats.winRate >= 50 ? "#2ecc71" : "#e74c3c" },
            ]}
          >
            {tradingStats.winRate}%
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Avg. Win</ThemedText>
          <ThemedText
            style={[styles.statValue, { color: "#2ecc71" }]}
          >{`${tradingStats.averageWin} EGP`}</ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Avg. Loss</ThemedText>
          <ThemedText
            style={[styles.statValue, { color: "#e74c3c" }]}
          >{`${tradingStats.averageLoss} EGP`}</ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Profit Factor</ThemedText>
          <ThemedText
            style={[
              styles.statValue,
              {
                color: tradingStats.profitFactor >= 1.5 ? "#2ecc71" : "#e74c3c",
              },
            ]}
          >
            {tradingStats.profitFactor}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Total Trades</ThemedText>
          <ThemedText style={styles.statValue}>
            {tradingStats.totalTrades}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Sharpe Ratio</ThemedText>
          <ThemedText
            style={[
              styles.statValue,
              {
                color: tradingStats.sharpeRatio >= 1 ? "#2ecc71" : "#e74c3c",
              },
            ]}
          >
            {tradingStats.sharpeRatio}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  const renderDailyPerformanceCard = () => (
    <ThemedView variant="elevated" style={styles.chartCard}>
      <ThemedText style={styles.cardTitle}>Daily Performance (%)</ThemedText>
      <BarChart
        data={dayPerformance}
        width={screenWidth - 48}
        height={220}
        yAxisLabel=""
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: "transparent",
          backgroundGradientFrom: theme === "dark" ? "#1A1A1A" : "#FFFFFF",
          backgroundGradientTo: theme === "dark" ? "#1A1A1A" : "#FFFFFF",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          labelColor: (opacity = 1) =>
            theme === "dark"
              ? `rgba(255, 255, 255, ${opacity})`
              : `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.7,
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        fromZero
      />
      <ThemedText style={styles.chartHelpText}>
        Trading performance for the current week
      </ThemedText>
    </ThemedView>
  );

  const renderProgressSummary = () => (
    <ThemedView variant="elevated" style={styles.progressSummaryCard}>
      <View style={styles.progressSummaryHeader}>
        <View>
          <ThemedText style={styles.progressCardTitle}>
            Evaluation Progress
          </ThemedText>
          <ThemedText style={styles.progressCardSubtitle}>
            Currently in Phase {evaluationProgress.currentPhase} of{" "}
            {evaluationProgress.totalPhases}
          </ThemedText>
        </View>
        <View style={styles.progressPercentageContainer}>
          <View
            style={[
              styles.progressPercentageCircle,
              { backgroundColor: getProgressColor(totalCompletionPercentage) },
            ]}
          >
            <ThemedText style={styles.progressPercentageText}>
              {Math.round(totalCompletionPercentage)}%
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderOverview = () => (
    <>
      {renderProgressSummary()}
      {evaluationProgress.phaseData.map((phase) => renderPhaseCard(phase))}
      {renderTradingStatsCard()}
      {renderDailyPerformanceCard()}

      <ThemedView variant="elevated" style={styles.calloutCard}>
        <View style={styles.calloutHeader}>
          <Ionicons
            name="information-circle"
            size={24}
            color={Colors[theme].primary}
          />
          <ThemedText style={styles.calloutTitle}>
            Path to Funded Status
          </ThemedText>
        </View>
        <ThemedText style={styles.calloutText}>
          Complete your evaluation by meeting all the requirements in both
          phases. Once successful, you'll be awarded a funded account of 100,000
          EGP where you can trade real money and keep up to 80% of your profits.
        </ThemedText>
      </ThemedView>
    </>
  );

  const renderRules = () => (
    <ThemedView variant="elevated" style={styles.rulesCard}>
      <ThemedText style={styles.cardTitle}>Evaluation Rules</ThemedText>

      <View style={styles.ruleItem}>
        <View style={styles.ruleIconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
        </View>
        <View style={styles.ruleContent}>
          <ThemedText style={styles.ruleName}>Profit Target</ThemedText>
          <ThemedText style={styles.ruleDescription}>
            Achieve an 8% profit target in Phase 1 and 5% in Phase 2.
          </ThemedText>
        </View>
      </View>

      <View style={styles.ruleItem}>
        <View style={styles.ruleIconContainer}>
          <Ionicons name="close-circle" size={24} color="#e74c3c" />
        </View>
        <View style={styles.ruleContent}>
          <ThemedText style={styles.ruleName}>Maximum Drawdown</ThemedText>
          <ThemedText style={styles.ruleDescription}>
            Keep your drawdown below 5% at all times. Exceeding this limit will
            result in evaluation failure.
          </ThemedText>
        </View>
      </View>

      <View style={styles.ruleItem}>
        <View style={styles.ruleIconContainer}>
          <Ionicons name="calendar" size={24} color={Colors[theme].primary} />
        </View>
        <View style={styles.ruleContent}>
          <ThemedText style={styles.ruleName}>Minimum Trading Days</ThemedText>
          <ThemedText style={styles.ruleDescription}>
            Complete at least 10 trading days in Phase 1 and 20 days in Phase 2
            to demonstrate consistency.
          </ThemedText>
        </View>
      </View>

      <View style={styles.ruleItem}>
        <View style={styles.ruleIconContainer}>
          <Ionicons
            name="trending-up"
            size={24}
            color={Colors[theme].primary}
          />
        </View>
        <View style={styles.ruleContent}>
          <ThemedText style={styles.ruleName}>
            Consistent Performance
          </ThemedText>
          <ThemedText style={styles.ruleDescription}>
            Maintain steady growth and avoid excessive risk-taking or erratic
            trading patterns.
          </ThemedText>
        </View>
      </View>

      <View style={styles.ruleItem}>
        <View style={styles.ruleIconContainer}>
          <Ionicons
            name="time-outline"
            size={24}
            color={Colors[theme].primary}
          />
        </View>
        <View style={styles.ruleContent}>
          <ThemedText style={styles.ruleName}>Time Constraints</ThemedText>
          <ThemedText style={styles.ruleDescription}>
            Complete Phase 1 within 14 days and Phase 2 within 30 days from
            activation.
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ThemedText style={styles.loadingText}>Loading data...</ThemedText>
    </View>
  );

  if (accountMode !== "Evaluation") {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <ThemedText type="heading" style={styles.headerTitle}>
              Progress
            </ThemedText>
          </View>
        </View>

        <View style={styles.accessDeniedContainer}>
          <Ionicons
            name="lock-closed"
            size={80}
            color="#FFC107"
            style={styles.accessDeniedIcon}
          />
          <ThemedText style={styles.accessDeniedTitle}>
            Evaluation Mode Only
          </ThemedText>
          <ThemedText style={styles.accessDeniedText}>
            This feature is only available for users in Evaluation mode. Switch
            your account mode to access the Progress tracking.
          </ThemedText>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={switchToEvaluationMode}
          >
            <ThemedText style={styles.switchModeButtonText}>
              Switch to Evaluation Mode
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <ThemedText
            type="heading"
            style={[styles.headerTitle, { color: Colors[theme].primary }]}
          >
            Progress
          </ThemedText>
        </View>
      </View>

      {/* Tab selector */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "overview" && styles.activeTab]}
          onPress={() => setSelectedTab("overview")}
        >
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "rules" && styles.activeTab]}
          onPress={() => setSelectedTab("rules")}
        >
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === "rules" && styles.activeTabText,
            ]}
          >
            Rules
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {!isDataLoaded
          ? renderLoading()
          : selectedTab === "overview"
          ? renderOverview()
          : renderRules()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "rgba(46, 204, 113, 0.1)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#2ecc71",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.8,
  },
  progressSummaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  progressSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPercentageContainer: {
    padding: 4,
  },
  progressPercentageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercentageText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  progressCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  progressCardSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  phaseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  phaseDuration: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  phaseStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phaseStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 4,
    marginBottom: 16,
    position: "relative",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    position: "absolute",
    right: 0,
    top: 12,
    fontSize: 12,
    fontWeight: "500",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: "center",
  },
  metricValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  metricTarget: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 2,
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartHelpText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 8,
  },
  calloutCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  calloutText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  rulesCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  ruleItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  ruleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ruleContent: {
    flex: 1,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  accessDeniedIcon: {
    marginBottom: 24,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  accessDeniedText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 24,
  },
  switchModeButton: {
    backgroundColor: "#FFC107",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  switchModeButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});

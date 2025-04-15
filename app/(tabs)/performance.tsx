import React from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

interface MonthlyPerformance {
  totalTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  netProfit: number;
}

interface Metric {
  label: string;
  value: string;
}

interface MetricSection {
  title: string;
  metrics: Metric[];
}

interface PerformanceData {
  currentMonth: MonthlyPerformance;
  tradingMetrics: MetricSection[];
}

export default function PerformanceScreen() {
  const { currentTheme } = useTheme();
  // Mock data - would be replaced with real data from API
  const performanceData: PerformanceData = {
    currentMonth: {
      totalTrades: 45,
      winRate: 68.5,
      averageWin: 520,
      averageLoss: 280,
      profitFactor: 1.85,
      netProfit: 12500,
    },
    tradingMetrics: [
      {
        title: 'Risk Management',
        metrics: [
          { label: 'Average Risk per Trade', value: '1.2%' },
          { label: 'Maximum Drawdown', value: '3.8%' },
          { label: 'Risk-Reward Ratio', value: '1:2.5' },
        ],
      },
      {
        title: 'Trading Activity',
        metrics: [
          { label: 'Active Trading Days', value: '15/20' },
          { label: 'Average Trades per Day', value: '3' },
          { label: 'Time in Market', value: '4.2h' },
        ],
      },
      {
        title: 'Profit Metrics',
        metrics: [
          { label: 'Weekly Target Progress', value: '85%' },
          { label: 'Monthly Target Progress', value: '72%' },
          { label: 'Average Daily Profit', value: '$830' },
        ],
      },
    ],
  };

  const renderMetricCard = (metric: Metric) => (
    <ThemedView style={styles.metricCard} variant="card" key={metric.label}>
      <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
      <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Performance Analytics</ThemedText>
          <ThemedText style={styles.subtitle}>Current Month Overview</ThemedText>
        </ThemedView>

        <ThemedView style={styles.summaryCard} variant="card">
          <ThemedView style={styles.summaryRow}>
            <ThemedView style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>
                {performanceData.currentMonth.totalTrades}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Total Trades</ThemedText>
            </ThemedView>
            <ThemedView style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>
                {performanceData.currentMonth.winRate}%
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Win Rate</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.summaryRow}>
            <ThemedView style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>
                ${performanceData.currentMonth.averageWin}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Avg. Win</ThemedText>
            </ThemedView>
            <ThemedView style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>
                ${performanceData.currentMonth.averageLoss}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Avg. Loss</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.netProfitSection}>
            <ThemedText style={styles.netProfitLabel}>Net Profit</ThemedText>
            <ThemedText style={[styles.netProfitValue, { color: Colors[currentTheme].success }]}>
              ${performanceData.currentMonth.netProfit.toLocaleString()}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {performanceData.tradingMetrics.map((section) => (
          <ThemedView key={section.title} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <ThemedView style={styles.metricsGrid}>
              {section.metrics.map(renderMetricCard)}
            </ThemedView>
          </ThemedView>
        ))}

        <ThemedView style={styles.complianceSection}>
          <ThemedText style={styles.complianceTitle}>Trading Rules Compliance</ThemedText>
          <ThemedView style={styles.complianceCard} variant="card">
            <ThemedText style={[styles.complianceStatus, { color: Colors[currentTheme].success }]}>✓ All Rules Followed</ThemedText>
            <ThemedText style={styles.complianceNote}>
              Maintaining consistent compliance with trading parameters
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  netProfitSection: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
    alignItems: 'center',
  },
  netProfitLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  netProfitValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '48%',
  },
  metricLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  complianceSection: {
    marginBottom: 20,
  },
  complianceTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  complianceCard: {
    borderRadius: 12,
    padding: 20,
  },
  complianceStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  complianceNote: {
    fontSize: 14,
    opacity: 0.7,
  },
});

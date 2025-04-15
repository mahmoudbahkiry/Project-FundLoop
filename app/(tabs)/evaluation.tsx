import React from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

interface EvaluationRule {
  title: string;
  items: string[];
}

export default function EvaluationScreen() {
  const { currentTheme } = useTheme();
  const evaluationRules: EvaluationRule[] = [
    {
      title: 'Profit Targets',
      items: [
        'Weekly Target: 3-5% of account size',
        'Monthly Target: 10-15% of account size',
        'Consistent performance across trading days',
      ],
    },
    {
      title: 'Risk Management',
      items: [
        'Daily Drawdown Limit: 2-3%',
        'Maximum Total Drawdown: 5-10%',
        'Maximum Risk per Trade: 1-2%',
      ],
    },
    {
      title: 'Trading Requirements',
      items: [
        'Minimum 3-4 active trading days per week',
        'No single trade > 40% of weekly profit',
        'Trading during approved market hours',
      ],
    },
    {
      title: 'Evaluation Period',
      items: [
        '30-day evaluation period',
        'Must meet all targets and rules',
        'Real-time monitoring and tracking',
      ],
    },
  ];

  const renderSection = (section: EvaluationRule) => (
    <ThemedView style={styles.section} key={section.title}>
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      {section.items.map((item, index) => (
        <ThemedView style={styles.bulletPoint} key={index}>
          <ThemedText style={styles.bulletDot}>•</ThemedText>
          <ThemedText style={styles.bulletText}>{item}</ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Evaluation Process</ThemedText>
          <ThemedText style={styles.subtitle}>
            Complete these requirements to become a funded trader
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.progressCard} variant="card">
          <ThemedText style={styles.progressTitle}>Your Progress</ThemedText>
          <ThemedView style={styles.progressStats}>
            <ThemedView style={styles.stat}>
              <ThemedText style={styles.statValue}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Days Complete</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stat}>
              <ThemedText style={styles.statValue}>+8.5%</ThemedText>
              <ThemedText style={styles.statLabel}>Total Profit</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stat}>
              <ThemedText style={styles.statValue}>-1.2%</ThemedText>
              <ThemedText style={styles.statLabel}>Max Drawdown</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.rulesContainer}>
          {evaluationRules.map(renderSection)}
        </ThemedView>

        <TouchableOpacity style={[styles.startButton, { backgroundColor: Colors[currentTheme].primary }]}>
          <ThemedText style={styles.startButtonText}>Start Evaluation</ThemedText>
        </TouchableOpacity>
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
  progressCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  rulesContainer: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  startButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

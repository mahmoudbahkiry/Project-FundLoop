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

interface Rule {
  title: string;
  description: string;
  warning: string;
}

interface TradingRuleSection {
  category: string;
  rules: Rule[];
}

export default function RulesScreen() {
  const { currentTheme } = useTheme();
  const tradingRules: TradingRuleSection[] = [
    {
      category: 'Profit & Loss Rules',
      rules: [
        {
          title: 'Weekly Profit Target',
          description: 'Achieve 3-5% profit on account balance weekly. Consistent performance is key.',
          warning: 'Exceeding 40% of weekly profit in a single trade is not allowed.',
        },
        {
          title: 'Monthly Profit Target',
          description: 'Maintain 10-15% profit on account balance monthly.',
          warning: 'Must show steady progress throughout the month.',
        },
      ],
    },
    {
      category: 'Risk Management',
      rules: [
        {
          title: 'Daily Drawdown',
          description: 'Maximum daily loss limit of 2-3% of account equity.',
          warning: 'Exceeding daily drawdown results in immediate suspension.',
        },
        {
          title: 'Maximum Drawdown',
          description: 'Total drawdown must not exceed 5-10% of account equity.',
          warning: 'Breaching max drawdown leads to account termination.',
        },
        {
          title: 'Position Sizing',
          description: 'Maximum risk per trade is 1-2% of account size.',
          warning: 'Overleveraging will result in rule violation.',
        },
      ],
    },
    {
      category: 'Trading Activity',
      rules: [
        {
          title: 'Minimum Trading Days',
          description: 'Must be active for at least 3-4 days each week.',
          warning: 'Inactivity may affect evaluation results.',
        },
        {
          title: 'Trading Hours',
          description: 'Trade only during approved market hours.',
          warning: 'Off-hours trading is not permitted.',
        },
      ],
    },
    {
      category: 'Profit Distribution',
      rules: [
        {
          title: 'Profit Split',
          description: '80% of profits go to the trader, 20% to the firm.',
          warning: 'Applies only to profitable months.',
        },
        {
          title: 'Payout Schedule',
          description: 'Profits are distributed monthly after evaluation period.',
          warning: 'Must maintain compliance with all rules.',
        },
      ],
    },
  ];

  const renderRule = (rule: Rule) => (
    <ThemedView style={styles.ruleCard} variant="card" key={rule.title}>
      <ThemedText style={styles.ruleTitle}>{rule.title}</ThemedText>
      <ThemedText style={styles.ruleDescription}>{rule.description}</ThemedText>
      <ThemedText style={styles.ruleWarning}>⚠️ {rule.warning}</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Trading Rules</ThemedText>
          <ThemedText style={styles.subtitle}>
            Follow these guidelines to maintain your funded account
          </ThemedText>
        </ThemedView>

        {tradingRules.map((section) => (
          <ThemedView key={section.category} style={styles.section}>
            <ThemedText style={styles.categoryTitle}>{section.category}</ThemedText>
            {section.rules.map(renderRule)}
          </ThemedView>
        ))}

        <TouchableOpacity style={[styles.acknowledgeButton, { backgroundColor: Colors[currentTheme].primary }]}>
          <ThemedText style={styles.acknowledgeButtonText}>I Understand the Rules</ThemedText>
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
    marginBottom: 25,
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
  section: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  ruleCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  ruleDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  ruleWarning: {
    fontSize: 14,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  acknowledgeButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  acknowledgeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

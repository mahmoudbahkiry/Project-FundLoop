import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";

export default function DocumentationScreen() {
  const { currentTheme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    setShowBackToTop(scrollOffset > 200);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[currentTheme].primary}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <ThemedText type="title">Documentation</ThemedText>
        </View>
      </View>

      {/* Last updated timestamp */}
      <ThemedText style={styles.timestamp}>
        Last Updated: March 15, 2025
      </ThemedText>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView variant="card" style={styles.contentCard}>
          {/* Overview Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Overview</ThemedText>
            <ThemedText style={styles.paragraph}>
              Welcome to FundLoop's comprehensive documentation. This guide
              provides detailed information about our platform features, trading
              capabilities, and resources to help you succeed in your trading
              journey with us.
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              FundLoop is Egypt's first proprietary trading platform, designed
              to empower traders with the capital and tools they need to succeed
              in the financial markets.
            </ThemedText>
          </View>

          {/* Getting Started */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Getting Started</ThemedText>

            <ThemedText type="defaultSemiBold" style={styles.subheading}>
              Account Setup
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              To begin trading with FundLoop, follow these steps:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                • Sign up for an account with your email and create a strong
                password
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Complete your profile with personal and trading information
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Verify your identity through our secure verification process
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Select your trading challenge or funding program
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Fund your account using one of our supported payment methods
              </ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.subheading}>
              Platform Navigation
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              The FundLoop app consists of several key areas:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Dashboard:</ThemedText>{" "}
                Overview of your account performance, equity, and open positions
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Markets:</ThemedText>{" "}
                Access to available trading instruments and live market data
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Trading:</ThemedText> Order
                entry, position management, and trading tools
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Analysis:</ThemedText>{" "}
                Advanced charting, technical indicators, and market analysis
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">History:</ThemedText>{" "}
                Complete record of your trading activity and performance
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Settings:</ThemedText>{" "}
                Configure app preferences, notifications, and security options
              </ThemedText>
            </View>
          </View>

          {/* Trading Features */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Trading Features</ThemedText>

            <ThemedText type="defaultSemiBold" style={styles.subheading}>
              Order Types
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              FundLoop supports various order types to match your trading
              strategy:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Market Orders:</ThemedText>{" "}
                Execute immediately at the current market price
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Limit Orders:</ThemedText>{" "}
                Execute only at your specified price or better
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Stop Orders:</ThemedText>{" "}
                Trigger when the market reaches a specified price
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Stop-Limit Orders:
                </ThemedText>{" "}
                Combine stop and limit order features
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Trailing Stop Orders:
                </ThemedText>{" "}
                Adjust automatically as the market moves in your favor
              </ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.subheading}>
              Risk Management Tools
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              Protect your capital with our comprehensive risk management
              features:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Stop Loss:</ThemedText>{" "}
                Automatically close positions to limit losses
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Take Profit:</ThemedText>{" "}
                Secure gains by closing positions at predetermined profit levels
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Position Sizing Calculator:
                </ThemedText>{" "}
                Determine optimal position sizes based on risk parameters
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Risk-Reward Analysis:
                </ThemedText>{" "}
                Evaluate potential trades before execution
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Account Protection:
                </ThemedText>{" "}
                Daily and maximum drawdown limits to safeguard your capital
              </ThemedText>
            </View>
          </View>

          {/* Advanced Charting */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Advanced Charting</ThemedText>
            <ThemedText style={styles.paragraph}>
              Our platform offers sophisticated charting capabilities:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                • Multiple timeframes from 1-minute to monthly charts
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Over 100 technical indicators and studies
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Drawing tools for trend lines, Fibonacci retracements, and
                more
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Customizable chart layouts and templates
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Multi-chart view for analyzing multiple instruments
                simultaneously
              </ThemedText>
            </View>
          </View>

          {/* Funding Programs */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Funding Programs</ThemedText>
            <ThemedText style={styles.paragraph}>
              FundLoop offers several funding pathways for traders:
            </ThemedText>

            <ThemedText type="defaultSemiBold" style={styles.subheading}>
              Evaluation Challenge
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              Our two-phase evaluation process assesses your trading skills:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Phase 1:</ThemedText>{" "}
                Demonstrate consistent profitability while adhering to trading
                rules
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Phase 2:</ThemedText>{" "}
                Confirm your trading consistency with reduced risk parameters
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">Funded Account:</ThemedText>{" "}
                Upon successful completion, receive a funded trading account
              </ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.subheading}>
              Direct Funding
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              For experienced traders with a proven track record:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                • Submit your verified trading history for review
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Qualify for immediate funding without evaluation phases
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • Access higher capital allocation based on experience level
              </ThemedText>
            </View>
          </View>

          {/* Account Rules and Guidelines */}
          <View style={styles.section}>
            <ThemedText type="subtitle">
              Account Rules and Guidelines
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              To maintain your funded account status, adhere to these key rules:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Maximum Daily Loss:
                </ThemedText>{" "}
                Limit losses to the specified percentage of account value
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Maximum Total Loss:
                </ThemedText>{" "}
                Stay within the overall drawdown limit
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">Profit Targets:</ThemedText>{" "}
                Meet minimum profit requirements during evaluation phases
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">Trading Days:</ThemedText>{" "}
                Complete the required minimum trading days
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                • <ThemedText type="defaultSemiBold">News Trading:</ThemedText>{" "}
                Follow restrictions regarding high-impact economic events
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">Profit Sharing:</ThemedText>{" "}
                Understand the profit distribution schedule and calculations
              </ThemedText>
            </View>
          </View>

          {/* Troubleshooting */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Troubleshooting</ThemedText>
            <ThemedText style={styles.paragraph}>
              If you encounter issues with the platform:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">App Performance:</ThemedText>{" "}
                Close and restart the application, ensure your device meets
                system requirements
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Market Data Issues:
                </ThemedText>{" "}
                Check your internet connection, refresh the market view
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Order Execution Problems:
                </ThemedText>{" "}
                Verify account status, check for trading restrictions
              </ThemedText>
              <ThemedText style={styles.bulletItem}>
                •{" "}
                <ThemedText type="defaultSemiBold">
                  Login Difficulties:
                </ThemedText>{" "}
                Reset your password, contact support if issues persist
              </ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              For additional support, contact our customer service team through
              the Support page in the app.
            </ThemedText>
          </View>
        </ThemedView>

        {/* Extra space at bottom for better scrolling */}
        <View style={styles.footer} />
      </ScrollView>

      {/* Back to top button */}
      {showBackToTop && (
        <TouchableOpacity
          style={[
            styles.backToTopButton,
            { backgroundColor: Colors[currentTheme].primary },
          ]}
          onPress={scrollToTop}
        >
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          <ThemedText style={styles.backToTopText}>Back to Top</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 40, // Balance for back button width
  },
  timestamp: {
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.7,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  contentCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  section: {
    marginBottom: 32,
  },
  subheading: {
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 22,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 16,
  },
  bulletItem: {
    marginBottom: 8,
    lineHeight: 22,
  },
  footer: {
    height: 100,
  },
  backToTopButton: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    bottom: 30,
    right: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backToTopText: {
    color: "#FFFFFF",
    marginLeft: 8,
  },
});

import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Stack, router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";

export default function FundedFeaturesScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const navigation = useNavigation();

  const features = [
    {
      id: "1",
      title: "Real-Time Market Data",
      description:
        "Get instant access to live stock prices without the typical 15-minute delay. Make faster, more informed trading decisions with up-to-the-second market information.",
      icon: "time",
      color: "#4CAF50",
      details: [
        "Zero latency price updates",
        "Live bid/ask spreads",
        "Real-time volume tracking",
        "Immediate breaking news integration",
      ],
    },
    {
      id: "2",
      title: "Profit Withdrawals",
      description:
        "Cash out your trading profits at any time. Once you've earned it, it's yours to keep - transfer directly to your bank account with just a few taps.",
      icon: "cash",
      color: "#3F51B5",
      details: [
        "Weekly withdrawal options",
        "No minimum withdrawal amount",
        "Fast processing times",
        "Transparent fee structure",
      ],
    },
    {
      id: "3",
      title: "Separate Trading Account",
      description:
        "Enjoy a distinct trading environment for your funded account that's separate from your evaluation progress. Trade with confidence knowing your evaluation account remains intact.",
      icon: "wallet",
      color: "#009688",
      details: [
        "Maintain your evaluation progress",
        "Track performance separately",
        "Switch between accounts easily",
        "Different risk parameters for each account",
      ],
    },
  ];

  const renderFeature = (feature: (typeof features)[0], index: number) => {
    const isEven = index % 2 === 0;

    return (
      <ThemedView
        variant="elevated"
        style={[styles.featureCard, { marginTop: index === 0 ? 0 : 24 }]}
        key={feature.id}
      >
        <LinearGradient
          colors={[
            isEven
              ? `${feature.color}20`
              : theme === "dark"
              ? "#20202020"
              : "#FFFFFF20",
            "transparent",
          ]}
          style={styles.featureGradient}
        >
          <View style={styles.featureHeader}>
            <View
              style={[
                styles.featureIconContainer,
                { backgroundColor: `${feature.color}15` },
              ]}
            >
              <Ionicons
                name={feature.icon as any}
                size={32}
                color={feature.color}
              />
            </View>
            <View style={styles.featureTitleContainer}>
              <ThemedText style={styles.featureTitle}>
                {feature.title}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.featureDescription}>
            {feature.description}
          </ThemedText>

          <View style={styles.featureDetailsList}>
            {feature.details.map((detail, i) => (
              <View key={i} style={styles.featureDetailItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={feature.color}
                  style={styles.checkIcon}
                />
                <ThemedText style={styles.featureDetailText}>
                  {detail}
                </ThemedText>
              </View>
            ))}
          </View>
        </LinearGradient>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitleText}>
          Funded Account Features
        </ThemedText>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={Colors[theme].text} />
        </TouchableOpacity>
      </View>

      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <ThemedText style={styles.headerBadgeText}>FUNDED</ThemedText>
            </View>
            <ThemedText type="heading" style={styles.headerTitle}>
              Unlocked Features
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Congratulations on achieving funded status! Here's everything you
              now have access to.
            </ThemedText>
          </View>

          <View style={styles.featuresContainer}>
            {features.map((feature, index) => renderFeature(feature, index))}
          </View>

          <View style={styles.additionalInfo}>
            <ThemedText style={styles.additionalInfoTitle}>
              Want to learn more?
            </ThemedText>
            <ThemedText style={styles.additionalInfoText}>
              Our customer support team is available to help you get the most
              out of your funded account.
            </ThemedText>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => router.push("/contact-support")}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
              <ThemedText style={styles.supportButtonText}>
                Contact Support
              </ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.startTradingButton}
            onPress={() => router.push("/(tabs)/trading")}
          >
            <LinearGradient
              colors={[Colors[theme].primary, Colors[theme].secondary]}
              style={styles.startTradingGradient}
            >
              <Ionicons name="trending-up" size={24} color="#FFFFFF" />
              <ThemedText style={styles.startTradingText}>
                Start Trading Now
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 20 : 0,
  },
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  backButton: {
    padding: 10,
  },
  closeButton: {
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    textAlign: "center",
    maxWidth: "90%",
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  featureGradient: {
    padding: 24,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTitleContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    flexShrink: 1,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 20,
  },
  featureDetailsList: {
    gap: 12,
  },
  featureDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: 12,
  },
  featureDetailText: {
    fontSize: 15,
    fontWeight: "500",
  },
  additionalInfo: {
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  additionalInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  additionalInfoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 20,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3F51B5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  startTradingButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  startTradingGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  startTradingText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
});

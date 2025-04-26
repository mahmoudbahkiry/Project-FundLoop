import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTradingContext } from "@/contexts/TradingContext";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function WithdrawScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const { accountMode, balance } = useTradingContext();

  // Function to handle navigation to specific withdrawal method
  const navigateToMethod = (method: string) => {
    router.push(`/(withdraw)/${method}`);
  };

  // If user is not in funded mode, show access denied
  if (accountMode !== "Funded") {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ThemedView style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <ThemedText type="heading" style={styles.headerTitle}>
                Withdrawals
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
              Feature Locked
            </ThemedText>
            <ThemedText style={styles.accessDeniedText}>
              Withdrawals are only available in Funded mode. Upgrade your
              account to access this feature.
            </ThemedText>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push("/(tabs)/index")}
            >
              <ThemedText style={styles.upgradeButtonText}>
                Go to Dashboard
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <ThemedText
              type="heading"
              style={[styles.headerTitle, { color: Colors[theme].primary }]}
            >
              Withdraw Funds
            </ThemedText>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <ThemedView variant="elevated" style={styles.balanceCard}>
            <ThemedText style={styles.balanceLabel}>
              Available Balance
            </ThemedText>
            <ThemedText style={styles.balanceAmount}>
              {balance.toLocaleString("en-US")} EGP
            </ThemedText>
          </ThemedView>

          <ThemedText style={styles.formSectionTitle}>
            Select Withdrawal Method
          </ThemedText>

          <View style={styles.methodsContainer}>
            <TouchableOpacity
              style={[
                styles.methodCard,
                { borderLeftColor: "#00B894", borderLeftWidth: 4 },
              ]}
              onPress={() => navigateToMethod("instapay")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.methodIconBg,
                  { backgroundColor: "rgba(0, 184, 148, 0.12)" },
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={28}
                  color="#00B894"
                />
              </View>
              <View style={styles.methodTextContent}>
                <ThemedText style={styles.methodCardTitle}>Instapay</ThemedText>
                <ThemedText style={styles.methodCardDescription}>
                  Transfer to mobile wallet or bank account
                </ThemedText>
              </View>
              <View
                style={[
                  styles.arrowContainer,
                  { backgroundColor: "rgba(0, 184, 148, 0.12)" },
                ]}
              >
                <Ionicons name="chevron-forward" size={20} color="#00B894" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                { borderLeftColor: "#0984E3", borderLeftWidth: 4 },
              ]}
              onPress={() => navigateToMethod("bank")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.methodIconBg,
                  { backgroundColor: "rgba(9, 132, 227, 0.12)" },
                ]}
              >
                <Ionicons name="card-outline" size={28} color="#0984E3" />
              </View>
              <View style={styles.methodTextContent}>
                <ThemedText style={styles.methodCardTitle}>
                  Bank Transfer
                </ThemedText>
                <ThemedText style={styles.methodCardDescription}>
                  Transfer directly to your bank card
                </ThemedText>
              </View>
              <View
                style={[
                  styles.arrowContainer,
                  { backgroundColor: "rgba(9, 132, 227, 0.12)" },
                ]}
              >
                <Ionicons name="chevron-forward" size={20} color="#0984E3" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                { borderLeftColor: "#FDCB6E", borderLeftWidth: 4 },
              ]}
              onPress={() => navigateToMethod("crypto")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.methodIconBg,
                  { backgroundColor: "rgba(253, 203, 110, 0.12)" },
                ]}
              >
                <Ionicons name="logo-bitcoin" size={28} color="#FDCB6E" />
              </View>
              <View style={styles.methodTextContent}>
                <ThemedText style={styles.methodCardTitle}>Crypto</ThemedText>
                <ThemedText style={styles.methodCardDescription}>
                  Transfer to cryptocurrency wallet
                </ThemedText>
              </View>
              <View
                style={[
                  styles.arrowContainer,
                  { backgroundColor: "rgba(253, 203, 110, 0.12)" },
                ]}
              >
                <Ionicons name="chevron-forward" size={20} color="#FDCB6E" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 0,
    paddingTop: 8,
    lineHeight: 40,
  },
  formSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    marginLeft: 4,
  },
  methodsContainer: {
    flexDirection: "column",
    gap: 16,
  },
  methodCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  methodIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  methodTextContent: {
    flex: 1,
    paddingRight: 20,
  },
  methodCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  methodCardDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
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
  upgradeButton: {
    backgroundColor: "#FFC107",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  upgradeButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});

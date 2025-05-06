import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTradingContext } from "@/contexts/TradingContext";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function WithdrawScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const {
    accountMode,
    balance,
    initialBalance,
    totalWithdrawn,
    validateWithdrawal,
  } = useTradingContext();

  // Calculate profit and withdrawal limits
  const profit = balance - initialBalance;
  const maxWithdrawalAllowed = profit > 0 ? profit * 0.8 : 0;
  const perTransactionLimit = Math.max(0, maxWithdrawalAllowed * 0.2); // 20% of user's profit share
  const remainingWithdrawalAllowed = Math.max(
    0,
    maxWithdrawalAllowed - totalWithdrawn
  );

  // Function to handle navigation to specific withdrawal method
  const navigateToMethod = (method: string) => {
    router.push(`/(withdraw)/${method}`);
  };

  // If user is not in funded mode, show access denied
  if (accountMode !== "Funded") {
    return (
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
            Withdrawals are only available in Funded mode. Upgrade your account
            to access this feature.
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
            Withdraw Funds
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <ThemedView variant="elevated" style={styles.balanceCard}>
          <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
          <ThemedText style={styles.balanceAmount}>
            {balance.toLocaleString("en-US")} EGP
          </ThemedText>
        </ThemedView>

        {/* Withdrawal Limits Section */}
        <ThemedView variant="elevated" style={styles.limitsCard}>
          <View style={styles.limitRow}>
            <ThemedText style={styles.limitLabel}>Initial Balance</ThemedText>
            <ThemedText style={styles.limitValue}>
              {initialBalance.toLocaleString("en-US")} EGP
            </ThemedText>
          </View>

          <View style={styles.limitRow}>
            <ThemedText style={styles.limitLabel}>Total Profit</ThemedText>
            <ThemedText
              style={[
                styles.limitValue,
                profit > 0 ? styles.profitColor : styles.lossColor,
              ]}
            >
              {profit.toLocaleString("en-US")} EGP
            </ThemedText>
          </View>

          <View style={styles.limitRow}>
            <ThemedText style={styles.limitLabel}>Total Withdrawn</ThemedText>
            <ThemedText style={styles.limitValue}>
              {totalWithdrawn.toLocaleString("en-US")} EGP
            </ThemedText>
          </View>

          <View style={[styles.limitRow, styles.highlightedRow]}>
            <ThemedText style={[styles.limitLabel, styles.highlightedText]}>
              Available for Withdrawal
            </ThemedText>
            <ThemedText style={[styles.limitValue, styles.highlightedText]}>
              {remainingWithdrawalAllowed.toLocaleString("en-US")} EGP
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle"
            size={20}
            color={Colors[theme].primary}
          />
          <ThemedText style={styles.infoText}>
            You can withdraw up to 80% of your total profits with a maximum of{" "}
            {perTransactionLimit.toLocaleString("en-US")} EGP per transaction
            (20% of your profit share).
          </ThemedText>
        </View>

        <ThemedText style={styles.formSectionTitle}>
          Select Withdrawal Method
        </ThemedText>

        <View style={styles.methodsContainer}>
          <ThemedView
            variant="elevated"
            style={[
              styles.methodCard,
              {
                borderLeftColor: "#00B894",
                borderLeftWidth: 4,
                borderColor:
                  theme === "light" ? "rgba(0, 0, 0, 0.1)" : "transparent",
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigateToMethod("instapay")}
              activeOpacity={0.7}
              style={styles.methodTouchable}
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
          </ThemedView>

          <ThemedView
            variant="elevated"
            style={[
              styles.methodCard,
              {
                borderLeftColor: "#0984E3",
                borderLeftWidth: 4,
                borderColor:
                  theme === "light" ? "rgba(0, 0, 0, 0.1)" : "transparent",
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigateToMethod("bank")}
              activeOpacity={0.7}
              style={styles.methodTouchable}
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
          </ThemedView>

          <ThemedView
            variant="elevated"
            style={[
              styles.methodCard,
              {
                borderLeftColor: "#FDCB6E",
                borderLeftWidth: 4,
                borderColor:
                  theme === "light" ? "rgba(0, 0, 0, 0.1)" : "transparent",
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigateToMethod("crypto")}
              activeOpacity={0.7}
              style={styles.methodTouchable}
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
          </ThemedView>
        </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
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
  limitsCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  limitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  limitLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  highlightedRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  highlightedText: {
    fontWeight: "700",
    fontSize: 16,
  },
  profitColor: {
    color: "#00B894",
  },
  lossColor: {
    color: "#FF5252",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 184, 148, 0.08)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    opacity: 0.9,
    lineHeight: 18,
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
    marginBottom: 16,
  },
  methodCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  methodTouchable: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
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

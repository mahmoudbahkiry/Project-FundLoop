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

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <ThemedView variant="elevated" style={styles.balanceCard}>
            <ThemedText style={styles.balanceLabel}>
              Available Balance
            </ThemedText>
            <ThemedText style={styles.balanceAmount}>
              {balance.toLocaleString("en-US")} EGP
            </ThemedText>
            <ThemedText style={styles.balanceNote}>
              Withdrawals are processed within 1-3 business days
            </ThemedText>
          </ThemedView>

          <ThemedText style={styles.formSectionTitle}>
            Select Withdrawal Method
          </ThemedText>

          <ThemedView variant="elevated" style={styles.methodsCard}>
            <TouchableOpacity
              style={styles.methodOption}
              onPress={() => navigateToMethod("instapay")}
            >
              <View style={styles.methodIconContainer}>
                <Ionicons
                  name="phone-portrait"
                  size={24}
                  color={Colors[theme].primary}
                />
              </View>
              <View style={styles.methodTextContainer}>
                <ThemedText style={styles.methodTitle}>Instapay</ThemedText>
                <ThemedText style={styles.methodDescription}>
                  Withdraw to your mobile wallet or bank account
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={Colors[theme].text}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.methodOption}
              onPress={() => navigateToMethod("bank")}
            >
              <View style={styles.methodIconContainer}>
                <Ionicons name="card" size={24} color={Colors[theme].primary} />
              </View>
              <View style={styles.methodTextContainer}>
                <ThemedText style={styles.methodTitle}>
                  Bank Transfer
                </ThemedText>
                <ThemedText style={styles.methodDescription}>
                  Withdraw directly to your bank card
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={Colors[theme].text}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.methodOption}
              onPress={() => navigateToMethod("crypto")}
            >
              <View style={styles.methodIconContainer}>
                <Ionicons
                  name="logo-bitcoin"
                  size={24}
                  color={Colors[theme].primary}
                />
              </View>
              <View style={styles.methodTextContainer}>
                <ThemedText style={styles.methodTitle}>Crypto</ThemedText>
                <ThemedText style={styles.methodDescription}>
                  Withdraw to your cryptocurrency wallet
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={Colors[theme].text}
              />
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
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
    marginBottom: 12,
    paddingTop: 8,
    lineHeight: 40,
  },
  balanceNote: {
    fontSize: 14,
    opacity: 0.7,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    marginLeft: 4,
  },
  methodsCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  methodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginHorizontal: 16,
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

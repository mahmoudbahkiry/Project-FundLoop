import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ScrollView,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTradingContext } from "@/contexts/TradingContext";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function InstapayWithdrawScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const {
    balance,
    initialBalance,
    totalWithdrawn,
    validateWithdrawal,
    processWithdrawal,
  } = useTradingContext();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [instapayType, setInstapayType] = useState("wallet"); // Default to wallet

  // Calculate withdrawal limits
  const profit = balance - initialBalance;
  const maxWithdrawalAllowed = profit > 0 ? profit * 0.8 : 0;
  const perTransactionLimit = Math.max(0, maxWithdrawalAllowed * 0.2); // 20% of user's profit share
  const remainingWithdrawalAllowed = Math.max(
    0,
    maxWithdrawalAllowed - totalWithdrawn
  );

  const handleBack = () => {
    router.back();
  };

  const handleWithdraw = async () => {
    // Basic validation
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const withdrawAmount = Number(amount);

    // Check if amount exceeds per-transaction limit
    if (withdrawAmount > perTransactionLimit) {
      Alert.alert(
        "Transaction Limit Exceeded",
        `Maximum withdrawal per transaction is ${perTransactionLimit.toLocaleString(
          "en-US"
        )} EGP (20% of your profit share)`
      );
      return;
    }

    // Validate against withdrawal restrictions
    const validation = validateWithdrawal(withdrawAmount);
    if (!validation.valid) {
      Alert.alert("Withdrawal Limit Exceeded", validation.message);
      return;
    }

    // Proceed with withdrawal
    setIsLoading(true);

    // Process the withdrawal
    const success = await processWithdrawal(withdrawAmount);

    if (success) {
      Alert.alert(
        "Withdrawal Initiated",
        `Your withdrawal of ${withdrawAmount.toLocaleString(
          "en-US"
        )} EGP to your ${
          instapayType === "wallet" ? "mobile wallet" : "bank account"
        } (${phoneNumber}) has been initiated and will be processed within 1-3 business days.`,
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/withdraw"),
          },
        ]
      );
    } else {
      Alert.alert(
        "Withdrawal Failed",
        "There was an issue processing your withdrawal. Please try again."
      );
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors[theme].text}
              />
            </TouchableOpacity>
            <ThemedText type="heading" style={styles.headerTitle}>
              Instapay Withdrawal
            </ThemedText>
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
            </ThemedView>

            {/* Withdrawal Limits Section */}
            <ThemedView variant="elevated" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>
                  Available for Withdrawal
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {remainingWithdrawalAllowed.toLocaleString("en-US")} EGP
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>
                  Per-Transaction Limit
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {perTransactionLimit.toLocaleString("en-US")} EGP
                </ThemedText>
              </View>
            </ThemedView>

            <ThemedText style={styles.formSectionTitle}>
              Withdrawal Details
            </ThemedText>

            <ThemedView variant="elevated" style={styles.formCard}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Instapay Type</ThemedText>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      instapayType === "wallet" && styles.segmentOptionActive,
                    ]}
                    onPress={() => setInstapayType("wallet")}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={20}
                      color={
                        instapayType === "wallet"
                          ? "#FFFFFF"
                          : Colors[theme].text
                      }
                      style={styles.segmentIcon}
                    />
                    <ThemedText
                      style={[
                        styles.segmentText,
                        instapayType === "wallet" && styles.segmentTextActive,
                      ]}
                    >
                      Mobile Wallet
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      instapayType === "account" && styles.segmentOptionActive,
                    ]}
                    onPress={() => setInstapayType("account")}
                  >
                    <Ionicons
                      name="card-outline"
                      size={20}
                      color={
                        instapayType === "account"
                          ? "#FFFFFF"
                          : Colors[theme].text
                      }
                      style={styles.segmentIcon}
                    />
                    <ThemedText
                      style={[
                        styles.segmentText,
                        instapayType === "account" && styles.segmentTextActive,
                      ]}
                    >
                      Bank Account
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Phone Number</ThemedText>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCode}>
                    <ThemedText style={styles.countryCodeText}>+20</ThemedText>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.phoneInput,
                      {
                        color: Colors[theme].text,
                        borderColor: "rgba(0,0,0,0.2)",
                      },
                    ]}
                    placeholderTextColor={Colors[theme].text + "80"}
                    placeholder="1XXXXXXXX"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={10}
                    textAlign="left"
                  />
                </View>
                <ThemedText style={styles.inputHelp}>
                  Enter your{" "}
                  {instapayType === "wallet" ? "mobile wallet" : "bank account"}{" "}
                  registered phone number
                </ThemedText>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Amount (EGP)</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: Colors[theme].text,
                      borderColor: "rgba(0,0,0,0.2)",
                    },
                  ]}
                  placeholderTextColor={Colors[theme].text + "80"}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                <ThemedText style={styles.inputHelp}>
                  Maximum per transaction:{" "}
                  {perTransactionLimit.toLocaleString("en-US")} EGP
                </ThemedText>
              </View>

              <View style={styles.infoContainer}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={Colors[theme].primary}
                />
                <ThemedText style={styles.infoText}>
                  Withdrawals are processed within 1-3 business days. A small
                  transaction fee may apply.
                </ThemedText>
              </View>
            </ThemedView>

            <TouchableOpacity
              style={[
                styles.withdrawButton,
                isLoading && styles.withdrawButtonDisabled,
              ]}
              onPress={handleWithdraw}
              disabled={isLoading}
            >
              <ThemedText style={styles.withdrawButtonText}>
                {isLoading ? "Processing..." : "Withdraw Funds"}
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  balanceCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: "700",
    paddingTop: 4,
    lineHeight: 36,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  segmentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  segmentOptionActive: {
    backgroundColor: Colors.light.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  segmentIcon: {
    marginRight: 6,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  phoneInput: {
    width: 140,
    fontFamily: "System",
    letterSpacing: 0.5,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCode: {
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  inputHelp: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  withdrawButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
});

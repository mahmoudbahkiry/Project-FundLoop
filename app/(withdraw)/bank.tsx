import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTradingContext } from "@/contexts/TradingContext";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function BankWithdrawalScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const {
    balance,
    initialBalance,
    totalWithdrawn,
    validateWithdrawal,
    processWithdrawal,
  } = useTradingContext();

  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    // Input validation
    if (!accountNumber || accountNumber.length < 16) {
      Alert.alert(
        "Invalid Account Number",
        "Please enter a valid account number"
      );
      return;
    }

    if (!bankName) {
      Alert.alert("Bank Name Required", "Please enter your bank name");
      return;
    }

    if (!accountHolderName) {
      Alert.alert(
        "Account Holder Required",
        "Please enter the account holder name"
      );
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to withdraw");
      return;
    }

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
        `Your withdrawal of EGP ${withdrawAmount.toLocaleString(
          "en-US"
        )} to ${accountHolderName}'s account at ${bankName} has been initiated.`,
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
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
          </TouchableOpacity>
          <ThemedText type="heading" style={styles.headerTitle}>
            Bank Withdrawal
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
            Bank Account Details
          </ThemedText>

          <ThemedView variant="elevated" style={styles.formCard}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Account Number</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { color: Colors[theme].text, borderColor: "rgba(0,0,0,0.2)" },
                ]}
                placeholderTextColor={Colors[theme].text + "80"}
                placeholder="Enter account number"
                keyboardType="number-pad"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Bank Name</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { color: Colors[theme].text, borderColor: "rgba(0,0,0,0.2)" },
                ]}
                placeholderTextColor={Colors[theme].text + "80"}
                placeholder="Enter bank name"
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>
                Account Holder Name
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { color: Colors[theme].text, borderColor: "rgba(0,0,0,0.2)" },
                ]}
                placeholderTextColor={Colors[theme].text + "80"}
                placeholder="Enter account holder name"
                value={accountHolderName}
                onChangeText={setAccountHolderName}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Amount (EGP)</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { color: Colors[theme].text, borderColor: "rgba(0,0,0,0.2)" },
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
    paddingTop: 8,
    lineHeight: 40,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    marginLeft: 4,
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputHelp: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
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
});

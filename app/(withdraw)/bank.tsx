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
  const { balance } = useTradingContext();

  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleWithdraw = () => {
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

    if (withdrawAmount > balance) {
      Alert.alert(
        "Insufficient Balance",
        "You don't have enough balance for this withdrawal"
      );
      return;
    }

    // Proceed with withdrawal
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
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
    }, 1500);
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
            Bank Transfer Withdrawal
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

          <ThemedText style={styles.formSectionTitle}>
            Withdrawal Details
          </ThemedText>

          <ThemedView variant="elevated" style={styles.formCard}>
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
              <ThemedText style={styles.inputHelp}>
                e.g., CIB, QNB, Bank Misr
              </ThemedText>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Account Number</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { color: Colors[theme].text, borderColor: "rgba(0,0,0,0.2)" },
                ]}
                placeholderTextColor={Colors[theme].text + "80"}
                placeholder="Enter account number"
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={setAccountNumber}
                maxLength={16}
              />
              <ThemedText style={styles.inputHelp}>
                Enter your 16-digit bank account number
              </ThemedText>
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
                Minimum withdrawal: 500 EGP
              </ThemedText>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle"
                size={20}
                color={Colors[theme].primary}
              />
              <ThemedText style={styles.infoText}>
                Bank transfers may take 1-3 business days to process. A fee of
                2% may apply.
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
});

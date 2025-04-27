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
  const { balance } = useTradingContext();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [instapayType, setInstapayType] = useState("wallet"); // Default to wallet

  const handleBack = () => {
    router.back();
  };

  const handleWithdraw = () => {
    // Basic validation
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (Number(amount) > balance) {
      Alert.alert("Error", "Withdrawal amount exceeds available balance");
      return;
    }

    // Simulate processing
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Withdrawal Initiated",
        `Your withdrawal of ${Number(amount).toLocaleString(
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
    }, 1500);
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
          </View>
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
});

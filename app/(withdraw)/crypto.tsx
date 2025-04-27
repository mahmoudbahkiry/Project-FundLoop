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

// Supported crypto currencies
const cryptoOptions = [
  {
    id: "btc",
    name: "Bitcoin",
    ticker: "BTC",
    color: "#F7931A",
  },
  {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
    color: "#627EEA",
  },
  {
    id: "usdt",
    name: "Tether",
    ticker: "USDT",
    color: "#26A17B",
  },
];

export default function CryptoWithdrawalScreen() {
  const { currentTheme } = useTheme();
  const theme = currentTheme;
  const { balance } = useTradingContext();

  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleWithdraw = () => {
    // Input validation
    if (!walletAddress || walletAddress.length < 26) {
      Alert.alert(
        "Invalid Wallet Address",
        "Please enter a valid crypto wallet address"
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
        `Your withdrawal of ${withdrawAmount.toLocaleString(
          "en-US"
        )} EGP worth of ${
          selectedCrypto.name
        } to your wallet has been initiated.`,
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
            Crypto Withdrawal
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
                Select Cryptocurrency
              </ThemedText>
              <View style={styles.cryptoOptions}>
                {cryptoOptions.map((crypto) => (
                  <TouchableOpacity
                    key={crypto.id}
                    style={[
                      styles.cryptoOption,
                      selectedCrypto.id === crypto.id &&
                        styles.selectedCryptoOption,
                      {
                        borderColor:
                          selectedCrypto.id === crypto.id
                            ? crypto.color
                            : "rgba(0,0,0,0.1)",
                      },
                    ]}
                    onPress={() => setSelectedCrypto(crypto)}
                  >
                    <View
                      style={[
                        styles.cryptoIconContainer,
                        { backgroundColor: crypto.color },
                      ]}
                    >
                      <ThemedText
                        style={{ color: "#FFFFFF", fontWeight: "bold" }}
                      >
                        {crypto.ticker.charAt(0)}
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedText style={styles.cryptoName}>
                        {crypto.name}
                      </ThemedText>
                      <ThemedText style={styles.cryptoTicker}>
                        {crypto.ticker}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Wallet Address</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { color: Colors[theme].text, borderColor: "rgba(0,0,0,0.2)" },
                ]}
                placeholderTextColor={Colors[theme].text + "80"}
                placeholder="Enter your wallet address"
                value={walletAddress}
                onChangeText={setWalletAddress}
              />
              <ThemedText style={styles.inputHelp}>
                Enter the wallet address for {selectedCrypto.name}
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
                Crypto withdrawals typically process within 30-60 minutes. A
                network fee may apply depending on blockchain congestion.
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
    width: "100%",
  },
  inputHelp: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    marginLeft: 4,
  },
  cryptoOptions: {
    marginBottom: 8,
  },
  cryptoOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCryptoOption: {
    backgroundColor: "rgba(52, 152, 219, 0.05)",
  },
  cryptoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: "500",
  },
  cryptoTicker: {
    fontSize: 14,
    opacity: 0.7,
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

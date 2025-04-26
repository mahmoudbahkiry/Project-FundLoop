import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  KeyboardEvent,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

// Predefined bot responses
const botResponses = [
  "Hello! How can I assist you with FundLoop today?",
  "I understand you have a question. Could you please provide more details?",
  "Our team is committed to providing excellent support. How else can I help you?",
  "Is there anything else I can help you with regarding your trading experience?",
  "I recommend checking our detailed documentation for more information about our platform features.",
  "Feel free to ask any other questions you might have about FundLoop.",
  "I'm here to help. What other questions do you have about trading with FundLoop?",
  "Thank you for reaching out. Is there anything specific you'd like to know about our services?",
  "I'm happy to provide more information about any aspect of our platform.",
];

// Specialized responses based on keywords
const keywordResponses = {
  split:
    "At FundLoop, we offer an industry-leading profit split of 80/20, where traders keep 80% of the profits they generate. This competitive profit-sharing arrangement allows you to maximize your earnings while trading with our capital. The split is calculated on a monthly basis, and payouts are processed promptly after the end of each trading period.",

  phase:
    "FundLoop offers a two-phase program:\n\n1. Evaluation Phase: Demonstrate your trading skills by achieving a profit target with responsible risk management. This phase typically lasts 1-2 months.\n\n2. Funded Phase: Once you've passed evaluation, you'll receive a funded account with increased capital. You'll trade with our money and earn 80% of the profits while maintaining consistent performance and risk parameters.",

  platform:
    "The FundLoop platform is designed to be intuitive and powerful. For comprehensive details about all our platform features, trading parameters, account types, and tools, please check our detailed documentation section in the app. There you'll find step-by-step guides, video tutorials, and answers to frequently asked questions.",

  goal: "The primary goal of FundLoop is to empower talented traders by providing the capital they need to succeed in the financial markets. We aim to minimize risk for traders while maximizing their profit potential. Our mission is to create a supportive ecosystem where skilled traders from the MENA region can thrive without worrying about capital constraints or taking on excessive personal risk.",

  thank:
    "Thank you for using FundLoop! We appreciate your trust in our platform and are committed to supporting your trading journey. Our team works tirelessly to ensure you have the best possible experience. If you need any further assistance, don't hesitate to reach out.",

  account:
    "Your FundLoop account provides access to our comprehensive trading platform. You can manage your profile, view your trading statistics, access educational resources, and track your progress through our evaluation phases. To update your account information, go to the Profile section. For security purposes, we recommend enabling two-factor authentication and regularly updating your password.",

  withdraw:
    "Withdrawals at FundLoop are processed efficiently. Once you've earned profits in the Funded Phase, you can request a withdrawal from your dashboard. Withdrawals are typically processed within 2-3 business days. We support various withdrawal methods including bank transfers and popular e-wallets. There is a minimum withdrawal amount of $50, and all applicable taxes are your responsibility as per local regulations.",

  risk: "Risk management is a core principle at FundLoop. We enforce strict risk parameters to protect both traders and our capital. These include maximum daily drawdown limits of 5%, maximum account drawdown of 10%, and position sizing restrictions. Following these guidelines not only keeps your account in good standing but also develops disciplined trading habits that are essential for long-term success in the markets.",

  fee: "FundLoop's fee structure is transparent and trader-friendly. There are no hidden charges or monthly subscription fees. We charge a one-time evaluation fee that varies based on the account size you choose. Once you reach the Funded Phase, there are no additional fees – we simply share in the profits you generate with our 80/20 split model in your favor.",

  start:
    "Getting started with FundLoop is simple. First, create an account and complete your profile. Next, select an account size and pay the one-time evaluation fee. You'll then gain immediate access to our trading platform for the Evaluation Phase. Once you meet the performance targets, you'll automatically advance to the Funded Phase where you'll trade with our capital and earn 80% of the profits.",

  market:
    "FundLoop provides access to a wide range of markets including Forex, Stocks, Commodities, Indices, and Cryptocurrencies. Our platform offers competitive spreads, fast execution, and deep liquidity. You can trade major, minor, and exotic currency pairs, blue-chip and growth stocks from global exchanges, as well as digital assets including Bitcoin, Ethereum, and other popular cryptocurrencies.",

  tool: "Our platform offers powerful trading tools designed to enhance your trading experience. These include advanced charting with multiple timeframes and indicators, market scanners to identify opportunities, risk calculators to optimize position sizing, economic calendars to track market-moving events, and performance analytics to help you refine your strategy over time.",

  contact:
    "You can contact our support team through multiple channels. For immediate assistance, use this live chat feature. You can also reach us via email at support@fundloop.com or by phone at +1-234-567-8910 during business hours (9 AM to 6 PM EST, Monday through Friday). For detailed inquiries about your account, please include your account ID in all communications.",

  learn:
    "FundLoop offers comprehensive educational resources to help you succeed. Our Education Center includes video tutorials, trading guides, webinars, and strategy articles suitable for all experience levels. We also host weekly live trading sessions where our experts analyze markets and answer questions. Additionally, funded traders gain access to our exclusive mentorship program for personalized guidance.",
};

export default function LiveChatScreen() {
  const { currentTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm the FundLoop AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    // Handle keyboard showing and hiding
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event: KeyboardEvent) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
        // Scroll to bottom when keyboard appears with a short delay
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 50);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        // Scroll to bottom when keyboard hides
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 50);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");

    // Simulate bot typing
    setIsTyping(true);

    // Get specialized response based on keywords
    let botResponseText = "";
    const userInput = inputText.toLowerCase();

    if (
      userInput.includes("split") ||
      userInput.includes("profit share") ||
      userInput.includes("commission")
    ) {
      botResponseText = keywordResponses.split;
    } else if (
      userInput.includes("phase") ||
      userInput.includes("evaluation") ||
      userInput.includes("funded")
    ) {
      botResponseText = keywordResponses.phase;
    } else if (
      userInput.includes("platform") ||
      userInput.includes("software") ||
      userInput.includes("app")
    ) {
      botResponseText = keywordResponses.platform;
    } else if (
      userInput.includes("goal") ||
      userInput.includes("mission") ||
      userInput.includes("purpose")
    ) {
      botResponseText = keywordResponses.goal;
    } else if (
      userInput.includes("thank") ||
      userInput.includes("thanks") ||
      userInput.includes("appreciated")
    ) {
      botResponseText = keywordResponses.thank;
    } else if (
      userInput.includes("account") ||
      userInput.includes("profile") ||
      userInput.includes("login")
    ) {
      botResponseText = keywordResponses.account;
    } else if (
      userInput.includes("withdraw") ||
      userInput.includes("payout") ||
      userInput.includes("get money")
    ) {
      botResponseText = keywordResponses.withdraw;
    } else if (
      userInput.includes("risk") ||
      userInput.includes("drawdown") ||
      userInput.includes("loss")
    ) {
      botResponseText = keywordResponses.risk;
    } else if (
      userInput.includes("fee") ||
      userInput.includes("cost") ||
      userInput.includes("price")
    ) {
      botResponseText = keywordResponses.fee;
    } else if (
      userInput.includes("start") ||
      userInput.includes("begin") ||
      userInput.includes("join")
    ) {
      botResponseText = keywordResponses.start;
    } else if (
      userInput.includes("market") ||
      userInput.includes("trade") ||
      userInput.includes("forex")
    ) {
      botResponseText = keywordResponses.market;
    } else if (
      userInput.includes("tool") ||
      userInput.includes("chart") ||
      userInput.includes("indicator")
    ) {
      botResponseText = keywordResponses.tool;
    } else if (
      userInput.includes("contact") ||
      userInput.includes("support") ||
      userInput.includes("help")
    ) {
      botResponseText = keywordResponses.contact;
    } else if (
      userInput.includes("learn") ||
      userInput.includes("education") ||
      userInput.includes("tutorial")
    ) {
      botResponseText = keywordResponses.learn;
    } else {
      // Use a random generic response
      botResponseText =
        botResponses[Math.floor(Math.random() * botResponses.length)];
    }

    // Simulate bot response after delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsTyping(false);

      // Ensure message is visible after adding new message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, keyboardVisible && styles.smallerHeader]}>
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
        <View style={styles.headerContent}>
          <ThemedText type="subtitle">Live Support</ThemedText>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <ThemedText style={styles.statusText}>Online</ThemedText>
          </View>
        </View>
      </View>

      {/* Main content container */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages container */}
        <View style={styles.contentContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              keyboardVisible && { paddingBottom: 60 }, // Add space for input at bottom
            ]}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: false })
            }
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.sender === "user"
                    ? [
                        styles.userMessage,
                        { backgroundColor: Colors[currentTheme].primary },
                      ]
                    : styles.botMessage,
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    message.sender === "user" && styles.userMessageText,
                  ]}
                >
                  {message.text}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timestampText,
                    message.sender === "user" && styles.userTimestampText,
                  ]}
                >
                  {formatTime(message.timestamp)}
                </ThemedText>
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageBubble, styles.botMessage]}>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator
                    size="small"
                    color={Colors[currentTheme].primary}
                  />
                  <ThemedText style={styles.typingText}>
                    FundLoop is typing...
                  </ThemedText>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Input Area - Fixed at the bottom */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: Colors[currentTheme].background },
          ]}
        >
          <TextInput
            style={[styles.input, { color: Colors[currentTheme].text }]}
            placeholder="Type your message..."
            placeholderTextColor={Colors[currentTheme].text + "80"}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: Colors[currentTheme].primary },
            ]}
            onPress={sendMessage}
            disabled={inputText.trim() === ""}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    opacity: 0.6,
  },
  contentContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.7,
  },
  userTimestampText: {
    color: "rgba(255,255,255,0.8)",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  smallerHeader: {
    paddingTop: Platform.OS === "ios" ? 40 : 30,
    paddingBottom: 10,
  },
});

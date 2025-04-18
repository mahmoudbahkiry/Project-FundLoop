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
  "I understand you have a question about your account. Could you please provide more details?",
  "Our trading challenge has two phases: Phase 1 requires consistent profitability, and Phase 2 confirms your trading consistency with reduced risk parameters.",
  "The profit sharing arrangement is 80% for traders and 20% for FundLoop.",
  "I recommend checking our detailed documentation for information about the platform features and trading capabilities.",
  "If you need more personalized assistance, you can submit a support ticket or contact our CEO directly.",
  "Our proprietary trading platform is designed to empower traders with the capital and tools they need to succeed in the financial markets.",
  "I'll connect you with one of our support specialists for further assistance. They will contact you within 24 hours.",
  "Thank you for your patience. Is there anything else I can help you with today?",
];

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

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

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

    // Simulate bot response after delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
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

        {/* Input Area */}
        <View style={styles.inputContainer}>
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
  keyboardAvoidingView: {
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
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
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
});

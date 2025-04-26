import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";

// FAQ data structure
const faqItems = [
  {
    question: "What is FundLoop?",
    answer:
      "FundLoop is Egypt's first proprietary trading platform, designed to empower traders with the capital and tools they need to succeed in the financial markets. We provide funding for profitable traders, allowing them to trade with our capital and keep a significant portion of the profits.",
  },
  {
    question: "How does the evaluation process work?",
    answer:
      "Our evaluation process consists of two phases: Phase 1 requires demonstrating consistent profitability while adhering to trading rules. Phase 2 confirms your trading consistency with reduced risk parameters. Upon successful completion, you'll receive a funded trading account.",
  },
  {
    question: "What is the profit-sharing arrangement?",
    answer:
      "Our profit-sharing model is structured as 80/20, with 80% going to the trader and 20% to FundLoop. This competitive split ensures that traders are properly rewarded for their skill and discipline.",
  },
  {
    question: "What markets can I trade?",
    answer:
      "FundLoop provides access to a wide range of financial markets, including forex, commodities, indices, and cryptocurrencies. This diversity allows traders to apply their strategies across multiple asset classes.",
  },
  {
    question: "Are there any trading restrictions?",
    answer:
      "Yes, we have some basic trading rules designed to manage risk effectively. These include maximum daily drawdown limits, maximum overall drawdown limits, and restrictions on certain high-risk trading practices like martingale strategies.",
  },
  {
    question: "How and when do I receive my profit share?",
    answer:
      "Profit payouts occur on a monthly basis, subject to minimum payout thresholds and verification processes. You can track your performance and expected payouts through your account dashboard.",
  },
  {
    question: "What happens if I lose money?",
    answer:
      "If your account reaches the maximum drawdown limit, the account will be suspended. However, depending on your overall performance and the circumstances, you may be eligible for a reset or a new evaluation opportunity.",
  },
  {
    question: "What support do you offer for traders?",
    answer:
      "We provide comprehensive support for our traders, including detailed documentation, live chat support, and direct access to our team for technical or account-related issues. We're committed to helping you succeed on our platform.",
  },
  {
    question: "Can I trade from anywhere in the world?",
    answer:
      "Yes, FundLoop is accessible globally. However, there may be specific regulatory restrictions in certain countries. Please check our Terms of Service or contact our support team for more information about your specific location.",
  },
  {
    question: "How secure is my data on FundLoop?",
    answer:
      "We take data security very seriously. FundLoop implements industry-standard encryption and security protocols to protect your personal and financial information. For more details, please refer to our Privacy Policy.",
  },
  {
    question: "What trading platforms does FundLoop support?",
    answer:
      "FundLoop supports industry-standard trading platforms including MetaTrader 4 (MT4), MetaTrader 5 (MT5), and cTrader. These platforms provide advanced charting, automated trading capabilities, and a wide range of technical indicators to support your trading strategies.",
  },
  {
    question: "Do I need to be an experienced trader to join FundLoop?",
    answer:
      "While previous trading experience is beneficial, it's not mandatory. We welcome traders of all skill levels. However, you will need to successfully complete our evaluation process, which requires demonstrating profitable trading skills and risk management discipline.",
  },
  {
    question: "What are the account size options available?",
    answer:
      "FundLoop offers various account sizes ranging from $10,000 to $200,000. The evaluation fee varies based on the account size you choose. Larger accounts typically require more stringent evaluation criteria but offer greater profit potential.",
  },
  {
    question: "Can I trade news events?",
    answer:
      "Yes, you can trade during news events. However, we recommend caution as these periods can be highly volatile. Some specific high-impact news events may have trading restrictions to protect against extreme market volatility. These restrictions, if any, will be clearly communicated in your account rules.",
  },
  {
    question: "What happens if I violate a trading rule?",
    answer:
      "Rule violations are handled on a case-by-case basis. Minor violations may result in warnings, while serious or repeated violations can lead to account suspension or termination. We always aim to be fair and transparent in evaluating rule violations and determining appropriate consequences.",
  },
  {
    question: "Can I hold positions over weekends?",
    answer:
      "Yes, you can hold positions over weekends. However, you should be aware of the potential gap risk when markets reopen. We recommend managing your risk appropriately when holding weekend positions, especially during periods of anticipated market uncertainty.",
  },
  {
    question: "Is there a time limit to complete the evaluation phases?",
    answer:
      "Yes, each phase of the evaluation has a minimum and maximum time limit. The minimum ensures you demonstrate consistent trading rather than taking excessive risks, while the maximum gives you reasonable time to meet the profit targets. Specific time frames are detailed in your evaluation package information.",
  },
  {
    question: "Can I withdraw my initial evaluation fee?",
    answer:
      "The evaluation fee is non-refundable as it covers the cost of providing you with our capital to trade during the evaluation process. However, once you reach the funded stage, your profit share can far exceed your initial investment if you trade successfully.",
  },
  {
    question: "Do you offer any educational resources for traders?",
    answer:
      "Yes, FundLoop provides a range of educational resources including webinars, trading guides, market analysis, and strategy discussions. We believe in continuous improvement and offer these resources to help you enhance your trading skills and maximize your success on our platform.",
  },
  {
    question: "What happens if there are technical issues with the platform?",
    answer:
      "We have a dedicated technical support team available to assist with any platform issues. In cases where technical problems impact your trading, we have policies in place to ensure you're not penalized for circumstances beyond your control. Contact our support team immediately if you encounter any technical difficulties.",
  },
];

export default function FAQScreen() {
  const { currentTheme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    setShowBackToTop(scrollOffset > 200);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header with back button */}
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
        <View style={styles.headerTitleContainer}>
          <ThemedText type="title">Frequently Asked Questions</ThemedText>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView variant="card" style={styles.contentCard}>
          <View style={styles.introSection}>
            <ThemedText style={styles.introText}>
              Find answers to the most common questions about FundLoop's
              proprietary trading platform, evaluation process, and funding
              programs.
            </ThemedText>
          </View>

          <View style={styles.faqSection}>
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleItem(index)}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.questionText}
                  >
                    {item.question}
                  </ThemedText>
                  <Ionicons
                    name={expandedItems[index] ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={Colors[currentTheme].primary}
                  />
                </TouchableOpacity>

                {expandedItems[index] && (
                  <View style={styles.answerContainer}>
                    <ThemedText style={styles.answerText}>
                      {item.answer}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.supportSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Still have questions?
            </ThemedText>
            <ThemedText style={styles.supportText}>
              If you couldn't find the answer to your question, our support team
              is here to help.
            </ThemedText>
            <View style={styles.supportButtons}>
              <TouchableOpacity
                style={[
                  styles.supportButton,
                  { backgroundColor: Colors[currentTheme].primary },
                ]}
                onPress={() => router.push("/live-chat")}
              >
                <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>
                  Contact Support
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>

        {/* Extra space at bottom for better scrolling */}
        <View style={styles.footer} />
      </ScrollView>

      {/* Back to top button */}
      {showBackToTop && (
        <TouchableOpacity
          style={[
            styles.backToTopButton,
            { backgroundColor: Colors[currentTheme].primary },
          ]}
          onPress={scrollToTop}
        >
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          <ThemedText style={styles.backToTopText}>Back to Top</ThemedText>
        </TouchableOpacity>
      )}
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
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 40, // Balance for back button width
  },
  scrollView: {
    flex: 1,
  },
  contentCard: {
    margin: 16,
    padding: 0, // No padding here - we'll add it in sections
    borderRadius: 16,
    overflow: "hidden",
  },
  introSection: {
    padding: 24,
  },
  introText: {
    lineHeight: 22,
    textAlign: "center",
  },
  faqSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  questionText: {
    flex: 1,
    paddingRight: 16,
  },
  answerContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  answerText: {
    lineHeight: 22,
  },
  supportSection: {
    padding: 24,
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: 10,
    textAlign: "center",
  },
  supportText: {
    textAlign: "center",
    marginBottom: 20,
  },
  supportButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 10,
  },
  footer: {
    height: 100,
  },
  backToTopButton: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    bottom: 30,
    right: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backToTopText: {
    color: "#FFFFFF",
    marginLeft: 8,
  },
});

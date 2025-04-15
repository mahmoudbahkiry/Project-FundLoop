import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export default function TermsOfServiceScreen() {
  const { currentTheme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    setShowBackToTop(scrollOffset > 200);
  };
  
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
          <ThemedText type="title">Terms of Service</ThemedText>
        </View>
      </View>
      
      {/* Last updated timestamp */}
      <ThemedText style={styles.timestamp}>Last Updated: March 11, 2025</ThemedText>
      
      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView variant="card" style={styles.contentCard}>
          {/* Introduction */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Introduction</ThemedText>
            <ThemedText style={styles.paragraph}>
              Welcome to FundLoop, Egypt's premier proprietary trading platform. These Terms of Service ("Terms") govern your access to and use of the FundLoop application and services (collectively, the "Service").
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
            </ThemedText>
          </View>

          {/* User Eligibility */}
          <View style={styles.section}>
            <ThemedText type="subtitle">User Eligibility</ThemedText>
            <ThemedText style={styles.paragraph}>
              To use the FundLoop Service, you must be at least 18 years of age and have the legal capacity to enter into a binding agreement. By using our Service, you represent and warrant that:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• You are at least 18 years old</ThemedText>
              <ThemedText style={styles.bulletItem}>• You have the legal capacity to enter into these Terms</ThemedText>
              <ThemedText style={styles.bulletItem}>• You are not prohibited from using the Service under applicable laws</ThemedText>
              <ThemedText style={styles.bulletItem}>• You will comply with these Terms and all applicable local, state, national, and international laws, rules, and regulations</ThemedText>
            </View>
          </View>

          {/* Account Registration and Security */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Account Registration and Security</ThemedText>
            <ThemedText style={styles.paragraph}>
              To access certain features of the Service, you must register for an account. When you register, you agree to provide accurate, current, and complete information about yourself.
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              You are responsible for:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Maintaining the confidentiality of your account credentials</ThemedText>
              <ThemedText style={styles.bulletItem}>• Restricting access to your account</ThemedText>
              <ThemedText style={styles.bulletItem}>• All activities that occur under your account</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              You must notify FundLoop immediately of any breach of security or unauthorized use of your account. FundLoop will not be liable for any losses caused by unauthorized use of your account.
            </ThemedText>
          </View>

          {/* Proprietary Trading Model */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Proprietary Trading Model</ThemedText>
            <ThemedText style={styles.paragraph}>
              FundLoop operates a proprietary trading model that provides qualified traders with access to trading capital. Our model consists of two primary phases:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Evaluation Phase: Traders demonstrate their skills and risk management abilities using a simulated account</ThemedText>
              <ThemedText style={styles.bulletItem}>• Funded Phase: Successful traders receive access to real capital for trading in live markets</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              FundLoop retains ownership of all trading accounts and capital. Traders are not investing their own capital in the funded accounts but are instead trading FundLoop's capital under a profit-sharing arrangement.
            </ThemedText>
          </View>

          {/* Evaluation Process Rules */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Evaluation Process Rules</ThemedText>
            <ThemedText style={styles.paragraph}>
              The evaluation process is designed to assess your trading skills, discipline, and risk management. During the evaluation phase:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• You must adhere to all trading parameters, including maximum drawdown limits, profit targets, and trading time restrictions</ThemedText>
              <ThemedText style={styles.bulletItem}>• You must demonstrate consistent trading performance over the specified evaluation period</ThemedText>
              <ThemedText style={styles.bulletItem}>• You must follow proper risk management practices, including position sizing and stop-loss implementation</ThemedText>
              <ThemedText style={styles.bulletItem}>• You must not engage in prohibited trading strategies or manipulative practices</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              FundLoop reserves the right to modify the evaluation criteria at any time. Any changes will be communicated to users through the Service.
            </ThemedText>
          </View>

          {/* Funded Account Rules and Profit-Sharing */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Funded Account Rules and Profit-Sharing</ThemedText>
            <ThemedText style={styles.paragraph}>
              Traders who successfully complete the evaluation phase may be offered a funded trading account subject to the following terms:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Profit Split: Profits generated from funded accounts are split 80/20, with 80% going to the trader and 20% to FundLoop</ThemedText>
              <ThemedText style={styles.bulletItem}>• Drawdown Limits: Funded accounts are subject to maximum drawdown limits, which if breached, may result in account termination</ThemedText>
              <ThemedText style={styles.bulletItem}>• Trading Rules: Traders must continue to adhere to all trading rules and parameters established for their funded account</ThemedText>
              <ThemedText style={styles.bulletItem}>• Payout Schedule: Profit payouts occur on a monthly basis, subject to minimum payout thresholds and verification processes</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              FundLoop reserves the right to modify the funded account terms, including profit-sharing percentages and drawdown limits, with 30 days' notice to traders.
            </ThemedText>
          </View>

          {/* Prohibited Activities */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Prohibited Activities</ThemedText>
            <ThemedText style={styles.paragraph}>
              When using the FundLoop Service, you agree not to:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Engage in market manipulation, including but not limited to spoofing, layering, or wash trading</ThemedText>
              <ThemedText style={styles.bulletItem}>• Use automated trading systems, expert advisors, or algorithms without prior written approval</ThemedText>
              <ThemedText style={styles.bulletItem}>• Share account access with unauthorized third parties</ThemedText>
              <ThemedText style={styles.bulletItem}>• Attempt to exploit technical glitches or pricing errors</ThemedText>
              <ThemedText style={styles.bulletItem}>• Trade on material non-public information or engage in insider trading</ThemedText>
              <ThemedText style={styles.bulletItem}>• Violate any applicable laws, regulations, or exchange rules</ThemedText>
              <ThemedText style={styles.bulletItem}>• Attempt to reverse-engineer, decompile, or disassemble any portion of the Service</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              Violation of these prohibitions may result in immediate termination of your account, forfeiture of profits, and potential legal action.
            </ThemedText>
          </View>

          {/* Risk Disclaimers */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Risk Disclaimers</ThemedText>
            <ThemedText style={styles.paragraph}>
              Trading financial instruments involves significant risk. By using the FundLoop Service, you acknowledge and accept that:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Trading involves the risk of loss and is not suitable for all individuals</ThemedText>
              <ThemedText style={styles.bulletItem}>• Past performance is not indicative of future results</ThemedText>
              <ThemedText style={styles.bulletItem}>• Market volatility can lead to rapid and substantial losses</ThemedText>
              <ThemedText style={styles.bulletItem}>• Technical issues, including connectivity problems, may affect trading execution</ThemedText>
              <ThemedText style={styles.bulletItem}>• You should only trade with capital you can afford to lose</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              FundLoop does not guarantee profits or protection against losses. You are solely responsible for your trading decisions and should seek advice from an independent financial advisor if you have any doubts.
            </ThemedText>
          </View>

          {/* Intellectual Property Rights */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Intellectual Property Rights</ThemedText>
            <ThemedText style={styles.paragraph}>
              The FundLoop Service and its original content, features, and functionality are owned by FundLoop and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              You may not:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Reproduce, distribute, modify, or create derivative works of the Service</ThemedText>
              <ThemedText style={styles.bulletItem}>• Use any FundLoop trademarks, logos, or branding without express permission</ThemedText>
              <ThemedText style={styles.bulletItem}>• Remove any copyright or other proprietary notices from the Service</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              Any feedback, comments, or suggestions you provide regarding the Service may be used by FundLoop without any obligation to compensate you.
            </ThemedText>
          </View>

          {/* Limitation of Liability */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Limitation of Liability</ThemedText>
            <ThemedText style={styles.paragraph}>
              To the maximum extent permitted by law, FundLoop and its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Your access to or use of or inability to access or use the Service</ThemedText>
              <ThemedText style={styles.bulletItem}>• Any conduct or content of any third party on the Service</ThemedText>
              <ThemedText style={styles.bulletItem}>• Any content obtained from the Service</ThemedText>
              <ThemedText style={styles.bulletItem}>• Unauthorized access, use, or alteration of your transmissions or content</ThemedText>
              <ThemedText style={styles.bulletItem}>• Trading losses or market fluctuations</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              In no event shall FundLoop's total liability to you for all claims exceed the amount you have paid to FundLoop for the Service during the twelve (12) months preceding the event giving rise to the liability.
            </ThemedText>
          </View>

          {/* Termination Conditions */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Termination Conditions</ThemedText>
            <ThemedText style={styles.paragraph}>
              FundLoop may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Violation of these Terms</ThemedText>
              <ThemedText style={styles.bulletItem}>• Breach of trading rules or risk parameters</ThemedText>
              <ThemedText style={styles.bulletItem}>• Engaging in prohibited activities</ThemedText>
              <ThemedText style={styles.bulletItem}>• At our sole discretion, for any reason whatsoever</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
            </ThemedText>
          </View>

          {/* Dispute Resolution */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Dispute Resolution</ThemedText>
            <ThemedText style={styles.paragraph}>
              Any disputes arising out of or relating to these Terms or the Service shall be resolved through the following process:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Informal Negotiation: Parties will attempt to resolve any disputes through good-faith negotiation</ThemedText>
              <ThemedText style={styles.bulletItem}>• Mediation: If negotiation fails, the parties will seek mediation through a mutually agreed-upon mediator</ThemedText>
              <ThemedText style={styles.bulletItem}>• Arbitration: If mediation is unsuccessful, disputes will be resolved through binding arbitration in Cairo, Egypt</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              The arbitration shall be conducted in accordance with the rules of the Cairo Regional Centre for International Commercial Arbitration. The decision of the arbitrator shall be final and binding on both parties.
            </ThemedText>
          </View>

          {/* Governing Law */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Governing Law</ThemedText>
            <ThemedText style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with the laws of Egypt, without regard to its conflict of law provisions.
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              Your use of the Service may also be subject to other local, state, national, or international laws, particularly those related to financial markets, securities trading, and anti-money laundering regulations.
            </ThemedText>
          </View>

          {/* Updates to Terms */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Updates to Terms</ThemedText>
            <ThemedText style={styles.paragraph}>
              FundLoop reserves the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
            </ThemedText>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Contact Information</ThemedText>
            <ThemedText style={styles.paragraph}>
              If you have any questions about these Terms, please contact us at:
            </ThemedText>
            <ThemedText style={[styles.paragraph, styles.contactInfo]}>
              FundLoop Legal Department{'\n'}
              Email: legal@fundloop.com{'\n'}
              Address: 123 Financial District, Cairo, Egypt{'\n'}
              Phone: +20 2 1234 5678
            </ThemedText>
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
            { backgroundColor: Colors[currentTheme].primary }
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // To offset the back button and center the title
  },
  timestamp: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentCard: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  subheading: {
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 22,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 16,
  },
  bulletItem: {
    marginBottom: 8,
    lineHeight: 22,
  },
  contactInfo: {
    marginTop: 8,
    lineHeight: 24,
  },
  backToTopButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  backToTopText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    height: 100,
  },
});

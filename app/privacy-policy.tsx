import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export default function PrivacyPolicyScreen() {
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
          <ThemedText type="title">Privacy Policy</ThemedText>
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
              FundLoop ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our proprietary trading application and related services (collectively, the "Service").
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
            </ThemedText>
          </View>

          {/* Information We Collect */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Information We Collect</ThemedText>
            
            <ThemedText type="defaultSemiBold" style={styles.subheading}>Personal Information</ThemedText>
            <ThemedText style={styles.paragraph}>
              We may collect personal information that you voluntarily provide when using our Service, including:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Full name and contact details (email address, phone number)</ThemedText>
              <ThemedText style={styles.bulletItem}>• Date of birth and national identification information</ThemedText>
              <ThemedText style={styles.bulletItem}>• Banking and payment information</ThemedText>
              <ThemedText style={styles.bulletItem}>• Professional background and trading experience</ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.subheading}>Trading Data</ThemedText>
            <ThemedText style={styles.paragraph}>
              We collect information related to your trading activities, including:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Trading history and patterns</ThemedText>
              <ThemedText style={styles.bulletItem}>• Account balances and transaction records</ThemedText>
              <ThemedText style={styles.bulletItem}>• Performance metrics and statistics</ThemedText>
              <ThemedText style={styles.bulletItem}>• Risk management settings and preferences</ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.subheading}>Device Information</ThemedText>
            <ThemedText style={styles.paragraph}>
              When you access our Service, we automatically collect certain information about your device, including:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Device type, operating system, and browser type</ThemedText>
              <ThemedText style={styles.bulletItem}>• IP address and geographic location</ThemedText>
              <ThemedText style={styles.bulletItem}>• Mobile device identifiers</ThemedText>
              <ThemedText style={styles.bulletItem}>• Usage data and interaction with our Service</ThemedText>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <ThemedText type="subtitle">How We Use Your Information</ThemedText>
            <ThemedText style={styles.paragraph}>
              We use the information we collect for various purposes, including:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Providing, maintaining, and improving our Service</ThemedText>
              <ThemedText style={styles.bulletItem}>• Processing transactions and managing your account</ThemedText>
              <ThemedText style={styles.bulletItem}>• Evaluating your trading performance and eligibility for funded accounts</ThemedText>
              <ThemedText style={styles.bulletItem}>• Communicating with you about your account, updates, and support</ThemedText>
              <ThemedText style={styles.bulletItem}>• Analyzing usage patterns to enhance user experience</ThemedText>
              <ThemedText style={styles.bulletItem}>• Detecting and preventing fraudulent or unauthorized activities</ThemedText>
              <ThemedText style={styles.bulletItem}>• Complying with legal obligations and regulatory requirements</ThemedText>
            </View>
          </View>

          {/* Data Protection Measures */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Data Protection Measures</ThemedText>
            <ThemedText style={styles.paragraph}>
              We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Encryption of sensitive data</ThemedText>
              <ThemedText style={styles.bulletItem}>• Secure authentication protocols</ThemedText>
              <ThemedText style={styles.bulletItem}>• Regular security assessments and audits</ThemedText>
              <ThemedText style={styles.bulletItem}>• Access controls and monitoring systems</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </ThemedText>
          </View>

          {/* Third-Party Service Providers */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Third-Party Service Providers</ThemedText>
            <ThemedText style={styles.paragraph}>
              We may share your information with third-party service providers who perform services on our behalf, such as:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Payment processors and financial institutions</ThemedText>
              <ThemedText style={styles.bulletItem}>• Data analytics providers</ThemedText>
              <ThemedText style={styles.bulletItem}>• Customer support services</ThemedText>
              <ThemedText style={styles.bulletItem}>• Cloud hosting and storage providers</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              These third parties are contractually obligated to use your information only for the purposes for which we disclose it to them and in accordance with this Privacy Policy.
            </ThemedText>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Your Rights</ThemedText>
            <ThemedText style={styles.paragraph}>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• The right to access and receive a copy of your personal information</ThemedText>
              <ThemedText style={styles.bulletItem}>• The right to rectify or update inaccurate or incomplete information</ThemedText>
              <ThemedText style={styles.bulletItem}>• The right to delete your personal information in certain circumstances</ThemedText>
              <ThemedText style={styles.bulletItem}>• The right to restrict or object to processing of your information</ThemedText>
              <ThemedText style={styles.bulletItem}>• The right to data portability</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              To exercise these rights, please contact us using the information provided in the "Contact Information" section below.
            </ThemedText>
          </View>

          {/* Cookie Policy */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Cookie Policy</ThemedText>
            <ThemedText style={styles.paragraph}>
              We use cookies and similar tracking technologies to collect information about your browsing activities and to remember your preferences. Cookies are small data files that are stored on your device when you visit our website or use our application.
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              We use the following types of cookies:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Essential cookies: Required for the operation of our Service</ThemedText>
              <ThemedText style={styles.bulletItem}>• Analytical cookies: Help us understand how users interact with our Service</ThemedText>
              <ThemedText style={styles.bulletItem}>• Functional cookies: Remember your preferences and settings</ThemedText>
              <ThemedText style={styles.bulletItem}>• Targeting cookies: Deliver relevant advertisements</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              You can control cookies through your browser settings and other tools. However, disabling certain cookies may limit your ability to use some features of our Service.
            </ThemedText>
          </View>

          {/* Accessing and Modifying Your Information */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Accessing and Modifying Your Information</ThemedText>
            <ThemedText style={styles.paragraph}>
              You can access, update, or delete your personal information by:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• Logging into your account and updating your profile settings</ThemedText>
              <ThemedText style={styles.bulletItem}>• Contacting our customer support team</ThemedText>
              <ThemedText style={styles.bulletItem}>• Submitting a request through our designated privacy channels</ThemedText>
            </View>
            <ThemedText style={styles.paragraph}>
              We will respond to your request within a reasonable timeframe. Please note that we may retain certain information as required by law or for legitimate business purposes.
            </ThemedText>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Contact Information</ThemedText>
            <ThemedText style={styles.paragraph}>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
            </ThemedText>
            <ThemedText style={[styles.paragraph, styles.contactInfo]}>
              FundLoop Privacy Team{'\n'}
              Email: privacy@fundloop.com{'\n'}
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

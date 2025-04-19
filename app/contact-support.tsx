import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedButton } from "@/components/ThemedButton";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";

export default function ContactSupportScreen() {
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

  const handleEmailPress = () => {
    Linking.openURL("mailto:Mahmoudelbahkiry@fundloop.com");
  };

  const handleCallPress = () => {
    Linking.openURL("tel:+201020855850");
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
          <ThemedText type="title">Contact Support</ThemedText>
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
          {/* CEO Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require("@/assets/images/profilePicture.jpg")}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>

            <ThemedText type="heading" style={styles.nameText}>
              Mahmoud Sherif Elbahkiry
            </ThemedText>
            <ThemedText type="subtitle" style={styles.positionText}>
              Chief Executive Officer
            </ThemedText>

            <View style={styles.divider} />

            <ThemedText style={styles.bioText}>
              As the founder and CEO of FundLoop, Mahmoud leads Egypt's first
              proprietary trading platform with a vision to empower traders
              across the MENA region with institutional-grade tools and capital.
            </ThemedText>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Contact Information
            </ThemedText>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleEmailPress}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors[currentTheme].primary },
                ]}
              >
                <Ionicons name="mail" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.contactTextContainer}>
                <ThemedText type="defaultSemiBold">Email</ThemedText>
                <ThemedText>Mahmoudelbahkiry@fundloop.com</ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[currentTheme].text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleCallPress}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors[currentTheme].primary },
                ]}
              >
                <Ionicons name="call" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.contactTextContainer}>
                <ThemedText type="defaultSemiBold">Phone</ThemedText>
                <ThemedText>+201020855850</ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[currentTheme].text}
              />
            </TouchableOpacity>
          </View>

          {/* Support Options */}
          <View style={styles.supportSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Get Support
            </ThemedText>

            <View style={styles.supportOptions}>
              <TouchableOpacity
                style={[
                  styles.supportOption,
                  { backgroundColor: Colors[currentTheme].background },
                ]}
                onPress={() => router.push("/live-chat")}
              >
                <View
                  style={[
                    styles.supportIconContainer,
                    { backgroundColor: Colors[currentTheme].primary },
                  ]}
                >
                  <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.supportOptionText}
                >
                  Live Chat
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.supportOption,
                  { backgroundColor: Colors[currentTheme].background },
                ]}
              >
                <View
                  style={[
                    styles.supportIconContainer,
                    { backgroundColor: Colors[currentTheme].primary },
                  ]}
                >
                  <Ionicons name="help-circle" size={28} color="#FFFFFF" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.supportOptionText}
                >
                  FAQ
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit a Ticket */}
          <View style={styles.ticketSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Submit a Support Ticket
            </ThemedText>
            <ThemedText style={styles.ticketDescription}>
              For technical issues or account-related inquiries, our support
              team is ready to help.
            </ThemedText>
            <ThemedButton
              title="Create Support Ticket"
              variant="primary"
              onPress={() => {}}
              style={styles.ticketButton}
            />
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
  profileSection: {
    alignItems: "center",
    padding: 24,
    paddingTop: 40,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  nameText: {
    textAlign: "center",
    marginBottom: 8,
  },
  positionText: {
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.8,
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 20,
  },
  bioText: {
    textAlign: "center",
    lineHeight: 22,
  },
  contactSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  supportSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  supportOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  supportOption: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  supportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  supportOptionText: {
    textAlign: "center",
  },
  ticketSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  ticketDescription: {
    marginBottom: 20,
  },
  ticketButton: {
    paddingVertical: 14,
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

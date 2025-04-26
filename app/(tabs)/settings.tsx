import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedSwitch } from "@/components/ThemedSwitch";
import { ThemeSettings } from "@/components/ThemeSettings";
import { ThemeTest } from "@/components/ThemeTest";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { currentTheme } = useTheme();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Toggle states
  const [showVolume, setShowVolume] = useState(true);
  const [showMovingAverages, setShowMovingAverages] = useState(true);
  const [candlestickView, setCandlestickView] = useState(true);
  const [confirmOrders, setConfirmOrders] = useState(true);
  const [tradeExecutions, setTradeExecutions] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsNotifications, setNewsNotifications] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Load saved settings
  useEffect(() => {
    // In a real app, we would load these values from AsyncStorage or an API
    // For this example, we'll just use the default values set above
    console.log("Settings loaded");
  }, []);

  // Settings sections
  const settingsSections = [
    {
      title: "App Preferences",
      icon: "options-outline",
      items: [
        {
          title: "Theme",
          component: (
            <View>
              <ThemeSettings />
            </View>
          ),
          expanded: true,
        },
        {
          title: "Chart Preferences",
          component: (
            <ThemedView variant="card" style={styles.settingItemContent}>
              <View style={styles.settingRow}>
                <ThemedText>Show Volume</ThemedText>
                <ThemedSwitch
                  value={showVolume}
                  onValueChange={(value) => {
                    setShowVolume(value);
                    console.log("Show Volume:", value);
                  }}
                />
              </View>
              <View style={styles.settingRow}>
                <ThemedText>Show Moving Averages</ThemedText>
                <ThemedSwitch
                  value={showMovingAverages}
                  onValueChange={(value) => {
                    setShowMovingAverages(value);
                    console.log("Show Moving Averages:", value);
                  }}
                />
              </View>
              <View style={styles.settingRow}>
                <ThemedText>Candlestick View</ThemedText>
                <ThemedSwitch
                  value={candlestickView}
                  onValueChange={(value) => {
                    setCandlestickView(value);
                    console.log("Candlestick View:", value);
                  }}
                />
              </View>
            </ThemedView>
          ),
          expanded: false,
        },
        {
          title: "Default Order Settings",
          component: (
            <ThemedView variant="card" style={styles.settingItemContent}>
              <View style={styles.settingRow}>
                <ThemedText>Default Order Type</ThemedText>
                <ThemedText type="defaultSemiBold">Market</ThemedText>
              </View>
              <View style={styles.settingRow}>
                <ThemedText>Default Time in Force</ThemedText>
                <ThemedText type="defaultSemiBold">Day</ThemedText>
              </View>
              <View style={styles.settingRow}>
                <ThemedText>Confirm Orders</ThemedText>
                <ThemedSwitch
                  value={confirmOrders}
                  onValueChange={(value) => {
                    setConfirmOrders(value);
                    console.log("Confirm Orders:", value);
                  }}
                />
              </View>
            </ThemedView>
          ),
          expanded: false,
        },
      ],
    },
    {
      title: "Notification Settings",
      icon: "notifications-outline",
      items: [
        {
          title: "Push Notifications",
          component: (
            <ThemedView variant="card" style={styles.settingItemContent}>
              <View style={styles.settingRow}>
                <ThemedText>Trade Executions</ThemedText>
                <ThemedSwitch
                  value={tradeExecutions}
                  onValueChange={(value) => {
                    setTradeExecutions(value);
                    console.log("Trade Executions:", value);
                  }}
                />
              </View>
              <View style={styles.settingRow}>
                <ThemedText>Price Alerts</ThemedText>
                <ThemedSwitch
                  value={priceAlerts}
                  onValueChange={(value) => {
                    setPriceAlerts(value);
                    console.log("Price Alerts:", value);
                  }}
                />
              </View>
              <View style={styles.settingRow}>
                <ThemedText>News</ThemedText>
                <ThemedSwitch
                  value={newsNotifications}
                  onValueChange={(value) => {
                    setNewsNotifications(value);
                    console.log("News:", value);
                  }}
                />
              </View>
            </ThemedView>
          ),
          expanded: false,
        },
      ],
    },
    {
      title: "Security Settings",
      icon: "shield-outline",
      items: [
        {
          title: "Security Options",
          component: (
            <ThemedView variant="card" style={styles.settingItemContent}>
              <View style={styles.settingRow}>
                <ThemedText>Biometric Authentication</ThemedText>
                <ThemedSwitch
                  value={biometricAuth}
                  onValueChange={(value) => {
                    setBiometricAuth(value);
                    console.log("Biometric Auth:", value);
                  }}
                />
              </View>
              <View style={styles.settingRow}>
                <ThemedText>Two-Factor Authentication</ThemedText>
                <ThemedSwitch
                  value={twoFactorAuth}
                  onValueChange={(value) => {
                    setTwoFactorAuth(value);
                    console.log("2FA:", value);
                  }}
                />
              </View>
              <TouchableOpacity style={styles.settingButton}>
                <ThemedText type="link">Change Password</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ),
          expanded: false,
        },
      ],
    },
    {
      title: "Support & Help Center",
      icon: "help-circle-outline",
      items: [
        {
          title: "Support Resources",
          component: (
            <ThemedView variant="card" style={styles.settingItemContent}>
              <TouchableOpacity
                style={styles.supportOption}
                onPress={() => router.push("/documentation")}
              >
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color={Colors[currentTheme].primary}
                  style={styles.supportIcon}
                />
                <ThemedText>Documentation</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.supportOption}
                onPress={() => router.push("/contact-support")}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color={Colors[currentTheme].primary}
                  style={styles.supportIcon}
                />
                <ThemedText>Contact Support</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.supportOption}
                onPress={() => router.push("/faq")}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={Colors[currentTheme].primary}
                  style={styles.supportIcon}
                />
                <ThemedText>FAQ</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ),
          expanded: false,
        },
      ],
    },
    {
      title: "About FundLoop",
      icon: "information-circle-outline",
      items: [
        {
          title: "App Information",
          component: (
            <ThemedView variant="card" style={styles.settingItemContent}>
              <View style={styles.aboutSection}>
                <ThemedText type="subtitle" style={styles.appName}>
                  FundLoop
                </ThemedText>
                <ThemedText style={styles.versionText}>
                  Version 1.0.0
                </ThemedText>
                <ThemedText style={styles.aboutText}>
                  Egypt's first proprietary trading platform, designed to
                  empower traders with the capital and tools they need to
                  succeed in the financial markets.
                </ThemedText>
                <View style={styles.aboutLinks}>
                  <TouchableOpacity
                    style={styles.aboutLink}
                    onPress={() => router.push("/privacy-policy")}
                  >
                    <ThemedText type="link">Privacy Policy</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.aboutLink}
                    onPress={() => router.push("/terms-of-service")}
                  >
                    <ThemedText type="link">Terms of Service</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedView>
          ),
          expanded: false,
        },
      ],
    },
  ];

  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState(
    settingsSections.map((section) =>
      section.items.map((item) => item.expanded)
    )
  );

  // Toggle section expansion
  const toggleSection = (sectionIndex: number, itemIndex: number) => {
    const newExpandedSections = [...expandedSections];
    newExpandedSections[sectionIndex] = [...newExpandedSections[sectionIndex]];
    newExpandedSections[sectionIndex][itemIndex] =
      !newExpandedSections[sectionIndex][itemIndex];
    setExpandedSections(newExpandedSections);
  };

  // Handle logout
  const handleLogout = async () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await signOut();
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        "Logout Failed",
        "An error occurred while logging out. Please try again."
      );
    }
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <ThemedText type="heading" style={styles.headerTitle}>
            Settings
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name={section.icon as any}
                size={24}
                color={Colors[currentTheme].primary}
                style={styles.sectionIcon}
              />
              <ThemedText type="subtitle">{section.title}</ThemedText>
            </View>

            {section.items.map((item, itemIndex) => (
              <View key={item.title} style={styles.settingItem}>
                <TouchableOpacity
                  style={styles.settingHeader}
                  onPress={() => toggleSection(sectionIndex, itemIndex)}
                >
                  <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                  <Ionicons
                    name={
                      expandedSections[sectionIndex][itemIndex]
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={20}
                    color={Colors[currentTheme].icon}
                  />
                </TouchableOpacity>

                {expandedSections[sectionIndex][itemIndex] && (
                  <View style={styles.settingContent}>{item.component}</View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderColor: Colors[currentTheme].primary },
          ]}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={Colors[currentTheme].primary}
            style={styles.logoutIcon}
          />
          <ThemedText style={{ color: Colors[currentTheme].primary }}>
            Logout
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <ThemedView variant="elevated" style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Confirm Logout
            </ThemedText>
            <ThemedText style={styles.modalText}>
              Are you sure you want to log out of your account?
            </ThemedText>
            <View style={styles.modalButtons}>
              <ThemedButton
                title="Cancel"
                variant="outline"
                onPress={cancelLogout}
                style={styles.modalButton}
              />
              <ThemedButton
                title="Yes, Logout"
                variant="primary"
                onPress={confirmLogout}
                style={styles.modalButton}
              />
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flex: 1,
  },
  headerTitle: {
    color: "#2ECC71",
    fontSize: 32,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 12,
  },
  settingItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
  settingContent: {
    marginTop: 8,
  },
  settingItemContent: {
    padding: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingButton: {
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  supportOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  supportIcon: {
    marginRight: 16,
  },
  aboutSection: {
    alignItems: "center",
    padding: 16,
  },
  appName: {
    marginBottom: 8,
  },
  versionText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  aboutText: {
    textAlign: "center",
    marginBottom: 20,
  },
  aboutLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  aboutLink: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutIcon: {
    marginRight: 12,
  },
  footer: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
});

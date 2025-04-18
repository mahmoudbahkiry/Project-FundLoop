import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemeSettings } from "@/components/ThemeSettings";

interface SettingItem {
  label: string;
  value: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

function AccountScreen() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2E3192" />
      </View>
    );
  }

  if (!user) {
    router.replace("/(auth)/welcome");
    return null;
  }

  const joinDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const accountSettings: SettingSection[] = [
    {
      title: "Trading Parameters",
      items: [
        { label: "Account Size", value: "$100,000" },
        { label: "Maximum Position Size", value: "$2,000" },
        { label: "Daily Loss Limit", value: "$3,000" },
      ],
    },
    {
      title: "Evaluation Status",
      items: [
        { label: "Current Phase", value: "Phase 1" },
        { label: "Days Remaining", value: "18 days" },
        { label: "Progress", value: "40%" },
      ],
    },
    {
      title: "Account Information",
      items: [
        { label: "Member Since", value: joinDate },
        { label: "Account Status", value: "Active" },
        { label: "Last Login", value: "Today, 10:30 AM" },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <View style={styles.settingItem} key={item.label}>
      <ThemedText style={styles.settingLabel}>{item.label}</ThemedText>
      <ThemedText style={styles.settingValue}>{item.value}</ThemedText>
    </View>
  );

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigateToProfile = () => {
    router.push("/profile");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.name}>
              {user.firstName} {user.lastName}
            </ThemedText>
            <ThemedText style={styles.email}>{user.email}</ThemedText>
            <ThemedText style={styles.accountType}>
              {user.authType === "email" ? "Email Account" : "Google Account"}
            </ThemedText>
          </View>
        </View>

        <ThemeSettings />

        {accountSettings.map((section) => (
          <View key={section.title} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <ThemedView variant="card" style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </ThemedView>
          </View>
        ))}

        <View style={styles.actionsSection}>
          <ThemedView variant="card" style={styles.actionButton}>
            <TouchableOpacity onPress={handleNavigateToProfile}>
              <ThemedText style={styles.actionButtonText}>
                Edit Profile
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {user.authType === "email" && (
            <ThemedView variant="card" style={styles.actionButton}>
              <TouchableOpacity>
                <ThemedText style={styles.actionButtonText}>
                  Change Password
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          <ThemedView variant="card" style={styles.actionButton}>
            <TouchableOpacity>
              <ThemedText style={styles.actionButtonText}>
                Notification Settings
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView
            variant="card"
            style={[styles.actionButton, styles.logoutButton]}
          >
            <TouchableOpacity onPress={handleLogout}>
              <ThemedText style={[styles.actionButtonText, styles.logoutText]}>
                Logout
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>

        <View style={styles.supportSection}>
          <ThemedText style={styles.supportTitle}>Need Help?</ThemedText>
          <ThemedView style={styles.supportButton}>
            <TouchableOpacity>
              <ThemedText style={styles.supportButtonText}>
                Contact Support
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileInfo: {
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  accountType: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  sectionContent: {
    borderRadius: 12,
    padding: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionsSection: {
    marginTop: 10,
    marginBottom: 25,
  },
  actionButton: {
    padding: 0,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    padding: 15,
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutText: {
    color: "red",
  },
  supportSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  supportButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AccountScreen;

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide the header completely
        tabBarStyle: {
          backgroundColor: theme === "dark" ? "#000000" : "#fff",
          borderTopWidth: 0, // Remove top border
          elevation: 8, // Add shadow on Android
          shadowColor: "#000", // Shadow color
          shadowOffset: { width: 0, height: -3 }, // Shadow position
          shadowOpacity: 0.1, // Shadow opacity
          shadowRadius: 4, // Shadow blur radius
          height: 80, // Increased height to avoid overlap with iPhone swipe-to-home gesture
          paddingBottom: 16, // Increased bottom padding for better spacing
        },
        tabBarActiveTintColor: Colors[theme].primary,
        tabBarInactiveTintColor: theme === "dark" ? "#9BA1A6" : "#687076",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
          href: {
            pathname: "/",
          },
        }}
      />

      <Tabs.Screen
        name="trading"
        options={{
          title: "Trading",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options" size={size} color={color} />
          ),
        }}
      />

      {/* Hide these screens from the tab bar */}
      <Tabs.Screen
        name="account"
        options={{
          href: null, // This removes it from the tab bar
        }}
      />
      <Tabs.Screen
        name="evaluation"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="performance"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

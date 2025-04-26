import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useDeviceColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { TradingProvider } from "../contexts/TradingContext";
import { useEffect, useRef } from "react";
import { router } from "expo-router";
import {
  initializeAnalytics,
  isAnalyticsAvailable,
} from "@/firebase/analyticsUtils";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

function RootLayoutNav() {
  const { user, loading, isLoginAttemptInProgress } = useAuth();

  // We'll use a ref to track if we've already navigated to welcome
  // This helps prevent repeated navigation attempts
  const hasNavigatedToWelcomeRef = useRef(false);

  useEffect(() => {
    const handleNavigation = async () => {
      console.log("RootLayoutNav: Navigation state check", {
        user: user ? { email: user.email, authType: user.authType } : null,
        loading,
        isLoginAttemptInProgress,
        hasNavigatedToWelcome: hasNavigatedToWelcomeRef.current,
      });

      if (loading) {
        // Don't navigate while loading
        console.log("RootLayoutNav: Still loading, skipping navigation");
        return;
      }

      try {
        // If a login attempt is in progress, don't navigate anywhere
        // This is the critical check that prevents unwanted redirects
        if (isLoginAttemptInProgress) {
          console.log(
            "RootLayoutNav: Login attempt in progress, preventing navigation"
          );
          return;
        }

        // At this point, we know:
        // 1. Auth state is loaded
        // 2. No login attempt is in progress

        if (!user) {
          // User is not authenticated

          // If a login attempt is in progress, don't navigate
          if (isLoginAttemptInProgress) {
            console.log(
              "RootLayoutNav: Login attempt in progress, staying on current screen"
            );
            return;
          }

          // Set the flag to indicate we've navigated to welcome
          // This prevents multiple navigation attempts
          if (!hasNavigatedToWelcomeRef.current) {
            console.log("RootLayoutNav: No user, navigating to welcome screen");
            hasNavigatedToWelcomeRef.current = true;
            await router.replace("/(auth)/welcome");
          }
        } else {
          // User is authenticated, navigate to tabs
          // Reset the welcome navigation flag
          hasNavigatedToWelcomeRef.current = false;

          console.log("RootLayoutNav: User found, navigating to tabs", {
            userEmail: user.email,
            authType: user.authType,
          });
          await router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("RootLayoutNav: Navigation error:", error);
      }
    };

    // Execute navigation logic immediately without delay
    // This removes the race condition caused by the setTimeout
    handleNavigation();
  }, [user, loading, isLoginAttemptInProgress]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          gestureEnabled: false, // Disable swipe back gesture for the tabs section
        }}
      />
      <Stack.Screen name="stock-details" options={{ headerShown: true }} />
      <Stack.Screen
        name="buy-stock"
        options={{ headerShown: true, title: "Buy Stock" }}
      />
      <Stack.Screen name="(withdraw)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  // Initialize Firebase Analytics
  useEffect(() => {
    const setupAnalytics = async () => {
      try {
        // Check if analytics is supported in this environment
        const isSupported = await isAnalyticsAvailable();

        if (isSupported) {
          // Initialize analytics
          await initializeAnalytics();
          console.log("Firebase Analytics initialized in RootLayout");
        } else {
          console.log(
            "Firebase Analytics is not supported in this environment"
          );
        }
      } catch (error) {
        console.error("Error initializing Firebase Analytics:", error);
      }
    };

    setupAnalytics();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <AuthProvider>
          <TradingProvider>
            <RootLayoutNav />
          </TradingProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

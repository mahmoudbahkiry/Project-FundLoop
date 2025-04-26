import React, { useState, useEffect } from "react";
import { loginStyles } from "@/components/LoginStyles";
import { getFirebaseErrorMessage } from "@/firebase/errorHandler";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  Text,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightModeText } from "@/components/LightModeText";
import { LightModeView } from "@/components/LightModeView";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/Colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loginSuccessful, setLoginSuccessful] = useState(false);
  const { signInWithEmail, isLoginAttemptInProgress, resetLoginAttempt } =
    useAuth();

  // Set page as ready after initial render and handle cleanup
  useEffect(() => {
    // Mark page as ready immediately
    setIsPageReady(true);

    // Clean up when component unmounts
    return () => {
      // Reset login attempt state when navigating away
      resetLoginAttempt();
      // Reset login successful state when unmounting
      setLoginSuccessful(false);
    };
  }, [resetLoginAttempt]);

  const primaryColor = Colors.light.primary;
  const textColor = Colors.light.text;
  const backgroundColor = Colors.light.background;
  const iconColor = Colors.light.icon;

  // Validate email format
  const validateEmail = (email: string): boolean => {
    // Reset login attempt state when user modifies input after an error
    if (isLoginAttemptInProgress && emailError) {
      resetLoginAttempt();
    }

    setEmailError("");
    if (!email) {
      setEmailError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  // Validate password
  const validatePassword = (password: string): boolean => {
    // Reset login attempt state when user modifies input after an error
    if (isLoginAttemptInProgress && passwordError) {
      resetLoginAttempt();
    }

    setPasswordError("");
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    // Reset all errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmail(email, password);

      // Mark login as successful to enable password saving
      setLoginSuccessful(true);

      // Only navigate on successful login
      router.replace("/(tabs)");
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = getFirebaseErrorMessage(error);

      // Ensure login is marked as unsuccessful
      setLoginSuccessful(false);

      console.log("Login error:", { code: error.code, message: errorMessage });

      // Set appropriate error based on error code
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email"
      ) {
        setEmailError(errorMessage);
        // Make sure isLoginAttemptInProgress remains true for non-registered emails
        // This is critical to prevent unwanted navigation
        console.log("Email error detected, login attempt still in progress");
      } else if (error.code === "auth/wrong-password") {
        setPasswordError(errorMessage);
      } else {
        setGeneralError(errorMessage);
      }

      console.error("Login error:", error);

      // No navigation call here - we stay on the login screen
      // We don't reset isLoginAttemptInProgress here anymore
      // It will remain true until user interaction or component unmount
    }
  };

  const navigateToSignup = () => {
    // Reset login attempt state before navigating away
    resetLoginAttempt();
    // Ensure login is marked as unsuccessful when navigating to signup
    setLoginSuccessful(false);
    router.push("/(auth)/signup");
  };

  const navigateToForgotPassword = () => {
    // This would navigate to a forgot password screen in a real app
    Alert.alert(
      "Reset Password",
      "A password reset link will be sent to your email address.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send Link",
          onPress: () => {
            if (email) {
              Alert.alert("Success", `Password reset link sent to ${email}`);
            } else {
              Alert.alert("Error", "Please enter your email address first");
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LightModeView style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.textContainer}>
              <LightModeText
                type="heading"
                style={[styles.title, { color: primaryColor }]}
              >
                FundLoop
              </LightModeText>
              <LightModeText style={styles.subtitle}>
                Your Trading Journey Starts Here
              </LightModeText>
            </View>
          </View>

          <View>
            <LightModeView variant="card" style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <LightModeText style={styles.inputLabel}>Email</LightModeText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      borderColor: emailError ? "red" : iconColor,
                    },
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={iconColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="username"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    // Clear general error when user starts typing
                    if (generalError) setGeneralError("");
                    // Validate and potentially reset login attempt state
                    if (emailError) validateEmail(text);
                    // Reset login successful state when user modifies input
                    setLoginSuccessful(false);
                  }}
                  onBlur={() => validateEmail(email)}
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordLabelContainer}>
                  <LightModeText style={styles.inputLabel}>
                    Password
                  </LightModeText>
                  <TouchableOpacity onPress={navigateToForgotPassword}>
                    <LightModeText type="link" style={styles.forgotPassword}>
                      Forgot Password?
                    </LightModeText>
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.passwordInputContainer,
                    { borderColor: passwordError ? "red" : iconColor },
                  ]}
                >
                  <TextInput
                    style={[styles.passwordInput, { color: textColor }]}
                    placeholder="Enter your password"
                    placeholderTextColor={iconColor}
                    secureTextEntry={!isPasswordVisible}
                    autoComplete={loginSuccessful ? "current-password" : "off"}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      // Clear general error when user starts typing
                      if (generalError) setGeneralError("");
                      // Validate and potentially reset login attempt state
                      if (passwordError) validatePassword(text);
                      // Reset login successful state when user modifies input
                      setLoginSuccessful(false);
                    }}
                    onBlur={() => validatePassword(password)}
                  />
                  <TouchableOpacity
                    style={styles.visibilityToggle}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Ionicons
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={24}
                      color={iconColor}
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {generalError ? (
                <View style={styles.generalErrorContainer}>
                  <Text style={styles.errorText}>{generalError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: primaryColor }]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons
                        name="log-in-outline"
                        size={20}
                        color="white"
                        style={styles.buttonIcon}
                      />
                      <LightModeText style={styles.loginButtonText}>
                        Sign In
                      </LightModeText>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.bottomLinkContainer}>
                <LightModeText style={styles.bottomLinkText}>
                  Don't have an account?
                </LightModeText>
                <TouchableOpacity onPress={navigateToSignup}>
                  <LightModeText type="link" style={styles.bottomLink}>
                    Sign Up
                  </LightModeText>
                </TouchableOpacity>
              </View>
            </LightModeView>
          </View>
        </LightModeView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Use the imported styles
const styles = {
  ...loginStyles,
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  generalErrorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    alignSelf: "stretch" as const,
  },
};

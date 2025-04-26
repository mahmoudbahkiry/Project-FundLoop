import React, { useState, useEffect } from "react";
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
  Dimensions,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightModeText } from "@/components/LightModeText";
import { LightModeView } from "@/components/LightModeView";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function FinancialInformationScreen() {
  // User data from previous steps
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [tradingExperience, setTradingExperience] = useState("");

  // Personal information from previous step
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [nationalIdImageUri, setNationalIdImageUri] = useState("");

  // Financial information fields
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [netWorth, setNetWorth] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");

  // Dropdown states
  const [showEmploymentDropdown, setShowEmploymentDropdown] = useState(false);
  const [showIncomeDropdown, setShowIncomeDropdown] = useState(false);
  const [showNetWorthDropdown, setShowNetWorthDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { signUp, completeRegistration } = useAuth();

  // Options for dropdowns
  const employmentOptions = [
    "Employed",
    "Self-Employed",
    "Student",
    "Retired",
    "Unemployed",
    "Other",
  ];

  const incomeRanges = [
    "Under EGP 25,000",
    "EGP 25,000 - EGP 50,000",
    "EGP 50,001 - EGP 100,000",
    "EGP 100,001 - EGP 250,000",
    "Over EGP 250,000",
  ];

  const netWorthRanges = [
    "Under EGP 500,000",
    "EGP 500,001 - EGP 1,000,000",
    "EGP 1,000,001 - EGP 2,500,000",
    "EGP 2,500,001 - EGP 5,000,000",
    "EGP 5,000,001 - EGP 10,000,000",
    "Over EGP 10,000,000",
  ];

  const fundingSources = [
    "Salary/Employment Income",
    "Savings",
    "Investments",
    "Inheritance",
    "Gift",
    "Business Revenue",
    "Other",
  ];

  // Load user data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("signupData");
        if (storedData) {
          const userData = JSON.parse(storedData);
          // Basic info
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setEmail(userData.email || "");
          setPassword(userData.password || "");
          setPhoneNumber(userData.phoneNumber || "");
          setDateOfBirth(
            userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date()
          );
          setTradingExperience(userData.tradingExperience || "");

          // Personal info
          setNationality(userData.nationality || "");
          setAddress(userData.address || "");
          setNationalIdImageUri(userData.nationalIdImageUri || "");

          setDataLoaded(true);
        } else {
          // No data found, redirect back to signup
          Alert.alert(
            "Error",
            "Could not load your information. Please restart the signup process.",
            [{ text: "OK", onPress: () => router.push("/(auth)/signup") }]
          );
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert(
          "Error",
          "Could not load your information. Please restart the signup process.",
          [{ text: "OK", onPress: () => router.push("/(auth)/signup") }]
        );
      }
    };

    loadUserData();
  }, []);

  const handleCompleteRegistration = async () => {
    // Validate required fields
    const missingFields = [];

    if (!employmentStatus) missingFields.push("Employment Status");
    if (employmentStatus === "Employed" && !employerName)
      missingFields.push("Employer Name");
    if (!monthlyIncome) missingFields.push("Monthly Income");
    if (!netWorth) missingFields.push("Net Worth");
    if (!sourceOfFunds) missingFields.push("Source of Funds");

    // If any required fields are missing, show an alert
    if (missingFields.length > 0) {
      Alert.alert(
        "Required Fields Missing",
        `Please complete the following required fields: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    try {
      setIsLoading(true);

      // Save all user data and complete the signup
      try {
        // First, get the existing signup data
        const signupDataString = await AsyncStorage.getItem("signupData");
        if (signupDataString) {
          const signupData = JSON.parse(signupDataString);

          // Add the financial information to the existing data
          const updatedData = {
            ...signupData,
            employmentStatus,
            employerName,
            monthlyIncome,
            netWorth,
            sourceOfFunds,
          };

          // First create the user authentication
          const uid = await signUp(
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            dateOfBirth,
            tradingExperience
          );

          // Then complete the registration by saving all data to Firestore
          await completeRegistration(uid, {
            firstName,
            lastName,
            email,
            phoneNumber,
            dateOfBirth,
            tradingExperience,
            // Personal information
            nationality,
            address,
            // Financial information
            employmentStatus,
            employerName: employmentStatus === "Employed" ? employerName : "",
            monthlyIncome,
            netWorth,
            sourceOfFunds,
          });

          // Clear the signup data after successful registration
          await AsyncStorage.removeItem("signupData");

          // Navigate to the main app
          router.replace("/(tabs)");
        } else {
          throw new Error("Signup data not found");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        Alert.alert(
          "Registration Failed",
          "There was a problem completing your registration. Please try again."
        );
      }

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        "Registration Failed",
        "There was a problem completing your registration. Please try again."
      );
      console.error("Registration error:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Don't render the main content until data is loaded
  if (!dataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <LightModeText style={styles.loadingText}>
          Loading your information...
        </LightModeText>
      </View>
    );
  }

  const primaryColor = Colors.light.primary;
  const textColor = Colors.light.text;
  const backgroundColor = Colors.light.background;
  const iconColor = Colors.light.icon;

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor }}>
      <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <LightModeText
                type="heading"
                style={[styles.title, { color: primaryColor }]}
              >
                Financial Information
              </LightModeText>
              <LightModeText style={styles.subtitle}>
                Final step to complete your profile
              </LightModeText>
            </View>
          </View>

          <LightModeView variant="card" style={styles.formContainer}>
            {/* Employment Status */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>
                Employment Status{" "}
                <LightModeText style={styles.requiredIndicator}>
                  *
                </LightModeText>
              </LightModeText>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: iconColor }]}
                onPress={() =>
                  setShowEmploymentDropdown(!showEmploymentDropdown)
                }
              >
                <LightModeText>
                  {employmentStatus || "Select your employment status"}
                </LightModeText>
                <Ionicons
                  name={showEmploymentDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
              {showEmploymentDropdown && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={0}
                    onPress={() => setShowEmploymentDropdown(false)}
                  />
                  <View
                    style={[
                      styles.dropdownMenu,
                      {
                        borderColor: iconColor,
                        backgroundColor: backgroundColor,
                      },
                    ]}
                  >
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {employmentOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: iconColor },
                            employmentStatus === option && styles.selectedItem,
                          ]}
                          onPress={() => {
                            setEmploymentStatus(option);
                            setShowEmploymentDropdown(false);
                          }}
                        >
                          <LightModeText
                            style={
                              employmentStatus === option && {
                                color: primaryColor,
                                fontWeight: "600",
                              }
                            }
                          >
                            {option}
                          </LightModeText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}
            </View>

            {/* Employer Name - only show if employed */}
            {employmentStatus === "Employed" && (
              <View style={styles.inputContainer}>
                <LightModeText style={styles.inputLabel}>
                  Employer Name{" "}
                  <LightModeText style={styles.requiredIndicator}>
                    *
                  </LightModeText>
                </LightModeText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: iconColor },
                  ]}
                  placeholder="Enter your employer's name"
                  placeholderTextColor={iconColor}
                  value={employerName}
                  onChangeText={setEmployerName}
                />
              </View>
            )}
            {/* monthly Income Range */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>
                monthly Income Range{" "}
                <LightModeText style={styles.requiredIndicator}>
                  *
                </LightModeText>
              </LightModeText>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: iconColor }]}
                onPress={() => setShowIncomeDropdown(!showIncomeDropdown)}
              >
                <LightModeText>
                  {monthlyIncome || "Select your income range"}
                </LightModeText>
                <Ionicons
                  name={showIncomeDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
              {showIncomeDropdown && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={0}
                    onPress={() => setShowIncomeDropdown(false)}
                  />
                  <View
                    style={[
                      styles.dropdownMenu,
                      {
                        borderColor: iconColor,
                        backgroundColor: backgroundColor,
                      },
                    ]}
                  >
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {incomeRanges.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: iconColor },
                            monthlyIncome === option && styles.selectedItem,
                          ]}
                          onPress={() => {
                            setMonthlyIncome(option);
                            setShowIncomeDropdown(false);
                          }}
                        >
                          <LightModeText
                            style={
                              monthlyIncome === option && {
                                color: primaryColor,
                                fontWeight: "600",
                              }
                            }
                          >
                            {option}
                          </LightModeText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}
            </View>

            {/* Net Worth Range */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>
                Net Worth Range{" "}
                <LightModeText style={styles.requiredIndicator}>
                  *
                </LightModeText>
              </LightModeText>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: iconColor }]}
                onPress={() => setShowNetWorthDropdown(!showNetWorthDropdown)}
              >
                <LightModeText>
                  {netWorth || "Select your net worth range"}
                </LightModeText>
                <Ionicons
                  name={showNetWorthDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
              {showNetWorthDropdown && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={0}
                    onPress={() => setShowNetWorthDropdown(false)}
                  />
                  <View
                    style={[
                      styles.dropdownMenu,
                      {
                        borderColor: iconColor,
                        backgroundColor: backgroundColor,
                      },
                    ]}
                  >
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {netWorthRanges.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: iconColor },
                            netWorth === option && styles.selectedItem,
                          ]}
                          onPress={() => {
                            setNetWorth(option);
                            setShowNetWorthDropdown(false);
                          }}
                        >
                          <LightModeText
                            style={
                              netWorth === option && {
                                color: primaryColor,
                                fontWeight: "600",
                              }
                            }
                          >
                            {option}
                          </LightModeText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}
            </View>

            {/* Source of Funds */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>
                Source of Funds{" "}
                <LightModeText style={styles.requiredIndicator}>
                  *
                </LightModeText>
              </LightModeText>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: iconColor }]}
                onPress={() => setShowSourceDropdown(!showSourceDropdown)}
              >
                <LightModeText>
                  {sourceOfFunds || "Select your source of funds"}
                </LightModeText>
                <Ionicons
                  name={showSourceDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
              {showSourceDropdown && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={0}
                    onPress={() => setShowSourceDropdown(false)}
                  />
                  <View
                    style={[
                      styles.dropdownMenu,
                      {
                        borderColor: iconColor,
                        backgroundColor: backgroundColor,
                      },
                    ]}
                  >
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {fundingSources.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: iconColor },
                            sourceOfFunds === option && styles.selectedItem,
                          ]}
                          onPress={() => {
                            setSourceOfFunds(option);
                            setShowSourceDropdown(false);
                          }}
                        >
                          <LightModeText
                            style={
                              sourceOfFunds === option && {
                                color: primaryColor,
                                fontWeight: "600",
                              }
                            }
                          >
                            {option}
                          </LightModeText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: primaryColor },
                (!employmentStatus ||
                  (employmentStatus === "Employed" && !employerName) ||
                  !monthlyIncome ||
                  !netWorth ||
                  !sourceOfFunds) &&
                  styles.disabledButton,
              ]}
              onPress={handleCompleteRegistration}
              disabled={
                isLoading ||
                !employmentStatus ||
                (employmentStatus === "Employed" && !employerName) ||
                !monthlyIncome ||
                !netWorth ||
                !sourceOfFunds
              }
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                    <LightModeText style={styles.buttonText}>
                      Complete Registration
                    </LightModeText>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </LightModeView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
  },
  textContainer: {
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 10,
  },
  formContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    paddingBottom: 30,
    borderRadius: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 48,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 5,
  },
  dropdownMenu: {
    position: "absolute",
    top: 85,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 0.5,
  },
  selectedItem: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  requiredIndicator: {
    color: "red",
    fontWeight: "bold",
  },
});

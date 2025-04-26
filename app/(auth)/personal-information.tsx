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
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightModeText } from "@/components/LightModeText";
import { LightModeView } from "@/components/LightModeView";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProgressBar } from "@/components/ProgressBar";

const { width } = Dimensions.get("window");

export default function PersonalInformationScreen() {
  // User data from previous screen
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [tradingExperience, setTradingExperience] = useState("");

  // Current screen state
  const [nationalityValue, setNationalityValue] = useState("");
  const [address, setAddress] = useState("");

  // New address fields
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [streetName, setStreetName] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [nationalIdImage, setNationalIdImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { signUp } = useAuth();

  // Load user data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("signupData");
        if (storedData) {
          const userData = JSON.parse(storedData);
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
          setEmail(userData.email);
          setPassword(userData.password);
          setPhoneNumber(userData.phoneNumber);
          setDateOfBirth(new Date(userData.dateOfBirth));
          setTradingExperience(userData.tradingExperience || "");
          setDataLoaded(true);
        } else {
          // No data found, redirect back to signup
          Alert.alert(
            "Error",
            "Could not load your information. Please restart the signup process.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert(
          "Error",
          "Could not load your information. Please restart the signup process.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    };

    loadUserData();
  }, []);

  const primaryColor = Colors.light.primary;
  const textColor = Colors.light.text;
  const backgroundColor = Colors.light.background;
  const iconColor = Colors.light.icon;

  const nationalities = [
    "Egyptian",
    "Saudi",
    "Emirati",
    "American",
    "British",
    "Canadian",
    "Australian",
    "German",
    "French",
    "Chinese",
    "Japanese",
    "Indian",
  ];

  const handleImagePick = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to grant permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setNationalIdImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "There was a problem selecting the image.");
    }
  };

  const handleNextStep = async () => {
    // Create an array of missing required fields
    const missingFields = [];

    if (!nationalityValue) missingFields.push("Nationality");
    if (!governorate) missingFields.push("Governorate");
    if (!city) missingFields.push("City");
    if (!streetName) missingFields.push("Street Name");
    if (!buildingNumber) missingFields.push("Building Number");
    if (!postalCode) missingFields.push("Postal Code");
    if (!nationalIdImage) missingFields.push("National ID Image");

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

      // Compile the full address from individual fields
      const fullAddress = `${buildingNumber} ${streetName}, ${
        district ? district + ", " : ""
      }${city}, ${governorate}, ${postalCode}${
        apartmentNumber ? ", Apt/Unit: " + apartmentNumber : ""
      }`;

      // Save the personal information and address to AsyncStorage to be used in later steps
      try {
        // First, get the existing signup data
        const signupDataString = await AsyncStorage.getItem("signupData");
        if (signupDataString) {
          const signupData = JSON.parse(signupDataString);

          // Add the personal information to the existing data
          const updatedData = {
            ...signupData,
            nationality: nationalityValue,
            address: fullAddress,
            addressDetails: {
              governorate,
              city,
              district,
              streetName,
              buildingNumber,
              apartmentNumber,
              postalCode,
            },
            nationalIdImageUri: nationalIdImage,
          };

          // Save the updated data back to AsyncStorage
          await AsyncStorage.setItem("signupData", JSON.stringify(updatedData));

          // Navigate to the next step (financial information)
          router.push("/(auth)/financial-information");
        } else {
          throw new Error("Signup data not found");
        }
      } catch (error) {
        console.error("Error saving personal information:", error);
        Alert.alert(
          "Error",
          "There was a problem saving your information. Please try again."
        );
      }

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        "Error",
        "There was a problem processing your information. Please try again."
      );
      console.error("Personal information error:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Don't render the main content until data is loaded
  if (!dataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <LightModeText style={styles.loadingText}>
          Loading your information...
        </LightModeText>
      </View>
    );
  }

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
                Personal Information
              </LightModeText>
              <LightModeText style={styles.subtitle}>
                Let's complete your profile
              </LightModeText>
            </View>
            <ProgressBar step={2} />
          </View>

          <LightModeView variant="card" style={styles.formContainer}>
            {/* National ID Image */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>
                National ID Image{" "}
                <LightModeText style={styles.requiredIndicator}>
                  *
                </LightModeText>
              </LightModeText>
              <TouchableOpacity
                style={styles.imageUploadContainer}
                onPress={handleImagePick}
              >
                {nationalIdImage ? (
                  <Image
                    source={{ uri: nationalIdImage }}
                    style={styles.uploadedImage}
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={40}
                      color={iconColor}
                    />
                    <LightModeText style={styles.uploadText}>
                      Upload your National ID
                    </LightModeText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Nationality */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>
                Nationality{" "}
                <LightModeText style={styles.requiredIndicator}>
                  *
                </LightModeText>
              </LightModeText>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: iconColor }]}
                onPress={() =>
                  setShowNationalityDropdown(!showNationalityDropdown)
                }
              >
                <LightModeText>
                  {nationalityValue || "Select your nationality"}
                </LightModeText>
                <Ionicons
                  name={showNationalityDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
              {showNationalityDropdown && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={0}
                    onPress={() => setShowNationalityDropdown(false)}
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
                      {nationalities.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: iconColor },
                            nationalityValue === option && styles.selectedItem,
                          ]}
                          onPress={() => {
                            setNationalityValue(option);
                            setShowNationalityDropdown(false);
                          }}
                        >
                          <LightModeText
                            style={
                              nationalityValue === option && {
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

            {/* Residential Address */}
            <View style={styles.inputContainer}>
              <LightModeText style={[styles.inputLabel, styles.sectionLabel]}>
                Residential Address
              </LightModeText>

              {/* Governorate */}
              <View style={styles.addressFieldContainer}>
                <LightModeText style={styles.addressFieldLabel}>
                  Governorate{" "}
                  <LightModeText style={styles.requiredIndicator}>
                    *
                  </LightModeText>
                </LightModeText>
                <TextInput
                  style={[
                    styles.addressField,
                    { color: textColor, borderColor: iconColor },
                  ]}
                  placeholder="Enter governorate"
                  placeholderTextColor={iconColor}
                  value={governorate}
                  onChangeText={setGovernorate}
                />
              </View>

              {/* City */}
              <View style={styles.addressFieldContainer}>
                <LightModeText style={styles.addressFieldLabel}>
                  City{" "}
                  <LightModeText style={styles.requiredIndicator}>
                    *
                  </LightModeText>
                </LightModeText>
                <TextInput
                  style={[
                    styles.addressField,
                    { color: textColor, borderColor: iconColor },
                  ]}
                  placeholder="Enter city"
                  placeholderTextColor={iconColor}
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              {/* District / Neighborhood */}
              <View style={styles.addressFieldContainer}>
                <LightModeText style={styles.addressFieldLabel}>
                  District / Neighborhood (Optional)
                </LightModeText>
                <TextInput
                  style={[
                    styles.addressField,
                    { color: textColor, borderColor: iconColor },
                  ]}
                  placeholder="Enter district or neighborhood"
                  placeholderTextColor={iconColor}
                  value={district}
                  onChangeText={setDistrict}
                />
              </View>

              {/* Street Name */}
              <View style={styles.addressFieldContainer}>
                <LightModeText style={styles.addressFieldLabel}>
                  Street Name{" "}
                  <LightModeText style={styles.requiredIndicator}>
                    *
                  </LightModeText>
                </LightModeText>
                <TextInput
                  style={[
                    styles.addressField,
                    { color: textColor, borderColor: iconColor },
                  ]}
                  placeholder="Enter street name"
                  placeholderTextColor={iconColor}
                  value={streetName}
                  onChangeText={setStreetName}
                />
              </View>

              {/* Building Number */}
              <View style={styles.addressFieldContainer}>
                <LightModeText style={styles.addressFieldLabel}>
                  Building Number{" "}
                  <LightModeText style={styles.requiredIndicator}>
                    *
                  </LightModeText>
                </LightModeText>
                <TextInput
                  style={[
                    styles.addressField,
                    { color: textColor, borderColor: iconColor },
                  ]}
                  placeholder="Enter building number"
                  placeholderTextColor={iconColor}
                  value={buildingNumber}
                  onChangeText={setBuildingNumber}
                  keyboardType="numeric"
                />
              </View>

              {/* Apartment / Unit Number */}
              <View style={styles.addressFieldContainer}>
                <LightModeText style={styles.addressFieldLabel}>
                  Apartment / Unit Number (Optional)
                </LightModeText>
                <TextInput
                  style={[
                    styles.addressField,
                    { color: textColor, borderColor: iconColor },
                  ]}
                  placeholder="Enter apartment or unit number"
                  placeholderTextColor={iconColor}
                  value={apartmentNumber}
                  onChangeText={setApartmentNumber}
                />
              </View>

              {/* Postal Code / ZIP Code */}
              <View style={[styles.addressFieldContainer, { marginBottom: 5 }]}>
                <LightModeText style={styles.addressFieldLabel}>
                  Postal Code{" "}
                  <LightModeText style={styles.requiredIndicator}>
                    *
                  </LightModeText>
                </LightModeText>
                <TextInput
                  style={[
                    styles.addressField,
                    { color: textColor, borderColor: iconColor },
                  ]}
                  placeholder="Enter postal code"
                  placeholderTextColor={iconColor}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: primaryColor },
                (!nationalityValue ||
                  !governorate ||
                  !city ||
                  !streetName ||
                  !buildingNumber ||
                  !postalCode ||
                  !nationalIdImage) &&
                  styles.disabledButton,
              ]}
              onPress={handleNextStep}
              disabled={
                isLoading ||
                !nationalityValue ||
                !governorate ||
                !city ||
                !streetName ||
                !buildingNumber ||
                !postalCode ||
                !nationalIdImage
              }
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                    <LightModeText style={styles.buttonText}>
                      Next
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
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
  },
  scrollContent: {
    flexGrow: 1,
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
  imageUploadContainer: {
    height: 180,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    borderColor: Colors.light.icon,
    overflow: "hidden",
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.icon,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  addressFieldContainer: {
    marginBottom: 15,
  },
  addressFieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: Colors.light.icon,
  },
  addressField: {
    height: 48,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
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
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    marginTop: 10,
    color: Colors.light.primary,
  },
  requiredIndicator: {
    color: "red",
    fontWeight: "bold",
  },
});

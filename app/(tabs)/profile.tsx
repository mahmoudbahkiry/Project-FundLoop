import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { saveUserData } from "@/firebase/userService";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";

export default function Profile() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth || new Date()
  );
  const [tradingExperience, setTradingExperience] = useState(
    user?.tradingExperience || "Not Specified"
  );
  const [occupation, setOccupation] = useState(
    user?.occupation || "Not Specified"
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const experienceOptions = [
    "Not Specified",
    "Beginner (0-1 years)",
    "Intermediate (1-3 years)",
    "Advanced (3-5 years)",
    "Expert (5+ years)",
  ];

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setDateOfBirth(user.dateOfBirth || new Date());
      setTradingExperience(user.tradingExperience || "Not Specified");
      setOccupation(user.occupation || "Not Specified");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    // Calculate age from date of birth
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check if user is at least 18 years old
    if (age < 18) {
      Alert.alert(
        "Age Restriction",
        "You must be at least 18 years old to use this app.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await saveUserData({
        uid: user.uid,
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        tradingExperience,
        occupation,
        authType: "email",
      });

      Alert.alert("Success", "Your profile has been updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload a profile picture."
        );
        return;
      }

      setIsImageLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        exif: false,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Create a new Image object to make sure we load the image correctly
        const uri = result.assets[0].uri;

        // On iOS, sometimes the URI includes a file:// prefix
        const finalUri =
          Platform.OS === "ios" && !uri.startsWith("file://")
            ? `file://${uri}`
            : uri;

        setProfilePicture(finalUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setIsImageLoading(false);
    }
  };

  const onChangeDateOfBirth = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    setDateOfBirth(currentDate);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const closeExperiencePicker = () => {
    setShowExperiencePicker(false);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>
          You need to be logged in to view your profile.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
        >
          <ThemedText style={styles.editButtonText}>
            {isEditing ? "Save" : "Edit Profile"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            {isImageLoading ? (
              <View
                style={[
                  styles.profileImageContainer,
                  { backgroundColor: Colors[theme].primary + "30" },
                ]}
              >
                <ActivityIndicator size="large" color={Colors[theme].primary} />
              </View>
            ) : (
              <View style={styles.profileImageContainer}>
                {profilePicture ? (
                  <Image
                    source={{ uri: profilePicture }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.profileImagePlaceholder,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 40,
                        fontWeight: "bold",
                        color: "white",
                        lineHeight: 48,
                        marginTop: 5,
                      }}
                    >
                      {`${firstName.charAt(0)}${lastName.charAt(0)}`}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {isEditing && (
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handlePickImage}
                disabled={isImageLoading}
              >
                <View style={styles.photoButtonContent}>
                  <Ionicons name="camera" size={16} color="#fff" />
                  <ThemedText style={styles.changePhotoText}>
                    {profilePicture ? "Change Photo" : "Add Photo"}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.nameContainer}>
            {isEditing ? (
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { color: Colors[theme].text }]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                  placeholderTextColor={Colors[theme].icon}
                />
                <TextInput
                  style={[styles.input, { color: Colors[theme].text }]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                  placeholderTextColor={Colors[theme].icon}
                />
              </View>
            ) : (
              <ThemedText style={styles.userName}>
                {firstName} {lastName}
              </ThemedText>
            )}
            <ThemedText style={styles.userEmail}>{email}</ThemedText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>
            Personal Information
          </ThemedText>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="mail" size={20} color={Colors[theme].primary} />
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
            </View>
            <ThemedText style={styles.infoValue}>{email}</ThemedText>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="call" size={20} color={Colors[theme].primary} />
              <ThemedText style={styles.infoLabel}>Phone</ThemedText>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.inputInline, { color: Colors[theme].text }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor={Colors[theme].icon}
                keyboardType="phone-pad"
              />
            ) : (
              <ThemedText style={styles.infoValue}>
                {phoneNumber || "Not specified"}
              </ThemedText>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="calendar"
                size={20}
                color={Colors[theme].primary}
              />
              <ThemedText style={styles.infoLabel}>Date of Birth</ThemedText>
            </View>

            {isEditing ? (
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerButton}
              >
                <ThemedText style={styles.datePickerText}>
                  {dateOfBirth
                    ? format(dateOfBirth, "MMM dd, yyyy")
                    : "Select date"}
                </ThemedText>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={Colors[theme].primary}
                />
              </TouchableOpacity>
            ) : (
              <ThemedText style={styles.infoValue}>
                {dateOfBirth
                  ? format(dateOfBirth, "MMM dd, yyyy")
                  : "Not specified"}
              </ThemedText>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="briefcase"
                size={20}
                color={Colors[theme].primary}
              />
              <ThemedText style={styles.infoLabel}>Occupation</ThemedText>
            </View>

            {isEditing ? (
              <TextInput
                style={[styles.inputInline, { color: Colors[theme].text }]}
                value={occupation}
                onChangeText={setOccupation}
                placeholder="Enter occupation"
                placeholderTextColor={Colors[theme].icon}
              />
            ) : (
              <ThemedText style={styles.infoValue}>
                {occupation || "Not specified"}
              </ThemedText>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="trending-up"
                size={20}
                color={Colors[theme].primary}
              />
              <ThemedText style={styles.infoLabel}>
                Trading Experience
              </ThemedText>
            </View>

            {isEditing ? (
              <TouchableOpacity
                onPress={() => setShowExperiencePicker(true)}
                style={styles.datePickerButton}
              >
                <ThemedText style={styles.datePickerText}>
                  {tradingExperience || "Select experience"}
                </ThemedText>
                <Ionicons
                  name="chevron-down-outline"
                  size={20}
                  color={Colors[theme].primary}
                />
              </TouchableOpacity>
            ) : (
              <ThemedText style={styles.infoValue}>
                {tradingExperience || "Not specified"}
              </ThemedText>
            )}
          </View>
        </View>

        {isEditing && (
          <ThemedButton
            title="Save Changes"
            onPress={handleSaveProfile}
            style={styles.saveButton}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme === "dark" ? "#1c1c1c" : "#ffffff" },
              ]}
            >
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={closeDatePicker}>
                  <ThemedText style={styles.pickerDoneButton}>Done</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={onChangeDateOfBirth}
                  maximumDate={new Date()}
                  textColor={theme === "dark" ? "#ffffff" : "#000000"}
                  style={{ width: "100%" }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDateOfBirth}
          maximumDate={new Date()}
        />
      )}

      {/* Experience Picker Modal */}
      {showExperiencePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showExperiencePicker}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme === "dark" ? "#1c1c1c" : "#ffffff" },
              ]}
            >
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={closeExperiencePicker}>
                  <ThemedText style={styles.pickerDoneButton}>Done</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tradingExperience}
                  onValueChange={(itemValue: string) =>
                    setTradingExperience(itemValue)
                  }
                  style={{ height: 200, width: "100%" }}
                  itemStyle={{
                    color: theme === "dark" ? "#ffffff" : "#000000",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {experienceOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#00A86B",
  },
  editButtonText: {
    color: "#00A86B",
    fontWeight: "500",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageWrapper: {
    position: "relative",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "60%",
    height: "60%",
    flexDirection: "row",
  },
  profileInitials: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  changePhotoButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 10,
  },
  photoButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  nameContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  infoSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "500",
    fontSize: 16,
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 16,
    paddingLeft: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#00A86B",
    fontSize: 16,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  inputInline: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#00A86B",
    fontSize: 16,
    paddingLeft: 30,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 30,
    paddingRight: 10,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#00A86B",
  },
  datePickerText: {
    fontSize: 16,
  },
  pickerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  pickerDoneButton: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});

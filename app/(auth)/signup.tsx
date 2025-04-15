import React, { useState, useEffect } from 'react';
import { signupStyles } from '@/components/SignupStyles';
import { getFirebaseErrorMessage } from '@/firebase/errorHandler';
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
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LightModeText } from '@/components/LightModeText';
import { LightModeView } from '@/components/LightModeView';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

// Password strength indicator
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const [strength, setStrength] = useState({
    score: 0,
    label: 'Weak',
    color: '#FF3B30',
  });

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: 'Weak', color: '#FF3B30' });
      return;
    }

    let score = 0;
    // Length check
    if (password.length >= 8) score += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) score += 1;
    // Contains number
    if (/[0-9]/.test(password)) score += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Weak';
    let color = '#FF3B30';

    if (score >= 4) {
      label = 'Strong';
      color = '#34C759';
    } else if (score >= 2) {
      label = 'Medium';
      color = '#FF9500';
    }

    setStrength({ score, label, color });
  }, [password]);

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBars}>
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor: strength.score >= 1 ? strength.color : '#E5E5EA',
            },
          ]}
        />
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor: strength.score >= 2 ? strength.color : '#E5E5EA',
            },
          ]}
        />
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor: strength.score >= 3 ? strength.color : '#E5E5EA',
            },
          ]}
        />
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor: strength.score >= 4 ? strength.color : '#E5E5EA',
            },
          ]}
        />
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor: strength.score >= 5 ? strength.color : '#E5E5EA',
            },
          ]}
        />
      </View>
      <LightModeText style={{ color: strength.color }}>{strength.label}</LightModeText>
    </View>
  );
};

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tradingExperience, setTradingExperience] = useState('');
  const [occupation, setOccupation] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTradingExperienceDropdown, setShowTradingExperienceDropdown] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  const { signUp } = useAuth();
  
  // Set page as ready after initial render
  useEffect(() => {
    // Mark page as ready immediately
    setIsPageReady(true);
    
    return () => {};
  }, []);
  
  const primaryColor = Colors.light.primary;
  const textColor = Colors.light.text;
  const backgroundColor = Colors.light.background;
  const iconColor = Colors.light.icon;

  const tradingExperienceOptions = [
    'Beginner (< 1 year)',
    'Intermediate (1-3 years)',
    'Advanced (3-5 years)',
    'Expert (5+ years)',
  ];

  const handleSignup = async () => {
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate age (must be 18+)
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      Alert.alert('Error', 'You must be at least 18 years old to register');
      return;
    }

    // Validate agreements
    if (!termsAccepted || !privacyAccepted || !riskAccepted) {
      Alert.alert('Error', 'You must accept all agreements to continue');
      return;
    }

    try {
      setIsLoading(true);
      // Pass all user data to signUp method
      await signUp(
        firstName,
        lastName,
        email, 
        password, 
        phoneNumber,
        dateOfBirth,
        tradingExperience,
        occupation
      );
      router.replace('/(tabs)');
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert('Signup Failed', errorMessage);
      console.error('Signup error:', error);
    }
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month, day);
    setDateOfBirth(newDate);
    setShowDatePicker(false);
  };

  const showTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'By accepting these terms, you agree to abide by the rules and regulations of FundLoop. This includes adhering to trading guidelines, risk management protocols, and ethical trading practices. Violation of these terms may result in termination of your account.'
    );
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'FundLoop collects personal information to provide and improve our services. We may share your information with trusted third parties who assist us in operating our platform. We implement security measures to protect your personal information but cannot guarantee absolute security.'
    );
  };

  const showRiskDisclaimer = () => {
    Alert.alert(
      'Financial Risk Disclaimer',
      'Trading financial instruments involves significant risk and is not suitable for all investors. You should carefully consider your investment objectives, level of experience, and risk appetite before trading. The possibility exists that you could sustain a loss of some or all of your initial investment.'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LightModeView style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.textContainer}>
              <LightModeText type="heading" style={[styles.title, { color: primaryColor }]}>FundLoop</LightModeText>
              <LightModeText style={styles.subtitle}>Your Trading Journey Starts Here</LightModeText>
            </View>
          </View>
          
          <View>
            <LightModeView variant="card" style={styles.formContainer}>
            <LightModeText type="subtitle" style={styles.sectionTitle}>
              Required Information
            </LightModeText>

            {/* First Name */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>First Name</LightModeText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: iconColor },
                ]}
                placeholder="Enter your first name"
                placeholderTextColor={iconColor}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>Last Name</LightModeText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: iconColor },
                ]}
                placeholder="Enter your last name"
                placeholderTextColor={iconColor}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>Email</LightModeText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: iconColor },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={iconColor}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>Password</LightModeText>
              <View style={[styles.passwordInputContainer, { borderColor: iconColor }]}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    { color: textColor },
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor={iconColor}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={24}
                    color={iconColor}
                  />
                </TouchableOpacity>
              </View>
              <PasswordStrengthIndicator password={password} />
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>Phone Number</LightModeText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: iconColor },
                ]}
                placeholder="Enter your phone number"
                placeholderTextColor={iconColor}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>
                Date of Birth (Must be 18+)
              </LightModeText>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  { borderColor: iconColor },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <LightModeText>{formatDate(dateOfBirth)}</LightModeText>
                <Ionicons name="calendar-outline" size={24} color={iconColor} />
              </TouchableOpacity>
              {showDatePicker && (
                <Modal
                  transparent={true}
                  visible={showDatePicker}
                  animationType="fade"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <View style={styles.datePickerContainer}>
                      <LightModeView variant="card" style={styles.datePickerContent}>
                        <LightModeText type="subtitle" style={styles.datePickerTitle}>
                          Select Date of Birth
                        </LightModeText>
                        
                        <View style={styles.datePickerControls}>
                          {/* Year Picker */}
                          <View style={styles.datePickerColumn}>
                            <LightModeText style={styles.datePickerLabel}>Year</LightModeText>
                            <ScrollView style={styles.datePickerScroll}>
                              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                <TouchableOpacity
                                  key={year}
                                  style={styles.datePickerItem}
                                  onPress={() => {
                                    const newDate = new Date(dateOfBirth);
                                    newDate.setFullYear(year);
                                    setDateOfBirth(newDate);
                                  }}
                                >
                                  <LightModeText
                                    style={[
                                      styles.datePickerItemText,
                                      dateOfBirth.getFullYear() === year && { color: primaryColor, fontWeight: 'bold' }
                                    ]}
                                  >
                                    {year}
                                  </LightModeText>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                          
                          {/* Month Picker */}
                          <View style={styles.datePickerColumn}>
                            <LightModeText style={styles.datePickerLabel}>Month</LightModeText>
                            <ScrollView style={styles.datePickerScroll}>
                              {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                                <TouchableOpacity
                                  key={month}
                                  style={styles.datePickerItem}
                                  onPress={() => {
                                    const newDate = new Date(dateOfBirth);
                                    newDate.setMonth(month);
                                    setDateOfBirth(newDate);
                                  }}
                                >
                                  <LightModeText
                                    style={[
                                      styles.datePickerItemText,
                                      dateOfBirth.getMonth() === month && { color: primaryColor, fontWeight: 'bold' }
                                    ]}
                                  >
                                    {new Date(0, month).toLocaleString('default', { month: 'long' })}
                                  </LightModeText>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                          
                          {/* Day Picker */}
                          <View style={styles.datePickerColumn}>
                            <LightModeText style={styles.datePickerLabel}>Day</LightModeText>
                            <ScrollView style={styles.datePickerScroll}>
                              {Array.from(
                                { length: new Date(dateOfBirth.getFullYear(), dateOfBirth.getMonth() + 1, 0).getDate() },
                                (_, i) => i + 1
                              ).map((day) => (
                                <TouchableOpacity
                                  key={day}
                                  style={styles.datePickerItem}
                                  onPress={() => {
                                    const newDate = new Date(dateOfBirth);
                                    newDate.setDate(day);
                                    setDateOfBirth(newDate);
                                  }}
                                >
                                  <LightModeText
                                    style={[
                                      styles.datePickerItemText,
                                      dateOfBirth.getDate() === day && { color: primaryColor, fontWeight: 'bold' }
                                    ]}
                                  >
                                    {day}
                                  </LightModeText>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
                        
                        <View style={styles.datePickerActions}>
                          <TouchableOpacity
                            style={styles.modalDatePickerButton}
                            onPress={() => setShowDatePicker(false)}
                          >
                            <LightModeText>Cancel</LightModeText>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.modalDatePickerButton, { backgroundColor: primaryColor }]}
                            onPress={() => {
                              // Check if user is 18+
                              const today = new Date();
                              const birthDate = new Date(dateOfBirth);
                              let age = today.getFullYear() - birthDate.getFullYear();
                              const monthDiff = today.getMonth() - birthDate.getMonth();
                              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                              }
                              
                              if (age < 18) {
                                Alert.alert('Error', 'You must be at least 18 years old to register');
                                return;
                              }
                              
                              setShowDatePicker(false);
                            }}
                          >
                            <LightModeText style={{ color: 'white' }}>Confirm</LightModeText>
                          </TouchableOpacity>
                        </View>
                      </LightModeView>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>

            <LightModeText type="subtitle" style={[styles.sectionTitle, { marginTop: 20 }]}>
              Optional Information
            </LightModeText>

            {/* Trading Experience */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>Trading Experience</LightModeText>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  { borderColor: iconColor },
                ]}
                onPress={() => setShowTradingExperienceDropdown(!showTradingExperienceDropdown)}
              >
                <LightModeText>
                  {tradingExperience || 'Select your experience level'}
                </LightModeText>
                <Ionicons
                  name={showTradingExperienceDropdown ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
              {showTradingExperienceDropdown && (
                <View style={[styles.dropdownMenu, { borderColor: iconColor, backgroundColor: backgroundColor }]}>
                  {tradingExperienceOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.dropdownItem, { borderBottomColor: iconColor }]}
                      onPress={() => {
                        setTradingExperience(option);
                        setShowTradingExperienceDropdown(false);
                      }}
                    >
                      <LightModeText>{option}</LightModeText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Occupation */}
            <View style={styles.inputContainer}>
              <LightModeText style={styles.inputLabel}>Current Occupation</LightModeText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: iconColor },
                ]}
                placeholder="Enter your occupation"
                placeholderTextColor={iconColor}
                value={occupation}
                onChangeText={setOccupation}
              />
            </View>

            <LightModeText type="subtitle" style={[styles.sectionTitle, { marginTop: 20 }]}>
              Agreements
            </LightModeText>

            {/* Terms of Service */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                {termsAccepted ? (
                  <Ionicons name="checkbox" size={24} color={primaryColor} />
                ) : (
                  <Ionicons name="square-outline" size={24} color={iconColor} />
                )}
              </TouchableOpacity>
              <View style={styles.checkboxTextContainer}>
                <LightModeText style={styles.checkboxText}>
                  I agree to the{' '}
                  <LightModeText
                    type="link"
                    onPress={showTermsOfService}
                    style={styles.linkText}
                  >
                    Terms of Service
                  </LightModeText>
                </LightModeText>
              </View>
            </View>

            {/* Privacy Policy */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setPrivacyAccepted(!privacyAccepted)}
              >
                {privacyAccepted ? (
                  <Ionicons name="checkbox" size={24} color={primaryColor} />
                ) : (
                  <Ionicons name="square-outline" size={24} color={iconColor} />
                )}
              </TouchableOpacity>
              <View style={styles.checkboxTextContainer}>
                <LightModeText style={styles.checkboxText}>
                  I agree to the{' '}
                  <LightModeText
                    type="link"
                    onPress={showPrivacyPolicy}
                    style={styles.linkText}
                  >
                    Privacy Policy
                  </LightModeText>
                </LightModeText>
              </View>
            </View>

            {/* Risk Disclaimer */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setRiskAccepted(!riskAccepted)}
              >
                {riskAccepted ? (
                  <Ionicons name="checkbox" size={24} color={primaryColor} />
                ) : (
                  <Ionicons name="square-outline" size={24} color={iconColor} />
                )}
              </TouchableOpacity>
              <View style={styles.checkboxTextContainer}>
                <LightModeText style={styles.checkboxText}>
                  I understand and accept the{' '}
                  <LightModeText
                    type="link"
                    onPress={showRiskDisclaimer}
                    style={styles.linkText}
                  >
                    Financial Risk Disclaimer
                  </LightModeText>
                </LightModeText>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.signupButton,
                { backgroundColor: primaryColor },
                (!termsAccepted || !privacyAccepted || !riskAccepted) && styles.disabledButton,
              ]}
              onPress={handleSignup}
              disabled={isLoading || !termsAccepted || !privacyAccepted || !riskAccepted}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={20} color="white" style={styles.buttonIcon} />
                    <LightModeText style={styles.signupButtonText}>Create Account</LightModeText>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.bottomLinkContainer}>
              <LightModeText style={styles.bottomLinkText}>
                Already have an account?
              </LightModeText>
              <TouchableOpacity onPress={navigateToLogin}>
                <LightModeText type="link" style={styles.bottomLink}>
                  Sign In
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
const styles = signupStyles;

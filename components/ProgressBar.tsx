import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { signupStyles } from "./SignupStyles";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

interface ProgressBarProps {
  step: 1 | 2 | 3; // 1: Signup, 2: Personal Info, 3: Financial Info
  showStepText?: boolean;
}

export function ProgressBar({ step, showStepText = true }: ProgressBarProps) {
  // Calculate progress percentage based on step
  const progressPercentage = step === 1 ? 33.3 : step === 2 ? 66.6 : 100;

  // Get step text
  const getStepText = () => {
    switch (step) {
      case 1:
        return "Step 1: Basic Information";
      case 2:
        return "Step 2: Personal Information";
      case 3:
        return "Step 3: Financial Information";
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      {showStepText && <Text style={styles.stepText}>{getStepText()}</Text>}
      <View style={styles.barContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progressPercentage}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    alignSelf: "center",
    marginVertical: 10,
  },
  stepText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
  },
  barContainer: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    width: "100%",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
  },
});

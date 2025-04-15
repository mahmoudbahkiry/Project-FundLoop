import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Appearance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function ThemeSettings() {
  const { theme, setTheme, currentTheme } = useTheme();
  
  const themeOptions = [
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
    { value: 'system', label: 'System Default', icon: 'phone-portrait-outline' },
  ] as const;

  // Force system appearance to match when theme is not 'system'
  useEffect(() => {
    // This is just for debugging - in a real app, we wouldn't need this
    console.log('Current theme:', currentTheme);
  }, [currentTheme]);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Theme Settings</ThemedText>
      
      <ThemedView variant="card" style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              theme === option.value && styles.selectedOption,
              { 
                backgroundColor: currentTheme === 'dark' ? '#1A1A1A' : '#F5F5F5',
                borderBottomColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }
            ]}
            onPress={() => setTheme(option.value)}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={theme === option.value 
                ? Colors[currentTheme].primary 
                : Colors[currentTheme].icon
              }
            />
            <ThemedText
              style={[
                styles.optionText,
                theme === option.value && { 
                  color: Colors[currentTheme].primary,
                  fontWeight: '600'
                }
              ]}
            >
              {option.label}
            </ThemedText>
            
            {theme === option.value && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors[currentTheme].primary}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>
      
      
      <ThemedText type="caption" style={styles.note}>
        Changes will apply to the entire application
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  title: {
    marginBottom: 15,
  },
  optionsContainer: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  selectedOption: {
    borderLeftWidth: 3,
    borderLeftColor: '#00A86B',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  note: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
});

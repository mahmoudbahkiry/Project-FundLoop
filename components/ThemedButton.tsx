import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export type ThemedButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: any;
  textStyle?: any;
};

export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ThemedButtonProps) {
  const { currentTheme } = useTheme();
  
  // Get button styles based on variant and theme
  const getButtonStyles = () => {
    const baseStyle = [styles.button, getSizeStyle()];
    
    switch (variant) {
      case 'primary':
        return [
          ...baseStyle,
          {
            backgroundColor: Colors[currentTheme].primary,
            borderColor: Colors[currentTheme].primary,
          },
        ];
      case 'secondary':
        return [
          ...baseStyle,
          {
            backgroundColor: currentTheme === 'dark' ? '#333333' : '#E0E0E0',
            borderColor: currentTheme === 'dark' ? '#333333' : '#E0E0E0',
          },
        ];
      case 'outline':
        return [
          ...baseStyle,
          {
            backgroundColor: 'transparent',
            borderColor: Colors[currentTheme].primary,
            borderWidth: 1,
          },
        ];
      case 'text':
        return [
          ...baseStyle,
          {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            paddingHorizontal: 8,
          },
        ];
      default:
        return baseStyle;
    }
  };
  
  // Get text color based on variant and theme
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return currentTheme === 'dark' ? '#FFFFFF' : '#333333';
      case 'outline':
      case 'text':
        return Colors[currentTheme].primary;
      default:
        return Colors[currentTheme].text;
    }
  };
  
  // Get size-specific styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };
  
  // Get text size based on button size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };
  
  // Get disabled style
  const getDisabledStyle = () => {
    if (disabled) {
      return {
        opacity: 0.5,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), getDisabledStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : Colors[currentTheme].primary} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <ThemedText
            style={[
              getTextSize(),
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  smallText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mediumText: {
    fontSize: 16,
    fontWeight: '600',
  },
  largeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

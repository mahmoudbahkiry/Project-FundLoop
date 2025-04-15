import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Animated, Easing } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export type ThemedSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
};

export function ThemedSwitch({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  style,
}: ThemedSwitchProps) {
  const { currentTheme } = useTheme();
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  
  // Update animation when value changes
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);
  
  // Get switch dimensions based on size
  const getSwitchDimensions = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 24,
          borderRadius: 12,
          thumbSize: 20,
          thumbRadius: 10,
          padding: 2,
        };
      case 'large':
        return {
          width: 60,
          height: 36,
          borderRadius: 18,
          thumbSize: 32,
          thumbRadius: 16,
          padding: 2,
        };
      default: // medium
        return {
          width: 50,
          height: 30,
          borderRadius: 15,
          thumbSize: 26,
          thumbRadius: 13,
          padding: 2,
        };
    }
  };
  
  const dimensions = getSwitchDimensions();
  
  // Get background color based on state and theme
  const getBackgroundColor = () => {
    if (disabled) {
      return currentTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
    }
    
    if (value) {
      return Colors[currentTheme].primary;
    }
    
    return currentTheme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  };
  
  // Handle toggle
  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };
  
  // Calculate the thumb position
  const thumbPosition = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dimensions.width - dimensions.thumbSize - dimensions.padding * 2],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleToggle}
      disabled={disabled}
      style={style}
    >
      <View
        style={[
          styles.track,
          {
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: dimensions.borderRadius,
            backgroundColor: getBackgroundColor(),
            opacity: disabled ? 0.5 : 1,
            padding: dimensions.padding,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: dimensions.thumbSize,
              height: dimensions.thumbSize,
              borderRadius: dimensions.thumbRadius,
              transform: [{ translateX: thumbPosition }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
  thumb: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

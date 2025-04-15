import { View, type ViewProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'elevated' | 'outlined' | 'surface' | 'innerCard';
  rounded?: boolean;
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  rounded = false,
  ...otherProps 
}: ThemedViewProps) {
  const { currentTheme } = useTheme();
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const borderColor = useThemeColor({}, 'icon');
  
  // Get theme-specific styles for variants
  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return {
          ...styles.card,
          backgroundColor: currentTheme === 'dark' ? '#222222' : '#F5F5F5',
          shadowColor: currentTheme === 'dark' ? '#000' : '#000',
        };
      case 'innerCard':
        return {
          ...styles.innerCard,
          backgroundColor: currentTheme === 'dark' ? '#333333' : 'rgba(0,0,0,0.03)',
        };
      case 'elevated':
        return {
          ...styles.elevated,
          backgroundColor: currentTheme === 'dark' ? '#222222' : '#FFFFFF',
          shadowColor: currentTheme === 'dark' ? '#000' : '#000',
        };
      case 'outlined':
        return {
          ...styles.outlined,
          borderColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        };
      case 'surface':
        return {
          ...styles.surface,
          backgroundColor: currentTheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
        };
      default:
        return {};
    }
  };

  return (
    <View 
      style={[
        { backgroundColor },
        getVariantStyles(),
        rounded && styles.rounded,
        style
      ]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
  },
  innerCard: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  elevated: {
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  surface: {
    padding: 16,
    borderRadius: 12,
  },
  rounded: {
    borderRadius: 12,
  }
});

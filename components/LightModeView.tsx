import { View, type ViewProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export type LightModeViewProps = ViewProps & {
  variant?: 'default' | 'card' | 'elevated' | 'outlined' | 'surface' | 'innerCard';
  rounded?: boolean;
};

/**
 * A View component that always uses light mode colors regardless of the system theme
 */
export function LightModeView({ 
  style, 
  variant = 'default',
  rounded = false,
  ...otherProps 
}: LightModeViewProps) {
  const backgroundColor = Colors.light.background;
  const borderColor = Colors.light.icon;
  
  // Get light mode styles for variants
  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return {
          ...styles.card,
          backgroundColor: '#F5F5F5',
          shadowColor: '#000',
        };
      case 'innerCard':
        return {
          ...styles.innerCard,
          backgroundColor: 'rgba(0,0,0,0.03)',
        };
      case 'elevated':
        return {
          ...styles.elevated,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
        };
      case 'outlined':
        return {
          ...styles.outlined,
          borderColor: 'rgba(0,0,0,0.15)',
        };
      case 'surface':
        return {
          ...styles.surface,
          backgroundColor: '#FFFFFF',
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

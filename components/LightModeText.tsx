import { Text, type TextProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export type LightModeTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'heading' | 'caption' | 'label';
};

/**
 * A Text component that always uses light mode colors regardless of the system theme
 */
export function LightModeText({
  style,
  type = 'default',
  ...rest
}: LightModeTextProps) {
  const color = Colors.light.text;

  // Get light mode text styles
  const getTextStyles = () => {
    const baseStyle = getBaseStyle(type);
    
    // Add light mode color adjustments
    if (type === 'link') {
      return [baseStyle, { color: Colors.light.primary }];
    } else if (type === 'caption') {
      return [baseStyle, { color: 'rgba(0,0,0,0.6)' }];
    } else if (type === 'label') {
      return [baseStyle, { color: 'rgba(0,0,0,0.7)' }];
    }
    
    return baseStyle;
  };
  
  // Get base style for the text type
  const getBaseStyle = (textType: LightModeTextProps['type']) => {
    switch (textType) {
      case 'default':
        return styles.default;
      case 'defaultSemiBold':
        return styles.defaultSemiBold;
      case 'title':
        return styles.title;
      case 'subtitle':
        return styles.subtitle;
      case 'heading':
        return styles.heading;
      case 'link':
        return styles.link;
      case 'caption':
        return styles.caption;
      case 'label':
        return styles.label;
      default:
        return styles.default;
    }
  };

  return (
    <Text
      style={[
        { color },
        getTextStyles(),
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
    letterSpacing: 0.1,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'none',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400',
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.25,
    fontWeight: '500',
  },
});

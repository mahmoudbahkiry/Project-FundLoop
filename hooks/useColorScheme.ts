import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export function useColorScheme() {
  const { currentTheme } = useTheme();
  return currentTheme;
}

// Export the original hook for use in ThemeContext
export { useDeviceColorScheme as useDeviceColorScheme };

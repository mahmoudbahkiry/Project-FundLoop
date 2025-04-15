/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * This modern color scheme uses green as the primary color with black for dark mode and white for light mode.
 */

// Modern green color palette
const primaryGreen = '#00A86B';
const secondaryGreen = '#4CAF50';
const successGreen = '#2ECC71';
const darkGreen = '#006D45';

const tintColorLight = primaryGreen;
const tintColorDark = primaryGreen;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: primaryGreen,
    secondary: secondaryGreen,
    success: successGreen,
    dark: darkGreen,
  },
  dark: {
    text: '#ECEDEE',
    background: '#000000',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: primaryGreen,
    secondary: secondaryGreen,
    success: successGreen,
    dark: darkGreen,
  },
};

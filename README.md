# FundLoop

FundLoop is a comprehensive mobile application built with React Native and Expo, designed for investment fund management and trading analytics.

## 🌟 Current Features

- **Authentication & Onboarding**

  - Secure login and signup functionality
  - User personal and financial information collection
  - Welcome onboarding experience

- **Dashboard & Home**

  - Overview dashboard with key metrics and performance indicators
  - Real-time portfolio status and summary

- **Trading Platform**

  - Real-time trading interface with advanced charts
  - Buy and sell stock functionality
  - Stock details and analytics
  - Starred/Watchlist stocks management
  - Live chat for market discussions

- **Performance & Analytics**

  - Detailed trading performance analytics
  - Visual representations of investment performance
  - Progress tracking and evaluation
  - Custom charts and data visualization

- **Rules & Evaluation**

  - Customizable trading rules parameters
  - Trading evaluation tools
  - Rule compliance monitoring

- **Account Management**

  - User profile management
  - Account settings and preferences
  - Financial account information

- **Withdrawal Options**

  - Bank transfer withdrawals
  - Cryptocurrency withdrawals
  - Instapay withdrawal method

- **Support & Information**
  - Documentation and guides
  - FAQ section
  - Contact support functionality
  - Terms of service and privacy policy
  - Funded features information

## 🚀 Tech Stack

- [Expo](https://expo.dev/) - React Native framework
- [Firebase](https://firebase.google.com/) - Backend and authentication
- [React Navigation](https://reactnavigation.org/) - Navigation and routing
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animations
- [React Native Skia](https://shopify.github.io/react-native-skia/) - High-performance graphics
- [Wagmi Charts](https://github.com/coinjar/react-native-wagmi-charts) - Financial charting
- [Chart Kit](https://github.com/indiespirit/react-native-chart-kit) - Additional charting tools

## 📱 Getting Started

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional for testing)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/mahmoudbahkiry/Project-FundLoop.git
   cd Project-FundLoop
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server

   ```bash
   npm start
   # or
   yarn start
   ```

4. Run on a specific platform

   ```bash
   # For iOS
   npm run ios

   # For Android
   npm run android

   # For web
   npm run web
   ```

## 📂 Project Structure

- `/app` - Main application code using Expo Router file-based routing
  - `/(auth)` - Authentication screens (login, signup, welcome, personal/financial information)
  - `/(tabs)` - Main app tabs (home, trading, analytics, progress, settings, etc.)
  - `/(withdraw)` - Withdrawal method screens (bank, crypto, instapay)
- `/components` - Reusable UI components
- `/contexts` - React contexts for state management
- `/hooks` - Custom React hooks
- `/constants` - Application constants and configuration
- `/assets` - Images, fonts, and other static assets

## 🔧 Configuration

The app uses Firebase for backend services. Make sure to set up your Firebase project and update the configuration files accordingly.

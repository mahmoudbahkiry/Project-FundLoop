import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Create navigation stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EvaluationScreen from '../screens/EvaluationScreen';
import RulesScreen from '../screens/RulesScreen';
import PerformanceScreen from '../screens/PerformanceScreen';
import AccountScreen from '../screens/AccountScreen';

// Bottom Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#2E3192',
      },
      headerTintColor: '#fff',
      tabBarStyle: {
        backgroundColor: '#fff',
      },
      tabBarActiveTintColor: '#2E3192',
      tabBarInactiveTintColor: '#666',
    }}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

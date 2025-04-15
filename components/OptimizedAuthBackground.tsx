import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

type OptimizedAuthBackgroundProps = {
  position: 'top' | 'bottom';
};

export function OptimizedAuthBackground({ position }: OptimizedAuthBackgroundProps) {
  const [showFullBackground, setShowFullBackground] = useState(false);
  const primaryColor = Colors.light.primary;
  const secondaryColor = Colors.light.secondary;
  
  // Delay loading the full background
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFullBackground(true);
    }, 300); // Short delay to prioritize UI rendering
    
    return () => clearTimeout(timer);
  }, []);

  // Simple static background that loads instantly
  return (
    <View style={[
      styles.container, 
      position === 'top' ? styles.topContainer : styles.bottomContainer
    ]}>
      <View 
        style={[
          styles.gradientBackground,
          position === 'top' ? styles.topGradient : styles.bottomGradient,
          { 
            backgroundColor: position === 'top' 
              ? primaryColor 
              : secondaryColor
          }
        ]}
      >
        {/* Static background shape instead of animated SVG */}
        <View style={[
          styles.staticWave,
          position === 'top' ? styles.topWave : styles.bottomWave,
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  topContainer: {
    top: 0,
    height: 180,
  },
  bottomContainer: {
    bottom: 0,
    height: 150,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  topGradient: {
    top: 0,
    height: 160,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  bottomGradient: {
    bottom: 0,
    height: 140,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  staticWave: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
  },
  topWave: {
    bottom: 0,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  bottomWave: {
    top: 0,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
});

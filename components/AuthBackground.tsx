import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

type AuthBackgroundProps = {
  position: 'top' | 'bottom';
};

export function AuthBackground({ position }: AuthBackgroundProps) {
  const primaryColor = Colors.light.primary;
  const secondaryColor = Colors.light.secondary;
  const darkGreen = Colors.light.dark;
  
  // Animation values
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Start animation when component mounts
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Different wave paths for top and bottom - more interesting curves
  const getWavePath = () => {
    if (position === 'top') {
      // More complex and interesting wave for top
      return 'M0,160L40,144C80,128,160,96,240,90.7C320,85,400,107,480,128C560,149,640,171,720,165.3C800,160,880,128,960,117.3C1040,107,1120,117,1200,122.7C1280,128,1360,128,1400,128L1440,128L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z';
    } else {
      // More complex and interesting wave for bottom
      return 'M0,96L40,101.3C80,107,160,117,240,122.7C320,128,400,128,480,117.3C560,107,640,85,720,90.7C800,96,880,128,960,138.7C1040,149,1120,139,1200,133.3C1280,128,1360,128,1400,128L1440,128L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z';
    }
  };

  // Second wave path for layered effect
  const getSecondWavePath = () => {
    if (position === 'top') {
      return 'M0,128L40,133.3C80,139,160,149,240,144C320,139,400,117,480,112C560,107,640,117,720,133.3C800,149,880,171,960,165.3C1040,160,1120,128,1200,117.3C1280,107,1360,117,1400,122.7L1440,128L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z';
    } else {
      return 'M0,64L40,80C80,96,160,128,240,133.3C320,139,400,117,480,106.7C560,96,640,96,720,101.3C800,107,880,117,960,122.7C1040,128,1120,128,1200,122.7C1280,117,1360,107,1400,101.3L1440,96L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z';
    }
  };

  // Get gradient IDs
  const getGradientId = () => position === 'top' ? 'topGradient' : 'bottomGradient';
  const getSecondGradientId = () => position === 'top' ? 'topGradient2' : 'bottomGradient2';

  return (
    <View style={[
      styles.container, 
      position === 'top' ? styles.topContainer : styles.bottomContainer
    ]}>
      <Animated.View 
        style={[
          styles.gradientBackground,
          position === 'top' ? styles.topGradient : styles.bottomGradient,
          {
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, position === 'top' ? -10 : 10]
                })
              }
            ]
          }
        ]}
      >
        {/* Main background with gradient */}
        <View style={[
          styles.colorBackground,
          { 
            backgroundColor: position === 'top' 
              ? primaryColor 
              : secondaryColor
          }
        ]} />
        
        {/* First wave */}
        <Svg
          height={position === 'top' ? 180 : 150}
          width={width}
          viewBox={`0 0 1440 ${position === 'top' ? 180 : 320}`}
          style={[styles.waveSvg, { opacity: 0.9 }]}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient
              id={getGradientId()}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={position === 'top' ? darkGreen : primaryColor} stopOpacity="0.8" />
              <Stop offset="100%" stopColor="white" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Path
            d={getWavePath()}
            fill={`url(#${getGradientId()})`}
          />
        </Svg>
        
        {/* Second wave for layered effect */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: position === 'top' ? 0 : undefined,
            bottom: position === 'bottom' ? 0 : undefined,
            transform: [
              {
                translateX: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20]
                })
              }
            ]
          }}
        >
          <Svg
            height={position === 'top' ? 180 : 150}
            width={width}
            viewBox={`0 0 1440 ${position === 'top' ? 180 : 320}`}
            style={[styles.waveSvg, { opacity: 0.7 }]}
            preserveAspectRatio="none"
          >
            <Defs>
              <LinearGradient
                id={getSecondGradientId()}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <Stop offset="0%" stopColor={position === 'top' ? primaryColor : darkGreen} stopOpacity="0.6" />
                <Stop offset="100%" stopColor="white" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d={getSecondWavePath()}
              fill={`url(#${getSecondGradientId()})`}
            />
          </Svg>
        </Animated.View>
      </Animated.View>
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
    height: 220, // Increased height for more visual impact
  },
  bottomContainer: {
    bottom: 0,
    height: 180, // Increased height for more visual impact
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  colorBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  topGradient: {
    top: 0,
    height: 160, // Increased height
  },
  bottomGradient: {
    bottom: 0,
    height: 140, // Increased height
  },
  waveSvg: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

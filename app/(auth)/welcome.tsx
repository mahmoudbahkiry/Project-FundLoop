import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LightModeText } from '@/components/LightModeText';
import { LightModeView } from '@/components/LightModeView';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const primaryColor = Colors.light.primary;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const scrollToPage = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setCurrentPage(index);
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  const welcomeCards = [
    {
      title: 'Welcome to FundLoop',
      content: "Egypt's first proprietary trading platform, designed to empower traders with the capital and tools they need to succeed in the financial markets.",
      image: require('../../assets/images/FundloopLogoGreen.png'),
    },
    {
      title: 'How Prop Trading Works',
      content: 'Proprietary trading firms provide capital to skilled traders. You trade our funds, and we share the profits. No personal capital at risk, just your trading expertise.',
      steps: [
        'We provide the trading capital',
        'You apply your trading skills',
        'We share the profits (up to 90%)',
        'Scale up as you succeed'
      ]
    },
    {
      title: 'Benefits for Traders',
      content: 'Join FundLoop and unlock your potential as a trader with our comprehensive support system.',
      benefits: [
        {
          title: 'Access to Capital',
          description: 'Trade with accounts up to $200,000 without risking your own money'
        },
        {
          title: 'Scaling Opportunities',
          description: 'Increase your account size as you demonstrate consistent performance'
        },
        {
          title: 'Professional Tools',
          description: 'Access to premium trading platforms and analytical tools'
        },
        {
          title: 'Community Support',
          description: 'Join a network of traders and learn from the best'
        }
      ]
    },
    {
      title: 'Evaluation Process',
      content: 'Our structured evaluation process is designed to identify and reward skilled traders.',
      phases: [
        {
          title: 'Phase 1',
          description: 'Demonstrate basic trading competence with relaxed targets'
        },
        {
          title: 'Phase 2',
          description: 'Show consistency and risk management over a longer period'
        },
        {
          title: 'Funded Account',
          description: 'Trade a live funded account with profit sharing up to 90%'
        }
      ],
      showButton: true
    }
  ];

  const renderDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {welcomeCards.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: currentPage === index ? primaryColor : '#ccc' }
            ]}
            onPress={() => scrollToPage(index)}
          />
        ))}
      </View>
    );
  };

  const renderCard = (card: any, index: number) => {
    return (
      <View key={index} style={[styles.card, { width }]}>
        <LightModeView variant="elevated" style={styles.cardContent}>
          {card.image && (
            <Image 
              source={card.image} 
              style={styles.cardImage}
              resizeMode="contain"
            />
          )}
          
          <LightModeText type="heading" style={styles.cardTitle}>
            {card.title}
          </LightModeText>
          
          <LightModeText style={styles.cardDescription}>
            {card.content}
          </LightModeText>

          {card.steps && (
            <View style={styles.stepsContainer}>
              {card.steps.map((step: string, idx: number) => (
                <View key={idx} style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: primaryColor }]}>
                    <LightModeText style={styles.stepNumberText}>{idx + 1}</LightModeText>
                  </View>
                  <LightModeText style={styles.stepText}>{step}</LightModeText>
                </View>
              ))}
            </View>
          )}

          {card.benefits && (
            <View style={styles.benefitsContainer}>
              {card.benefits.map((benefit: any, idx: number) => (
                <LightModeView key={idx} variant="card" style={styles.benefitItem}>
                  <LightModeText type="defaultSemiBold" style={styles.benefitTitle}>
                    {benefit.title}
                  </LightModeText>
                  <LightModeText style={styles.benefitDescription}>
                    {benefit.description}
                  </LightModeText>
                </LightModeView>
              ))}
            </View>
          )}

          {card.phases && (
            <View style={styles.phasesContainer}>
              {card.phases.map((phase: any, idx: number) => (
                <View key={idx} style={styles.phaseItem}>
                  <LightModeView 
                    variant="outlined" 
                    style={[
                      styles.phaseHeader, 
                      { borderColor: primaryColor }
                    ]}
                  >
                    <LightModeText type="defaultSemiBold" style={{ color: primaryColor }}>
                      {phase.title}
                    </LightModeText>
                  </LightModeView>
                  <LightModeText style={styles.phaseDescription}>
                    {phase.description}
                  </LightModeText>
                </View>
              ))}
            </View>
          )}

          {card.showButton && (
            <TouchableOpacity
              style={[styles.getStartedButton, { backgroundColor: primaryColor }]}
              onPress={navigateToLogin}
            >
              <LightModeText style={styles.getStartedButtonText}>
                Get Started
              </LightModeText>
            </TouchableOpacity>
          )}
        </LightModeView>
      </View>
    );
  };

  return (
    <LightModeView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {welcomeCards.map(renderCard)}
      </ScrollView>
      {renderDots()}
    </LightModeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContent: {
    width: '100%',
    height: '85%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  cardDescription: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    width: '100%',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  stepsContainer: {
    width: '100%',
    marginTop: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
  },
  benefitsContainer: {
    width: '100%',
    marginTop: 16,
  },
  benefitItem: {
    marginBottom: 12,
    width: '100%',
  },
  benefitTitle: {
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
  },
  phasesContainer: {
    width: '100%',
    marginTop: 16,
  },
  phaseItem: {
    marginBottom: 16,
    width: '100%',
  },
  phaseHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  phaseDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  getStartedButton: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

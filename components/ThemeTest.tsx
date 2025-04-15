import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { ThemedButton } from './ThemedButton';
import { ThemedSwitch } from './ThemedSwitch';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * A component to test that theming is working correctly across different components
 */
export function ThemeTest() {
  const { currentTheme } = useTheme();
  const [switchValue, setSwitchValue] = React.useState(false);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Theme Test Component
      </ThemedText>
      
      <ThemedText>
        Current theme: <ThemedText type="defaultSemiBold">{currentTheme}</ThemedText>
      </ThemedText>
      
      <View style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Text Variants
        </ThemedText>
        <ThemedText type="default">Default Text</ThemedText>
        <ThemedText type="defaultSemiBold">Default Semi Bold</ThemedText>
        <ThemedText type="subtitle">Subtitle</ThemedText>
        <ThemedText type="heading">Heading</ThemedText>
        <ThemedText type="caption">Caption Text</ThemedText>
        <ThemedText type="link">Link Text</ThemedText>
        <ThemedText type="label">Label Text</ThemedText>
      </View>
      
      <View style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          View Variants
        </ThemedText>
        
        <ThemedView variant="card" style={styles.viewDemo}>
          <ThemedText>Card View</ThemedText>
        </ThemedView>
        
        <ThemedView variant="elevated" style={styles.viewDemo}>
          <ThemedText>Elevated View</ThemedText>
        </ThemedView>
        
        <ThemedView variant="outlined" style={styles.viewDemo}>
          <ThemedText>Outlined View</ThemedText>
        </ThemedView>
        
        <ThemedView variant="surface" style={styles.viewDemo}>
          <ThemedText>Surface View</ThemedText>
        </ThemedView>
      </View>
      
      <View style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Button Variants
        </ThemedText>
        
        <View style={styles.buttonRow}>
          <ThemedButton
            title="Primary"
            variant="primary"
            onPress={() => {}}
            style={styles.button}
          />
          
          <ThemedButton
            title="Secondary"
            variant="secondary"
            onPress={() => {}}
            style={styles.button}
          />
        </View>
        
        <View style={styles.buttonRow}>
          <ThemedButton
            title="Outline"
            variant="outline"
            onPress={() => {}}
            style={styles.button}
          />
          
          <ThemedButton
            title="Text"
            variant="text"
            onPress={() => {}}
            style={styles.button}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Switch Component
        </ThemedText>
        
        <View style={styles.switchRow}>
          <ThemedText>Toggle Switch</ThemedText>
          <ThemedSwitch
            value={switchValue}
            onValueChange={(value) => setSwitchValue(value)}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  viewDemo: {
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { mockOnboardingApi } from '../api/mockOnboardingApi';

export default function SplashScreen() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const handleProceed = useCallback(async () => {
    // no-op call against the mock layer for now — kept for parity with future real check
    await mockOnboardingApi.isNumberRegistered('');
    router.replace('/phone-entry');
  }, [router]);

  return (
    <Pressable
      style={styles.container}
      onPress={handleProceed}
      accessibilityRole="button"
      accessibilityLabel="Tap to continue"
    >
      <View style={styles.content}>
        <Text style={styles.logo}>Sealine</Text>
        <Text style={styles.hint}>Tap to continue</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hint: {
    color: '#8A94A6',
    fontSize: 13,
  },
});
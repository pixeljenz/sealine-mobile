// app/legal-acceptance.tsx
// ONB-1.3 — Legal acceptance gate before OTP
// Per PRD Scenario 1.12, PRD §5.1: Acceptance screen shown before OTP entry;
// single explicit action; bundles 16+ age confirmation. Cannot reach OTP without it.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { mockOnboardingApi } from '@/api/mockOnboardingApi';

export default function LegalAcceptanceScreen() {
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const phoneNumber = params.phoneNumber || '';
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if legal was already accepted (in case user goes back)
  useEffect(() => {
    const checkLegal = async () => {
      try {
        const hasAccepted = await mockOnboardingApi.hasAcceptedLegal(phoneNumber);
        if (hasAccepted) {
          setAccepted(true);
        }
      } catch (error) {
        // Ignore - session might not exist
      }
    };
    checkLegal();
  }, [phoneNumber]);

  const handleAccept = async () => {
    setIsLoading(true);
    
    try {
      // Record legal acceptance in mock API (ONB-1.3 backend enforcement)
      await mockOnboardingApi.acceptLegal(phoneNumber);
      
      // Navigate to OTP entry
      router.push({
        pathname: '/otp-entry',
        params: { phoneNumber }
      });
    } catch (error: any) {
      if (error.message === 'NO_ACTIVE_SESSION') {
        Alert.alert(
          'Session Expired',
          'Please go back and enter your phone number again.'
        );
        router.back();
      } else {
        Alert.alert('Error', 'Failed to save acceptance. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openTerms = () => {
    // TODO: Replace with actual Terms URL
    Linking.openURL('https://example.com/terms');
  };

  const openPrivacy = () => {
    // TODO: Replace with actual Privacy Policy URL
    Linking.openURL('https://example.com/privacy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Terms of Service & Privacy Policy</Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.summary}>
            By using this app, you agree to our Terms of Service and Privacy Policy.
            {'\n\n'}
            You confirm that you are 16 years of age or older.
          </Text>

          <View style={styles.divider} />

          <TouchableOpacity onPress={openTerms} style={styles.linkButton}>
            <Text style={styles.linkText}>📄 Read Full Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openPrivacy} style={styles.linkButton}>
            <Text style={styles.linkText}>🔒 Read Privacy Policy</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Single explicit acceptance action - bundles 16+ age confirmation */}
        <TouchableOpacity
          style={[
            styles.acceptButton,
            accepted && styles.acceptButtonActive,
            isLoading && styles.acceptButtonDisabled,
          ]}
          onPress={handleAccept}
          disabled={accepted || isLoading}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I accept the Terms of Service and Privacy Policy
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!accepted || isLoading) && styles.continueButtonDisabled,
          ]}
          onPress={handleAccept}
          disabled={!accepted || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.ageNote}>You confirm you are 16 years or older</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15171C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3FC6B8',
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    color: '#F3F3F4',
    marginTop: 8,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  summary: {
    fontSize: 16,
    color: '#D7DAE0',
    lineHeight: 24,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#2E323C',
    marginVertical: 12,
  },
  linkButton: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2E323C',
  },
  linkText: {
    fontSize: 16,
    color: '#3FC6B8',
  },
  spacer: {
    height: 24,
  },
  acceptButton: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2E323C',
    marginTop: 8,
  },
  acceptButtonActive: {
    borderColor: '#0F9C90',
    backgroundColor: 'rgba(15, 156, 144, 0.05)',
  },
  acceptButtonDisabled: {
    opacity: 0.5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4B4F5A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#0F9C90',
    borderColor: '#0F9C90',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#F3F3F4',
    flex: 1,
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#0F9C90',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  continueButtonDisabled: {
    opacity: 0.35,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  ageNote: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 11,
    marginTop: 12,
    marginBottom: 24,
  },
});
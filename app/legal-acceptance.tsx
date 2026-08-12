// app/legal-acceptance.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function LegalAcceptanceScreen() {
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    router.push({
      pathname: '/otp-entry',
      params: { phoneNumber: params.phoneNumber }
    });
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

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I accept the Terms of Service and Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !accepted && styles.continueButtonDisabled,
          ]}
          onPress={handleAccept}
          disabled={!accepted}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
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
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    fontWeight: '700',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    marginTop: 8,
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
    marginTop: 2,
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
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: '#0F9C90',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  continueButtonDisabled: {
    opacity: 0.35,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
// app/phone-entry.tsx
// ONB-1.2 — Phone number entry + country code
// Per PRD Scenarios 1.2–1.4: Country code selector, validates before Continue enables.
// Cannot proceed with incomplete/invalid number.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { mockOnboardingApi } from '@/api/mockOnboardingApi';

const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada', minLength: 10, maxLength: 10 },
  { code: '+91', country: 'India', minLength: 10, maxLength: 10 },
  { code: '+44', country: 'UK', minLength: 10, maxLength: 10 },
  { code: '+61', country: 'Australia', minLength: 9, maxLength: 10 },
  { code: '+81', country: 'Japan', minLength: 10, maxLength: 10 },
  { code: '+86', country: 'China', minLength: 11, maxLength: 11 },
  { code: '+49', country: 'Germany', minLength: 10, maxLength: 11 },
  { code: '+33', country: 'France', minLength: 9, maxLength: 9 },
  { code: '+39', country: 'Italy', minLength: 10, maxLength: 10 },
  { code: '+55', country: 'Brazil', minLength: 10, maxLength: 11 },
  { code: '+82', country: 'South Korea', minLength: 10, maxLength: 10 },
  { code: '+65', country: 'Singapore', minLength: 8, maxLength: 8 },
  { code: '+60', country: 'Malaysia', minLength: 9, maxLength: 10 },
  { code: '+971', country: 'UAE', minLength: 9, maxLength: 9 },
  { code: '+966', country: 'Saudi Arabia', minLength: 9, maxLength: 9 },
  { code: '+34', country: 'Spain', minLength: 9, maxLength: 9 },
  { code: '+31', country: 'Netherlands', minLength: 9, maxLength: 9 },
  { code: '+46', country: 'Sweden', minLength: 9, maxLength: 9 },
  { code: '+41', country: 'Switzerland', minLength: 9, maxLength: 9 },
  { code: '+52', country: 'Mexico', minLength: 10, maxLength: 10 },
];

export default function PhoneEntryScreen() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidPhoneNumber = (number: string): boolean => {
    const digitsOnly = number.replace(/\D/g, '');
    return digitsOnly.length >= selectedCountry.minLength && 
           digitsOnly.length <= selectedCountry.maxLength;
  };

  const handleContinue = async () => {
    const fullNumber = selectedCountry.code + phoneNumber.replace(/\D/g, '');
    
    if (!isValidPhoneNumber(phoneNumber)) {
      setError(`Please enter a valid ${selectedCountry.country} phone number (${selectedCountry.minLength}-${selectedCountry.maxLength} digits).`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Send OTP
      await mockOnboardingApi.sendOtp(fullNumber);
      
      // Navigate to legal acceptance with phone number
      router.push({
        pathname: '/legal-acceptance',
        params: { phoneNumber: fullNumber }
      });
    } catch (error: any) {
      if (error.message === 'RESEND_COOLDOWN_ACTIVE') {
        Alert.alert('Please Wait', 'Please wait 30 seconds before requesting another code.');
      } else {
        Alert.alert('Error', 'Failed to send verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectCountry = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Clear error when country changes
    setError('');
  };

  const handleNumberChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/\D/g, '');
    setPhoneNumber(digitsOnly);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>What's your number?</Text>
        <Text style={styles.subtitle}>
          We'll send a one-time code to verify it's you.
        </Text>

        <Text style={styles.fieldLabel}>Phone number</Text>

        <View style={styles.inputContainer}>
          {/* Country Code */}
          <TouchableOpacity
            style={styles.countryCodeButton}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Phone Number Input */}
          <TextInput
            style={styles.phoneInput}
            placeholder={selectedCountry.country}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={handleNumberChange}
            maxLength={selectedCountry.maxLength}
            editable={!isLoading}
            placeholderTextColor="#6B7280"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isValidPhoneNumber(phoneNumber) || isLoading) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isValidPhoneNumber(phoneNumber) || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Send code</Text>
          )}
        </TouchableOpacity>

        {/* Country Picker Modal */}
        <Modal
          visible={showCountryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Country</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {COUNTRY_CODES.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryOption,
                      selectedCountry.code === country.code && styles.countryOptionSelected,
                    ]}
                    onPress={() => selectCountry(country)}
                  >
                    <Text style={[
                      styles.countryOptionText,
                      selectedCountry.code === country.code && styles.countryOptionTextSelected,
                    ]}>
                      {country.country} ({country.code})
                    </Text>
                    {selectedCountry.code === country.code && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    fontSize: 26,
    color: '#F3F3F4',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA0AC',
    marginBottom: 36,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#9AA0AC',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E323C',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
    backgroundColor: '#1C1F26',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#2E323C',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F3F3F4',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#9AA0AC',
    marginLeft: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 12,
    color: '#F3F3F4',
  },
  errorText: {
    color: '#E5484D',
    fontSize: 11.5,
    marginTop: 8,
    minHeight: 14,
  },
  continueButton: {
    backgroundColor: '#0F9C90',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 8,
  },
  continueButtonDisabled: {
    opacity: 0.35,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1F26',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 400,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2E323C',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F3F4',
  },
  modalClose: {
    fontSize: 18,
    color: '#9AA0AC',
    padding: 4,
  },
  countryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2E323C',
  },
  countryOptionSelected: {
    backgroundColor: 'rgba(15, 156, 144, 0.1)',
  },
  countryOptionText: {
    fontSize: 16,
    color: '#F3F3F4',
  },
  countryOptionTextSelected: {
    color: '#3FC6B8',
    fontWeight: '600',
  },
  checkmark: {
    color: '#3FC6B8',
    fontSize: 16,
    fontWeight: '700',
  },
});
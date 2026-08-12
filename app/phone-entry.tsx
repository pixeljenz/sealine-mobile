// app/phone-entry.tsx
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
} from 'react-native';
import { router } from 'expo-router';
import { mockOnboardingApi } from '@/api/mockOnboardingApi';

// Country codes
const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada' },
  { code: '+91', country: 'India' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+39', country: 'Italy' },
  { code: '+55', country: 'Brazil' },
  { code: '+82', country: 'South Korea' },
  { code: '+65', country: 'Singapore' },
  { code: '+60', country: 'Malaysia' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+34', country: 'Spain' },
  { code: '+31', country: 'Netherlands' },
  { code: '+46', country: 'Sweden' },
  { code: '+41', country: 'Switzerland' },
  { code: '+52', country: 'Mexico' },
];

export default function PhoneEntryScreen() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidPhoneNumber = (number: string): boolean => {
    const digitsOnly = number.replace(/\D/g, '');
    return digitsOnly.length >= 4 && digitsOnly.length <= 15;
  };

  const handleContinue = async () => {
    const fullNumber = selectedCountry.code + phoneNumber.replace(/\D/g, '');
    
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number.');
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
            onPress={() => setShowCountryPicker(!showCountryPicker)}
          >
            <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Phone Number Input */}
          <TextInput
            style={styles.phoneInput}
            placeholder="98765 43210"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setError('');
            }}
            maxLength={15}
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
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Sending...' : 'Send code'}
          </Text>
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
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    fontWeight: '700',
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
    fontFamily: 'IBMPlexMono_400Regular',
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
    fontFamily: 'IBMPlexMono_400Regular',
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
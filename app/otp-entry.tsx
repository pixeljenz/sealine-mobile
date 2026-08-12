// app/otp-entry.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { mockOnboardingApi } from '@/api/mockOnboardingApi';

export default function OtpEntryScreen() {
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const phoneNumber = params.phoneNumber || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Effect for lockout countdown
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutSeconds]);

  // Effect for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    if (isLocked) {
      setError(`Please wait ${lockoutSeconds} seconds.`);
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const result = await mockOnboardingApi.verifyOtp(phoneNumber, code);

      if (result.status === 'success') {
        // Check if number is registered (ONB-1.6)
        const isRegistered = await mockOnboardingApi.isNumberRegistered(phoneNumber);
        
        // Clear session
        mockOnboardingApi.clearSession();
        
        if (isRegistered) {
          // Existing user → go to ChatList
          router.replace('/(tabs)');
        } else {
          // New user → go to ProfileSetup
          router.push({
            pathname: '/profile-setup',
            params: { phoneNumber }
          });
        }
      } else if (result.status === 'wrong_code') {
        setAttempts((prev) => prev + 1);
        const remaining = result.attemptsRemaining;
        setError(`Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        // Shake animation
        const row = document.getElementById('otp-row');
        if (row) {
          row.classList.add('shake');
          setTimeout(() => row.classList.remove('shake'), 400);
        }
      } else if (result.status === 'locked_out') {
        setIsLocked(true);
        setLockoutSeconds(result.secondsRemaining);
        setError(`Too many attempts. Try again in ${result.secondsRemaining}s.`);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await mockOnboardingApi.sendOtp(phoneNumber);
      setResendCooldown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setError('');
      Alert.alert('Code Sent', 'A new verification code has been sent.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          disabled={isVerifying}
        >
          <Text style={styles.backText}>← Edit Number</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>
          Sent to {phoneNumber}
        </Text>

        <View style={styles.otpContainer} id="otp-row">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                isLocked && styles.otpInputLocked,
                error && styles.otpInputError,
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!isLocked && !isVerifying}
            />
          ))}
        </View>

        <Text style={styles.demoNote}>Demo code: 123456</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (otp.join('').length !== 6 || isVerifying || isLocked) && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={otp.join('').length !== 6 || isVerifying || isLocked}
        >
          <Text style={styles.verifyButtonText}>
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResend}
          disabled={resendCooldown > 0 || isVerifying}
        >
          <Text style={[
            styles.resendText,
            resendCooldown > 0 && styles.resendTextDisabled,
          ]}>
            {resendCooldown > 0 
              ? `Resend code in ${resendCooldown}s` 
              : "Didn't get it? Resend code"}
          </Text>
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
    fontSize: 26,
    fontWeight: '700',
    color: '#F3F3F4',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA0AC',
    marginBottom: 32,
    fontFamily: 'IBMPlexMono_400Regular',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpInput: {
    width: 44,
    height: 54,
    borderWidth: 1,
    borderColor: '#2E323C',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#F3F3F4',
    backgroundColor: '#1C1F26',
    fontFamily: 'IBMPlexMono_400Regular',
  },
  otpInputFilled: {
    borderColor: '#3FC6B8',
  },
  otpInputLocked: {
    borderColor: '#E5484D',
    backgroundColor: 'rgba(229, 72, 77, 0.08)',
  },
  otpInputError: {
    borderColor: '#E5484D',
  },
  demoNote: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'IBMPlexMono_400Regular',
  },
  errorText: {
    color: '#E5484D',
    fontSize: 12,
    marginBottom: 8,
    minHeight: 16,
  },
  verifyButton: {
    backgroundColor: '#0F9C90',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.35,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    color: '#3FC6B8',
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#4B4F5A',
  },
});
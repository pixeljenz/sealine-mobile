// app/profile-setup.tsx
// ONB-1.5 — Profile setup
// Per PRD Scenarios 2.1–2.4: Name required (non-empty), photo optional (default avatar if skipped),
// about/status pre-filled and editable but never clearable.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { mockOnboardingApi } from '@/api/mockOnboardingApi';

const DEFAULT_ABOUT = "Hey there! I'm using Sealine.";
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=0F9C90&color=fff&size=100&bold=true';

export default function ProfileSetupScreen() {
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const phoneNumber = params.phoneNumber || '';
  
  const [name, setName] = useState('');
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', about: '' });

  const isValid = name.trim().length > 0 && about.trim().length > 0;

  const validate = () => {
    const newErrors = { name: '', about: '' };
    
    // Name: required, non-empty, not just spaces
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // About: required, cannot be empty
    if (!about.trim()) {
      newErrors.about = 'About is required';
    }
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.about;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      // Call mock API to create profile
      await mockOnboardingApi.createProfile({
        phoneNumber,
        name: name.trim(),
        about: about.trim(),
        photo: photo,
      });
      
      // Navigate to device handoff (ONB-1.7)
      router.push('/device-handoff');
    } catch (error: any) {
      if (error.message === 'NAME_REQUIRED') {
        setErrors(prev => ({ ...prev, name: 'Name is required' }));
      } else if (error.message === 'ABOUT_REQUIRED') {
        setErrors(prev => ({ ...prev, about: 'About is required' }));
      } else {
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAboutChange = (text: string) => {
    // If user tries to clear it completely, revert to default
    if (text.trim().length === 0 && about.trim().length === 0) {
      setAbout(DEFAULT_ABOUT);
      return;
    }
    setAbout(text);
    if (errors.about) setErrors({ ...errors, about: '' });
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Choose a source:', [
      { text: 'Take Photo', onPress: () => console.log('Camera - TODO') },
      { text: 'Choose from Gallery', onPress: () => console.log('Gallery - TODO') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>This is how you'll appear to people you message.</Text>

        <TouchableOpacity style={styles.avatarContainer} onPress={handleAddPhoto}>
          <Image
            source={{ uri: photo || DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarOverlayText}>Add photo</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Your name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            maxLength={50}
            editable={!isLoading}
            placeholderTextColor="#6B7280"
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>About <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.aboutInput, errors.about && styles.inputError]}
            placeholder="What's on your mind?"
            value={about}
            onChangeText={handleAboutChange}
            maxLength={140}
            multiline
            editable={!isLoading}
            placeholderTextColor="#6B7280"
          />
          {errors.about ? <Text style={styles.errorText}>{errors.about}</Text> : null}
          <Text style={styles.charCount}>{about.length}/140</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isValid || isLoading) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Start messaging</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15171C',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 32,
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
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA0AC',
    marginBottom: 32,
    lineHeight: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1C1F26',
    borderWidth: 1.5,
    borderColor: '#2E323C',
    borderStyle: 'dashed',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(15, 156, 144, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  avatarOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 12,
    color: '#9AA0AC',
    marginBottom: 8,
  },
  required: {
    color: '#E5484D',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2E323C',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#F3F3F4',
    backgroundColor: '#1C1F26',
  },
  inputError: {
    borderColor: '#E5484D',
  },
  aboutInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#E5484D',
    fontSize: 11.5,
    marginTop: 4,
  },
  charCount: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#0F9C90',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
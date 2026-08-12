// app/profile-setup.tsx
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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=0F9C90&color=fff&size=100&bold=true';

export default function ProfileSetupScreen() {
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const [name, setName] = useState('');
  const [about, setAbout] = useState("Hey there! I'm using Sealine.");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', about: '' });

  const isValid = name.trim().length > 0 && about.trim().length > 0;

  const validate = () => {
    const newErrors = { name: '', about: '' };
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!about.trim()) newErrors.about = 'About is required';
    setErrors(newErrors);
    return !newErrors.name && !newErrors.about;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      // TODO: Call API to create profile
      // await mockOnboardingApi.createProfile({ phoneNumber, name, about, photo });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to device handoff (ONB-1.7)
      router.push('/device-handoff');
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.label}>Name</Text>
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
          <Text style={styles.label}>About</Text>
          <TextInput
            style={[styles.input, styles.aboutInput, errors.about && styles.inputError]}
            placeholder="Hey there, I'm using Sealine"
            value={about}
            onChangeText={(text) => {
              setAbout(text);
              if (errors.about) setErrors({ ...errors, about: '' });
            }}
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
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Saving...' : 'Start messaging'}
          </Text>
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
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    fontWeight: '700',
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
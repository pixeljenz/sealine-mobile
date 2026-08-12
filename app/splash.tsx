// app/splash.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  const handleTap = () => {
    router.push('/phone-entry');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.touchable} onPress={handleTap} activeOpacity={0.8}>
        <View style={styles.content}>
          {/* Seal / Logo */}
          <View style={styles.seal}>
            <View style={styles.sealDot} />
          </View>
          
          <Text style={styles.appName}>Sealine</Text>
          <Text style={styles.hint}>tap to continue</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15171C',
  },
  touchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  seal: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#3FC6B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    position: 'relative',
  },
  sealDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3FC6B8',
  },
  appName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    fontWeight: '700',
    color: '#F3F3F4',
    letterSpacing: 0.5,
  },
  hint: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    color: '#9AA0AC',
    marginTop: 8,
  },
});
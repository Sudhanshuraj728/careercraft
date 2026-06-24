import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(glowOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradient blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }]}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🚀</Text>
        </View>
        <Text style={styles.logoText}>Career<Text style={styles.logoAccent}>Craft</Text></Text>
        <Text style={styles.tagline}>Build your dream career</Text>
      </Animated.View>

      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  blob1: {
    width: 300, height: 300,
    backgroundColor: COLORS.primary,
    top: -80, left: -80,
  },
  blob2: {
    width: 250, height: 250,
    backgroundColor: COLORS.secondary,
    bottom: -50, right: -60,
  },
  logoWrap: { alignItems: 'center' },
  glow: {
    position: 'absolute',
    width: 160, height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
    top: -20,
  },
  logoCircle: {
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 44 },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoAccent: { color: COLORS.primary },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  dots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
});

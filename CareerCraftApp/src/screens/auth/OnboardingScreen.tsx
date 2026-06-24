import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { COLORS } from '../../utils/constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🚀',
    title: 'Launch Your Career',
    subtitle: 'Upload your resume and get AI-powered analysis tailored to top companies.',
    color: COLORS.primary,
  },
  {
    emoji: '🏢',
    title: 'Explore Companies',
    subtitle: 'Browse hundreds of companies, discover open roles, and find your perfect fit.',
    color: '#FF6584',
  },
  {
    emoji: '🔗',
    title: 'Network Smarter',
    subtitle: 'Connect LinkedIn, find key people inside companies, and build your network.',
    color: COLORS.accent,
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
          listener: handleScroll,
        })}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.emojiCircle, { borderColor: item.color }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((s, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && { backgroundColor: SLIDES[activeIndex].color, width: 28 }]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: SLIDES[activeIndex].color }]}
        onPress={handleNext}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>
          {activeIndex === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skip} onPress={() => navigation.replace('Login')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center' },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.12 },
  blob1: { width: 280, height: 280, backgroundColor: COLORS.primary, top: -60, right: -80 },
  blob2: { width: 220, height: 220, backgroundColor: COLORS.secondary, bottom: 80, left: -60 },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emojiCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: 30, fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 26,
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: {
    height: 8, width: 8, borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  btn: {
    width: width - 64,
    height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  skip: { paddingVertical: 12, marginBottom: 24 },
  skipText: { color: COLORS.textMuted, fontSize: 15 },
});

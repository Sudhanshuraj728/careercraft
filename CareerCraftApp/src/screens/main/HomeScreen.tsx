import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl, Dimensions, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const { width } = Dimensions.get('window');

function ScaleButton({ onPress, children, style, activeOpacity = 0.95 }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 150,
      friction: 5,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 5,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { user, loadFromStorage } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadFromStorage();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFromStorage();
    setRefreshing(false);
  };

  const userName = user?.name || '45_10B_Sudanshu';

  // Dynamic dashboard variables hooked to database user state
  const analysesUsed = user?.analysesUsed ?? 0;
  const analysesRemaining = user?.isPremium ? 'Unlimited' : (user?.analysesRemaining ?? 10);
  const planName = user?.isPremium ? 'PREMIUM' : 'FREE PLAN';
  const usagePercentage = user?.isPremium ? 0 : Math.min(100, (analysesUsed / 10) * 100);
  const progressText = user?.isPremium
    ? '👑 Unlimited usage activated!'
    : analysesUsed >= 10
      ? '⚠️ Monthly usage full'
      : `${10 - analysesUsed} free analyses remaining`;

  return (
    <View style={styles.container}>
      {/* Background blobs for premium depth (extremely smooth, hardware-accelerated linear gradients) */}
      <LinearGradient
        colors={['rgba(108, 99, 255, 0.1)', 'transparent']}
        style={[styles.blob, { top: -80, right: -80, width: 300, height: 300 }]}
      />
      <LinearGradient
        colors={['rgba(255, 101, 132, 0.06)', 'transparent']}
        style={[styles.blob2, { bottom: 100, left: -100, width: 250, height: 250 }]}
      />

      {/* Centered Premium Subtle Logo Watermark */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.bgWatermark}
        resizeMode="contain"
      />

      {/* Top Bar Header with dark brushed metallic effect and glowing bronze CC logo */}
      <LinearGradient
        colors={['#14151C', '#0A0A0F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topBar}
      >
        <Text style={styles.topBarLogo}>CC</Text>
        <View style={styles.topBarBorder} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C5A880"
            colors={["#C5A880"]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Greeting Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username}>{userName} 👋</Text>
            </View>

            {/* Bronze Raised Circular Metallic Badge Avatar */}
            <View style={styles.avatarBorderOuter}>
              <LinearGradient
                colors={['#C5A880', '#5E4831']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarBorderInner}
              >
                <View style={styles.avatarCircle}>
                  <Text style={{ fontSize: 24 }}>🧗</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Centered Premium Quote */}
          <Text style={styles.subtitle}>"Build Your Future, One Skill at a Time"</Text>

          {/* Dashboard Overview Glass Card */}
          <View style={styles.dashboardCardWrapper}>
            <View style={styles.dashboardCard}>
              
              {/* Glass background layers */}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.005)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              
              {/* Soft colorful glowing light source behind the card (frosted glass bleed) */}
              <View style={[styles.cardInternalGlow, { backgroundColor: '#FF6584', bottom: -50, right: -50, opacity: 0.15 }]} />
              <View style={[styles.cardInternalGlow, { backgroundColor: '#00D9FF', top: -50, left: -50, opacity: 0.12 }]} />

              <Text style={styles.dashboardTitle}>Dashboard Overview</Text>

              <View style={styles.dashboardStatsRow}>
                <View>
                  <Text style={styles.statLine}>
                    Analyses Used: <Text style={styles.statHighlight}>{user?.isPremium ? `${analysesUsed} (Unlimited)` : `${analysesUsed}/10`}</Text>
                  </Text>
                  <Text style={styles.statSubLine}>
                    Credits Remaining: <Text style={styles.statHighlightSmall}>{analysesRemaining}</Text>
                  </Text>
                </View>

                {/* Plan Glass Bubble Badge */}
                <View style={styles.planBadgeContainer}>
                  <Text style={styles.planBadgeText}>{planName}</Text>
                </View>
              </View>

              {/* Progress Bar with Dark Mesh track and Glowing Gradient Border */}
              <View style={styles.progressContainer}>
                <LinearGradient
                  colors={['#FF6584', '#00D9FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGlowBorder}
                >
                  <View style={styles.progressBarTrack}>
                    <LinearGradient
                      colors={['#FF5252', '#FFA000']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${usagePercentage}%` }]}
                    />
                  </View>
                </LinearGradient>
                <Text style={styles.progressFullText}>{progressText}</Text>
              </View>
            </View>
          </View>

          {/* Tip Card Section */}
          <View style={styles.tipCardWrapper}>
            <View style={styles.tipCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.005)']}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.tipText}>
                <Text style={styles.compassIcon}>🧭</Text> Don't just apply— stand out. Craft a professional story that commands attention. 🧗
              </Text>
            </View>
          </View>

          {/* Quick Actions Grid Section */}
          <Text style={styles.sectionHeading}>Quick Actions</Text>

          <View style={styles.gridContainer}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
              {/* Card 1: Upload Resume */}
              <View style={styles.gridCardWrapper}>
                <ScaleButton onPress={() => navigation.navigate('Main', { screen: 'Resume' })}>
                  <View style={styles.gridCard}>
                    
                    {/* Glass gradient background */}
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* Radial orange glow blurred behind the card contents */}
                    <View style={[styles.cardInternalGlow, { backgroundColor: '#FFA000', top: 10, right: 10 }]} />

                    <View style={styles.cardHeader}>
                      {/* Top Left Square Badge */}
                      <View style={styles.leftSquareBadge}>
                        <Text style={styles.badgeEmoji}>🕸️</Text>
                      </View>
                      {/* Top Right 3D Illustration */}
                      <Text style={styles.right3DIllustration}>📜</Text>
                    </View>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>Upload Resume</Text>
                      <Text style={styles.cardDesc}>AI Analysis & Feedback.</Text>
                    </View>
                  </View>
                </ScaleButton>
              </View>

              {/* Card 2: Browse Companies */}
              <View style={styles.gridCardWrapper}>
                <ScaleButton onPress={() => navigation.navigate('Main', { screen: 'Companies' })}>
                  <View style={styles.gridCard}>
                    
                    {/* Glass gradient background */}
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* Radial cyan glow blurred behind the card contents */}
                    <View style={[styles.cardInternalGlow, { backgroundColor: '#00D9FF', top: 10, right: 10 }]} />

                    <View style={styles.cardHeader}>
                      {/* Top Left Square Badge */}
                      <View style={styles.leftSquareBadge}>
                        <Text style={styles.badgeEmoji}>🏢</Text>
                      </View>
                      {/* Top Right 3D Illustration */}
                      <Text style={styles.right3DIllustration}>🏙️</Text>
                    </View>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>Browse Companies</Text>
                      <Text style={styles.cardDesc}>Target tech companies.</Text>
                    </View>
                  </View>
                </ScaleButton>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
              {/* Card 3: Resume Templates */}
              <View style={styles.gridCardWrapper}>
                <ScaleButton onPress={() => navigation.navigate('Main', { screen: 'Templates' })}>
                  <View style={styles.gridCard}>
                    
                    {/* Glass gradient background */}
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* Radial pink glow blurred behind the card contents */}
                    <View style={[styles.cardInternalGlow, { backgroundColor: '#FF6584', top: 10, right: 10 }]} />

                    <View style={styles.cardHeader}>
                      {/* Top Left Square Badge */}
                      <View style={styles.leftSquareBadge}>
                        <Text style={styles.badgeEmoji}>📝</Text>
                      </View>
                      {/* Top Right 3D Illustration */}
                      <Text style={styles.right3DIllustration}>📖</Text>
                    </View>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>Resume Templates</Text>
                      <Text style={styles.cardDesc}>High-performing resume blueprints.</Text>
                    </View>
                  </View>
                </ScaleButton>
              </View>

              {/* Card 4: Network */}
              <View style={styles.gridCardWrapper}>
                <ScaleButton onPress={() => navigation.navigate('Main', { screen: 'Network' })}>
                  <View style={styles.gridCard}>
                    
                    {/* Glass gradient background */}
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* Radial gold glow blurred behind the card contents */}
                    <View style={[styles.cardInternalGlow, { backgroundColor: '#C5A880', top: 10, right: 10 }]} />

                    <View style={styles.cardHeader}>
                      {/* Top Left Square Badge */}
                      <View style={styles.leftSquareBadge}>
                        <Text style={styles.badgeEmoji}>🔗</Text>
                      </View>
                      {/* Top Right 3D Illustration */}
                      <Text style={styles.right3DIllustration}>🕸️</Text>
                    </View>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>Network</Text>
                      <Text style={styles.cardDesc}>Build strategic referrals.</Text>
                    </View>
                  </View>
                </ScaleButton>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07060A' }, // Deep black-matte matching the glassy references
  bgWatermark: {
    position: 'absolute',
    width: 340,
    height: 340,
    top: '28%',
    alignSelf: 'center',
    opacity: 0.15, // watermark logo - visible but non-intrusive
    zIndex: 0,
  },
  scrollContent: { paddingTop: 85, paddingBottom: 20 },
  blob: { position: 'absolute', borderRadius: 150 },
  blob2: { position: 'absolute', borderRadius: 125 },

  // Top Bar Header
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)', // Clean, ultra-thin border
  },
  topBarLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#C5A880', 
    letterSpacing: -1,
    textShadowColor: 'rgba(197, 168, 128, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  topBarBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },

  // Greeting Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginTop: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#8A889D',
    fontWeight: '500',
  },
  username: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#8A889D',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },

  // Bronze Avatar
  avatarBorderOuter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#07060A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#C5A880',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarBorderInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#13111E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dashboard Overview Card
  dashboardCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dashboardCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // crisp ultra-thin border
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  cardInternalGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.035, // extremely subtle low opacity solid overlay for smooth native rendering
  },
  dashboardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8A889D',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  dashboardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    zIndex: 2,
  },
  statLine: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statSubLine: {
    fontSize: 12,
    color: '#6B6882',
    marginTop: 4,
    fontWeight: '500',
  },
  statHighlightSmall: {
    color: '#FF6584',
    fontWeight: '800',
  },
  planBadgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  planBadgeText: {
    color: '#8A889D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Progress Bar
  progressContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  progressGlowBorder: {
    width: '100%',
    height: 18,
    borderRadius: 9,
    padding: 1,
    justifyContent: 'center',
  },
  progressBarTrack: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    width: '100%', 
    height: '100%',
    borderRadius: 8,
  },
  progressFullText: {
    fontSize: 11,
    color: '#555366',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '700',
  },

  // Tip Card
  tipCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  tipCard: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    position: 'relative',
  },
  tipText: {
    color: '#8A889D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 2,
  },
  compassIcon: {
    fontSize: 14,
    color: '#C5A880',
  },

  // Grid
  sectionHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 22,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  gridContainer: {
    paddingHorizontal: 14,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gridCardWrapper: {
    flex: 1,
    paddingHorizontal: 6,
  },
  gridCard: {
    height: 164,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.045)', // ultra-thin glassy card outline
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden', // clips the internal glowing spot perfectly
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  leftSquareBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 14,
  },
  right3DIllustration: {
    fontSize: 32,
    opacity: 0.95,
  },
  cardTextContainer: {
    marginTop: 8,
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 11,
    color: '#6B6882',
    marginTop: 4,
    fontWeight: '600',
    lineHeight: 14,
  },
});


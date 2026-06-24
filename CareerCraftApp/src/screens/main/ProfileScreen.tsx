import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Switch, Animated, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
  { icon: '👑', label: 'Upgrade to Premium', key: 'premium', accent: '#FFE259', desc: 'Unlock unlimited access' },
  { icon: '📄', label: 'My Resumes', key: 'resume', desc: 'Manage your uploaded resumes' },
  { icon: '🏢', label: 'Saved Companies', key: 'companies', desc: 'Review your targeted companies' },
  { icon: '🔒', label: 'Privacy & Security', key: 'privacy', desc: 'Configure auth & security' },
  { icon: '📞', label: 'Help & Support', key: 'support', desc: 'Get quick assistance' },
  { icon: '🚪', label: 'Sign Out', key: 'logout', danger: true, desc: 'Exit from your account' },
];

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

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [darkMode, setDarkMode] = useState(true);

  const handleMenuItem = (key: string) => {
    switch (key) {
      case 'premium': navigation.navigate('Subscription'); break;
      case 'resume': navigation.navigate('Main', { screen: 'Resume' }); break;
      case 'companies': navigation.navigate('Main', { screen: 'Companies' }); break;
      case 'logout':
        Alert.alert(
          'Sign Out',
          'Are you sure you want to sign out?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
          ]
        );
        break;
      default: break;
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <View style={styles.container}>
      {/* Background blobs (extremely smooth, hardware-accelerated linear gradients) */}
      <LinearGradient
        colors={['rgba(108, 99, 255, 0.1)', 'transparent']}
        style={[styles.blob, { top: -60, right: -60, width: 280, height: 280 }]}
      />
      <LinearGradient
        colors={['rgba(255, 101, 132, 0.06)', 'transparent']}
        style={[styles.blob2, { bottom: 100, left: -80, width: 200, height: 200 }]}
      />

      {/* Centered Premium Subtle Logo Watermark */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.bgWatermark}
        resizeMode="contain"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={['#C5A880', '#5E4831']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarBorder}
            >
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </LinearGradient>
            {user?.isPremium && (
              <View style={styles.crownBadge}>
                <Text style={{ fontSize: 18 }}>👑</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{user?.name || '45_10B_Sudanshu'}</Text>
          <Text style={styles.email}>{user?.email || 'sudanshu@careercraft.app'}</Text>

          <LinearGradient
            colors={user?.isPremium ? ['rgba(255, 215, 0, 0.12)', 'rgba(255, 167, 81, 0.03)'] : ['rgba(197, 168, 128, 0.15)', 'rgba(197, 168, 128, 0.03)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.planBadge, user?.isPremium && styles.planBadgePremium]}
          >
            <Text style={[styles.planText, user?.isPremium && { color: '#FFE259' }]}>
              {user?.isPremium ? '👑 Premium Member' : '🆓 Free Plan'}
            </Text>
          </LinearGradient>
        </View>

        {/* Glassmorphic Stats Row Card */}
        <View style={styles.statsRowWrapper}>
          <View style={styles.statsRow}>
            {/* Glass background */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Embedded soft rose pink radial glow blurred behind */}
            <View style={[styles.cardInternalGlow, { backgroundColor: '#FF6584', top: -30, left: -30 }]} />
            {/* Embedded soft cyan radial glow blurred behind */}
            <View style={[styles.cardInternalGlow, { backgroundColor: '#00D9FF', bottom: -30, right: -30 }]} />

            <View style={styles.statBox}>
              <Text style={styles.statNum}>{user?.analysesUsed ?? 0}</Text>
              <Text style={styles.statLabel}>Analyses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#38ef7d' }]}>
                {user?.isPremium ? '∞' : user?.analysesRemaining ?? 10}
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#C5A880' }]}>
                {user?.subscriptionPlan === 'premium' ? '30d' : 'Free'}
              </Text>
              <Text style={styles.statLabel}>Plan Type</Text>
            </View>
          </View>
        </View>

        {/* Premium CTA (Only for Free Users) */}
        {!user?.isPremium && (
          <View style={styles.premiumCtaWrapper}>
            <ScaleButton onPress={() => navigation.navigate('Subscription')}>
              <LinearGradient
                colors={['#C5A880', '#5E4831']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumCta}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumCtaTitle}>Upgrade to Premium 👑</Text>
                  <Text style={styles.premiumCtaSub}>Unlimited reviews · Expert AI insights</Text>
                </View>
                <Text style={styles.premiumCtaPrice}>₹149</Text>
              </LinearGradient>
            </ScaleButton>
          </View>
        )}

        {/* Dark mode toggle */}
        <View style={styles.section}>
          <View style={styles.glassContainer}>
            {/* Glass background */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Embedded soft blue radial glow blurred behind */}
            <View style={[styles.cardInternalGlow, { backgroundColor: '#00D9FF', top: -30, right: -30 }]} />

            <View style={styles.menuItem}>
              <View style={styles.menuIconBadge}>
                <Text style={styles.menuIcon}>🌙</Text>
              </View>
              <View style={{ flex: 1, zIndex: 2 }}>
                <Text style={styles.menuLabel}>Dark Mode</Text>
                <Text style={styles.menuDesc}>Save battery with dark styling</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#C5A880' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Menu list */}
        <View style={styles.section}>
          <View style={styles.glassContainer}>
            {/* Glass background */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Embedded soft luxury gold radial glow blurred behind */}
            <View style={[styles.cardInternalGlow, { backgroundColor: '#C5A880', bottom: -30, left: -30 }]} />

            {MENU_ITEMS.map((item, i) => (
              <ScaleButton key={item.key} onPress={() => handleMenuItem(item.key)}>
                <View style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuDivider]}>
                  <View style={[styles.menuIconBadge, item.danger && { backgroundColor: 'rgba(255, 77, 106, 0.1)', borderColor: 'rgba(255, 77, 106, 0.2)' }]}>
                    <Text style={[styles.menuIcon, item.danger && { color: '#FF4D6A' }]}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1, zIndex: 2 }}>
                    <Text style={[
                      styles.menuLabel,
                      item.danger && { color: '#FF4D6A' },
                    ]}>
                      {item.label}
                    </Text>
                    <Text style={styles.menuDesc}>{item.desc}</Text>
                  </View>
                  {!item.danger && <Text style={styles.menuArrow}>›</Text>}
                </View>
              </ScaleButton>
            ))}
          </View>
        </View>

        <Text style={styles.version}>CareerCraft v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07060A' },
  bgWatermark: {
    position: 'absolute',
    width: 340,
    height: 340,
    top: '28%',
    alignSelf: 'center',
    opacity: 0.15, // watermark logo - visible but non-intrusive
    zIndex: 0,
  },
  scrollContent: { paddingTop: 20 },
  blob: { position: 'absolute', borderRadius: 140 },
  blob2: { position: 'absolute', borderRadius: 100 },

  hero: { alignItems: 'center', paddingTop: 64, paddingBottom: 24, paddingHorizontal: 20 },
  avatarWrap: {
    position: 'relative',
    elevation: 10,
    shadowColor: '#C5A880',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E1B2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  crownBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#07060A',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  name: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginTop: 16, letterSpacing: -0.5 },
  email: { fontSize: 14, color: '#8A889D', marginTop: 4, fontWeight: '500' },
  planBadge: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  planBadgePremium: { borderColor: 'rgba(255, 215, 0, 0.2)' },
  planText: { color: '#8A889D', fontWeight: '800', fontSize: 13 },

  statsRowWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.045)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardInternalGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.035, // extremely subtle low opacity solid overlay for smooth native rendering
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 18, zIndex: 2 },
  statNum: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: '#6B6882', marginTop: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.06)', alignSelf: 'center', zIndex: 2 },

  premiumCtaWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#C5A880',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  premiumCta: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumCtaTitle: { fontSize: 17, fontWeight: '900', color: '#1E1B2E', marginBottom: 2, letterSpacing: -0.3 },
  premiumCtaSub: { fontSize: 12, color: 'rgba(30, 27, 46, 0.75)', fontWeight: '600' },
  premiumCtaPrice: { fontSize: 24, fontWeight: '900', color: '#1E1B2E', letterSpacing: -0.5 },

  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  glassContainer: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.045)',
    overflow: 'hidden',
    position: 'relative',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    zIndex: 2,
  },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.04)' },
  menuIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
  menuDesc: { fontSize: 11, color: '#6B6882', marginTop: 2, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: '#6B6882', fontWeight: '700' },

  version: { textAlign: 'center', color: '#555366', fontSize: 12, marginTop: 12, fontWeight: '600' },
});


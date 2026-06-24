import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { subscriptionAPI } from '../../api/api';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const FEATURES_FREE = [
  '10 resume analyses',
  'Basic company information',
  'Job listings access',
  'Resume templates',
];

const FEATURES_PREMIUM = [
  'Unlimited resume analyses',
  'Full company details & features',
  'LinkedIn employee insights',
  'Priority AI analysis',
  'Premium support',
  'No advertisements',
  'Advanced analytics',
];

export default function SubscriptionScreen({ navigation }: any) {
  const { user, refreshUser } = useAuthStore();
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionAPI.getPricing()
      .then(res => { if (res.data.success) setPricing(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = () => {
    // In a real app, integrate Razorpay/Stripe SDK here
    Alert.alert(
      'Coming Soon',
      'Payment integration will be added soon. For now, contact support to upgrade.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Plan</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Crown hero */}
        <View style={styles.hero}>
          <Text style={styles.crownEmoji}>👑</Text>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSub}>
            Get unlimited access to AI resume analysis, full company details, and networking tools.
          </Text>
        </View>

        {/* Free Plan */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Free Plan</Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceAmount}>₹0</Text>
              <Text style={styles.pricePer}>/mo</Text>
            </View>
          </View>
          {FEATURES_FREE.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
          {user?.subscriptionPlan !== 'premium' && (
            <View style={styles.currentBadge}><Text style={styles.currentText}>Your Current Plan</Text></View>
          )}
        </View>

        {/* Premium Plan */}
        <View style={[styles.planCard, styles.planCardPremium]}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>⚡ MOST POPULAR</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: COLORS.gold }]}>Premium Plan 👑</Text>
            <View style={styles.priceBadge}>
              <Text style={[styles.priceAmount, { color: COLORS.gold }]}>₹149</Text>
              <Text style={styles.pricePer}>/mo</Text>
            </View>
          </View>
          {FEATURES_PREMIUM.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={[styles.featureCheck, { color: COLORS.gold }]}>✦</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
          {user?.isPremium ? (
            <View style={[styles.currentBadge, { backgroundColor: COLORS.gold + '22' }]}>
              <Text style={[styles.currentText, { color: COLORS.gold }]}>✓ Active Plan</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} activeOpacity={0.85}>
              <Text style={styles.upgradeBtnText}>Upgrade Now →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comparison note */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            🔒 Secure payment · Cancel anytime · Instant activation
          </Text>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked</Text>
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time.' },
            { q: 'What happens to my data?', a: 'Your data stays safe regardless of your plan.' },
            { q: 'How many analyses in Premium?', a: 'Unlimited! Analyze as many resumes as you want.' },
          ].map(({ q, a }, i) => (
            <View key={i} style={styles.faqItem}>
              <Text style={styles.faqQ}>{q}</Text>
              <Text style={styles.faqA}>{a}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: { paddingVertical: 8 },
  backText: { color: COLORS.primary, fontSize: 18, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  hero: { alignItems: 'center', padding: 24, paddingTop: 16 },
  crownEmoji: { fontSize: 56, marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 10 },
  heroSub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },

  planCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.card, borderRadius: 22,
    padding: 22, borderWidth: 1, borderColor: COLORS.border,
  },
  planCardPremium: {
    borderColor: COLORS.gold + '66',
    backgroundColor: COLORS.gold + '08',
  },
  popularBadge: {
    backgroundColor: COLORS.gold, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  popularText: { color: '#000', fontWeight: '800', fontSize: 11 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  planName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  priceBadge: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  priceAmount: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  pricePer: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },

  featureRow: { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  featureCheck: { color: COLORS.success, fontWeight: '700', fontSize: 15, width: 20 },
  featureText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 22 },

  currentBadge: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', marginTop: 16,
  },
  currentText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },

  upgradeBtn: {
    backgroundColor: COLORS.gold, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 20,
  },
  upgradeBtnText: { color: '#000', fontSize: 18, fontWeight: '800' },

  note: { marginHorizontal: 20, marginBottom: 24, alignItems: 'center' },
  noteText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },

  faqSection: { marginHorizontal: 20 },
  faqTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  faqItem: {
    backgroundColor: COLORS.card, borderRadius: 14,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  faqQ: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  faqA: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
});

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Linking, StyleSheet as RNStyleSheet, Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import client from '../../api/client';
import { companiesAPI } from '../../api/api';
import { COLORS, BASE_URL } from '../../utils/constants';

export default function NetworkScreen({ navigation }: any) {
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkedinChecked, setLinkedinChecked] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    checkLinkedIn();
    loadCompanies();
  }, []);

  const checkLinkedIn = async () => {
    try {
      const res = await client.get('/api/linkedin/status');
      setLinkedinConnected(res.data.connected);
    } catch {}
    setLinkedinChecked(true);
  };

  const loadCompanies = async () => {
    try {
      const res = await companiesAPI.getAll(1, 50);
      if (res.data.success) setCompanies(res.data.data);
    } catch {}
  };

  const searchEmployees = async (companyName: string) => {
    if (!companyName.trim()) return;
    setLoading(true);
    setEmployees([]);
    setSuggestions([]);
    try {
      const res = await client.get(`/api/linkedin/company-employees/${encodeURIComponent(companyName)}`);
      if (res.data.success && res.data.data) {
        setEmployees(res.data.data);
      } else if (res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.suggestions) setSuggestions(data.suggestions);
    }
    setLoading(false);
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Background blobs (extremely smooth, hardware-accelerated linear gradients) */}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Network</Text>
          <Text style={styles.subtitle}>Find key people at target companies</Text>
        </View>

        {/* LinkedIn Status Card */}
        <View style={[styles.card, linkedinConnected && styles.cardConnected]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Embedded soft gold/bronze radial glow blurred behind */}
          <View style={[styles.cardInternalGlow, { backgroundColor: '#C5A880' }]} />

          <View style={styles.cardRow}>
            <View style={[styles.liIcon, linkedinConnected && { backgroundColor: '#0077B5' }]}>
              <Text style={styles.liIconText}>in</Text>
            </View>
            <View style={{ flex: 1, zIndex: 2 }}>
              <Text style={styles.liTitle}>
                {linkedinConnected ? 'LinkedIn Connected ✓' : 'Connect LinkedIn'}
              </Text>
              <Text style={styles.liSubtitle}>
                {linkedinConnected
                  ? 'You can search for employees at any company.'
                  : 'Link your LinkedIn to unlock employee insights.'}
              </Text>
            </View>
          </View>
          {!linkedinConnected && (
            <TouchableOpacity
              style={styles.connectBtn}
              onPress={() => Linking.openURL(`${BASE_URL}/auth/linkedin`)}
            >
              <Text style={styles.connectBtnText}>Connect LinkedIn →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Company Search Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Embedded soft blue radial glow blurred behind */}
          <View style={[styles.cardInternalGlow, { backgroundColor: '#00D9FF' }]} />

          <Text style={styles.sectionTitle}>Search Employees by Company</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Type company name..."
            placeholderTextColor="#6B6882"
            value={companySearch}
            onChangeText={setCompanySearch}
          />

          {/* Company suggestions */}
          {companySearch.length > 0 && filteredCompanies.length > 0 && employees.length === 0 && (
            <View style={styles.suggestions}>
              {filteredCompanies.slice(0, 5).map((c) => (
                <TouchableOpacity
                  key={c.slug}
                  style={styles.suggestionRow}
                  onPress={() => {
                    setCompanySearch(c.name);
                    searchEmployees(c.name);
                  }}
                >
                  <Text style={styles.suggestionText}>🏢 {c.name}</Text>
                  <Text style={styles.suggestionIndustry}>{c.industry}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => searchEmployees(companySearch)}
            disabled={loading || !companySearch.trim()}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>🔍 Find Employees</Text>}
          </TouchableOpacity>
        </View>

        {/* Employees list */}
        {employees.length > 0 && (
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Embedded soft pink radial glow blurred behind */}
            <View style={[styles.cardInternalGlow, { backgroundColor: '#FF6584' }]} />

            <Text style={styles.sectionTitle}>Employees Found ({employees.length})</Text>
            {employees.map((emp, i) => (
              <View key={i} style={styles.employeeCard}>
                <View style={styles.empAvatar}>
                  <Text style={styles.empAvatarText}>{emp.name?.[0] || '?'}</Text>
                </View>
                <View style={{ flex: 1, zIndex: 2 }}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empTitle}>{emp.title || emp.headline}</Text>
                </View>
                {emp.profileUrl && (
                  <TouchableOpacity onPress={() => Linking.openURL(emp.profileUrl)}>
                    <Text style={styles.viewBtn}>View →</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.cardInternalGlow, { backgroundColor: '#C5A880' }]} />

            <Text style={styles.sectionTitle}>💡 Networking Tips</Text>
            {suggestions.map((s: string, i: number) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipText}>• {s}</Text>
              </View>
            ))}
          </View>
        )}

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
  blob: { position: 'absolute', borderRadius: 150 },
  blob2: { position: 'absolute', borderRadius: 125 },

  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: '#8A889D', marginTop: 4, fontWeight: '500' },

  card: {
    marginHorizontal: 20, 
    marginBottom: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.045)',
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardConnected: { borderColor: 'rgba(0, 119, 181, 0.3)' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, zIndex: 2 },
  cardInternalGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.035, // extremely subtle low opacity solid overlay for smooth native rendering
    top: -20,
    right: -20,
  },
  liIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  liIconText: { color: '#0077B5', fontWeight: '900', fontSize: 18 },
  liTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  liSubtitle: { fontSize: 13, color: '#8A889D', marginTop: 4, fontWeight: '500' },
  connectBtn: {
    backgroundColor: '#0077B5', borderRadius: 14,
    paddingVertical: 12, alignItems: 'center',
    marginTop: 6, zIndex: 2,
  },
  connectBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  section: {
    marginHorizontal: 20, 
    marginBottom: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.045)',
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 14, zIndex: 2 },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
    borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: '#FFFFFF',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', 
    marginBottom: 12,
    zIndex: 2,
  },
  suggestions: { marginBottom: 12, zIndex: 2 },
  suggestionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 4,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  suggestionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  suggestionIndustry: { color: '#8A889D', fontSize: 12 },
  searchBtn: {
    backgroundColor: '#C5A880', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    zIndex: 2,
  },
  searchBtnText: { color: '#1E1B2E', fontWeight: '800', fontSize: 16 },

  employeeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    zIndex: 2,
  },
  empAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(197, 168, 128, 0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(197, 168, 128, 0.2)',
  },
  empAvatarText: { color: '#C5A880', fontWeight: '800', fontSize: 16 },
  empName: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  empTitle: { fontSize: 12, color: '#8A889D', marginTop: 2 },
  viewBtn: { color: '#C5A880', fontWeight: '700', fontSize: 14, zIndex: 2 },

  tipRow: { paddingVertical: 6, zIndex: 2 },
  tipText: { color: '#8A889D', fontSize: 13, lineHeight: 22, fontWeight: '500' },
});


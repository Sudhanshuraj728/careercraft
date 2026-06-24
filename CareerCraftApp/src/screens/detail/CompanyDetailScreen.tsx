import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { companiesAPI } from '../../api/api';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';

export default function CompanyDetailScreen({ route, navigation }: any) {
  const { slug, name } = route.params;
  const { user } = useAuthStore();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs'>('overview');

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [companyRes, jobsRes] = await Promise.all([
        companiesAPI.getBySlug(slug),
        companiesAPI.getJobs(slug),
      ]);
      if (companyRes.data.success) setCompany(companyRes.data.data);
      if (jobsRes.data.success) setJobs(jobsRes.data.data.jobs || []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load company details.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading company...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.analyzeBtn}
          onPress={() => navigation.navigate('Main', { 
            screen: 'Resume', 
            params: { company: { name: company?.name || name, slug, industry: company?.industry || 'Technology' } } 
          })}
        >
          <Text style={styles.analyzeBtnText}>Analyze →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoBox}><Text style={{ fontSize: 36 }}>🏢</Text></View>
          <Text style={styles.companyName}>{company?.name || name}</Text>
          <Text style={styles.companyIndustry}>{company?.industry}</Text>
          <View style={styles.metaRow}>
            {company?.location && <View style={styles.metaTag}><Text style={styles.metaText}>📍 {company.location}</Text></View>}
            {company?.size && <View style={styles.metaTag}><Text style={styles.metaText}>👥 {company.size}</Text></View>}
          </View>
        </View>

        {/* Premium lock */}
        {company?.premiumLocked && (
          <View style={styles.lockCard}>
            <Text style={styles.lockEmoji}>🔒</Text>
            <Text style={styles.lockTitle}>Premium Content</Text>
            <Text style={styles.lockText}>{company.upgradeMessage}</Text>
            <TouchableOpacity
              style={styles.lockBtn}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.lockBtnText}>Upgrade to Premium 👑</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['overview', 'jobs'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'overview' ? '📋 Overview' : `💼 Jobs (${jobs.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <View style={styles.section}>
            {company?.domain && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🌐 Website</Text>
                <Text style={styles.infoValue}>{company.domain}</Text>
              </View>
            )}
            {company?.features && company.features.length > 0 && (
              <>
                <Text style={styles.subTitle}>Why Work Here</Text>
                {company.features.map((f: string, i: number) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.featureDot}>✦</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {activeTab === 'jobs' && (
          <View style={styles.section}>
            {jobs.length === 0 ? (
              <Text style={styles.emptyText}>No open positions listed.</Text>
            ) : (
              jobs.map((job: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={styles.jobCard}
                  onPress={() => navigation.navigate('JobDetail', { job, company: { name: company?.name, slug } })}
                  activeOpacity={0.85}
                >
                  <View style={styles.jobLeft}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobMeta}>{job.location} · {job.type || 'Full-time'}</Text>
                    {job.salary && <Text style={styles.jobSalary}>💰 {job.salary}</Text>}
                  </View>
                  <Text style={styles.jobArrow}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8,
  },
  backBtn: { paddingVertical: 8 },
  backText: { color: COLORS.primary, fontSize: 18, fontWeight: '600' },
  analyzeBtn: {
    backgroundColor: COLORS.primary, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  analyzeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  hero: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  logoBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  companyName: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  companyIndustry: { fontSize: 15, color: COLORS.textSecondary, marginTop: 6 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  metaTag: { backgroundColor: COLORS.surfaceElevated, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  metaText: { fontSize: 13, color: COLORS.textMuted },

  lockCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: COLORS.card, borderRadius: 20,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  lockEmoji: { fontSize: 36, marginBottom: 12 },
  lockTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  lockText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  lockBtn: { backgroundColor: COLORS.gold, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  lockBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },

  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: COLORS.card, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  section: { marginHorizontal: 20 },
  subTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  featureRow: { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  featureDot: { color: COLORS.primary, marginTop: 2 },
  featureText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 22 },
  emptyText: { color: COLORS.textMuted, fontSize: 15, textAlign: 'center', marginTop: 20 },

  jobCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  jobLeft: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  jobMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  jobSalary: { fontSize: 13, color: COLORS.accent, marginTop: 4, fontWeight: '600' },
  jobArrow: { fontSize: 22, color: COLORS.textMuted },
});

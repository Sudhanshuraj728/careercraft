import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { COLORS } from '../../utils/constants';

export default function JobDetailScreen({ route, navigation }: any) {
  const { job, company } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.companyBadge}>
            <Text style={styles.companyBadgeText}>🏢 {company?.name}</Text>
          </View>
          <Text style={styles.jobTitle}>{job?.title}</Text>

          <View style={styles.metaRow}>
            {job?.location && (
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>📍 {job.location}</Text>
              </View>
            )}
            {job?.type && (
              <View style={[styles.metaChip, { backgroundColor: COLORS.primary + '22' }]}>
                <Text style={[styles.metaText, { color: COLORS.primary }]}>⏱ {job.type}</Text>
              </View>
            )}
            {job?.salary && (
              <View style={[styles.metaChip, { backgroundColor: COLORS.accent + '22' }]}>
                <Text style={[styles.metaText, { color: COLORS.accent }]}>💰 {job.salary}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {job?.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Job Description</Text>
            <Text style={styles.descText}>{job.description}</Text>
          </View>
        )}

        {/* Requirements */}
        {job?.requirements && job.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Requirements</Text>
            {job.requirements.map((r: string, i: number) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{r}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {job?.skills && job.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛠 Skills</Text>
            <View style={styles.chips}>
              {job.skills.map((s: string, i: number) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CTAs */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => job?.applyUrl ? Linking.openURL(job.applyUrl) : null}
          >
            <Text style={styles.applyBtnText}>Apply Now →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.analyzeBtn}
            onPress={() => navigation.navigate('Main', { 
              screen: 'Resume', 
              params: { 
                company: { name: company?.name, slug: company?.slug || company?.name?.toLowerCase() },
                jobRole: job?.title
              } 
            })}
          >
            <Text style={styles.analyzeBtnText}>📄 Analyze Resume for this Job</Text>
          </TouchableOpacity>
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

  hero: { padding: 20, paddingTop: 8 },
  companyBadge: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  companyBadgeText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  jobTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, lineHeight: 32, marginBottom: 16 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  metaText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },

  section: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.card, borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  descText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 24 },
  bullet: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bulletDot: { color: COLORS.primary, fontSize: 16, marginTop: 1 },
  bulletText: { flex: 1, color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: COLORS.primary + '22', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  chipText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  actions: { marginHorizontal: 20, gap: 12 },
  applyBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  analyzeBtn: {
    backgroundColor: COLORS.card, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.primary,
  },
  analyzeBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
});

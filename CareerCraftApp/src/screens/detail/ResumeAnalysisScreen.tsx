import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { COLORS } from '../../utils/constants';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.warning : COLORS.error;
  return (
    <View style={styles.scoreWrap}>
      <View style={[styles.scoreRing, { borderColor: color }]}>
        <Text style={[styles.scoreNum, { color }]}>{score}</Text>
        <Text style={styles.scoreLabel}>/100</Text>
      </View>
      <Text style={[styles.scoreGrade, { color }]}>
        {score >= 75 ? '🌟 Excellent' : score >= 50 ? '✅ Good' : '⚠️ Needs Work'}
      </Text>
    </View>
  );
}

function Section({ title, items, color, icon }: { title: string; items: any[]; color: string; icon: string }) {
  const [expanded, setExpanded] = useState(true);
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionIcon, { backgroundColor: color + '22' }]}>
            <Text>{icon}</Text>
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={{ color: COLORS.textMuted }}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && items.map((item, i) => {
        const isObj = typeof item === 'object' && item !== null;
        if (isObj) {
          return (
            <View key={i} style={styles.bulletCard}>
              <View style={styles.bulletCardHeader}>
                <Text style={styles.bulletCardCategory}>{item.category || 'Improvement'}</Text>
                {item.priority && (
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: item.priority.toLowerCase() === 'high' ? COLORS.error + '22' : item.priority.toLowerCase() === 'medium' ? COLORS.warning + '22' : COLORS.primary + '22' }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: item.priority.toLowerCase() === 'high' ? COLORS.error : item.priority.toLowerCase() === 'medium' ? COLORS.warning : COLORS.primary }
                    ]}>{item.priority.toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.bulletCardIssue}>{item.issue || JSON.stringify(item)}</Text>
              {item.suggestion && (
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionLabel}>💡 Suggestion:</Text>
                  <Text style={styles.suggestionText}>{item.suggestion}</Text>
                </View>
              )}
            </View>
          );
        }

        return (
          <View key={i} style={styles.bullet}>
            <View style={[styles.bulletDot, { backgroundColor: color }]} />
            <Text style={styles.bulletText}>{String(item)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ResumeAnalysisScreen({ route, navigation }: any) {
  const { analysis, atsAnalysis, company, subscription } = route.params;

  const overallScore = analysis?.overallScore ?? atsAnalysis?.atsScore ?? 0;
  const sections = analysis?.sections || {};
  // Backend returns `suggestedImprovements` (Gemini) — map to `suggestions`
  const suggestions = analysis?.suggestions || analysis?.suggestedImprovements || analysis?.companySpecific?.map((c: any) => `${c.point}: ${c.reason}`) || [];
  const strengths = analysis?.strengths || [];
  const improvements = analysis?.improvements || analysis?.currentIssues || [];
  // Backend returns `keywordSuggestions` — map to `keywords`
  const keywords = analysis?.keywords || analysis?.keywordSuggestions || sections?.skills?.technicalSkills || [];
  // Backend returns `sections.skills.missingRelevantSkills` — map to `missingKeywords`
  const missingKeywords = analysis?.missingKeywords || sections?.skills?.missingRelevantSkills || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Company target */}
        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>Analyzed for</Text>
          <Text style={styles.targetName}>{company?.name}</Text>
          <Text style={styles.targetIndustry}>{company?.industry}</Text>
        </View>

        {/* Score */}
        <ScoreRing score={overallScore} />

        {/* AI Summary Recommendation */}
        {analysis?.summaryRecommendation && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>💡</Text>
            <Text style={styles.summaryText}>{analysis.summaryRecommendation}</Text>
          </View>
        )}

        {/* ATS Score */}
        {atsAnalysis?.atsScore !== undefined && atsAnalysis.atsScore !== overallScore && (
          <View style={styles.atsCard}>
            <Text style={styles.atsTitle}>🤖 ATS Compatibility Score</Text>
            <View style={styles.atsScoreRow}>
              <View style={styles.atsScoreBar}>
                <View style={[styles.atsScoreFill, {
                  width: `${atsAnalysis.atsScore}%`,
                  backgroundColor: atsAnalysis.atsScore >= 70 ? COLORS.success : atsAnalysis.atsScore >= 50 ? COLORS.warning : COLORS.error,
                }]} />
              </View>
              <Text style={styles.atsScoreNum}>{atsAnalysis.atsScore}%</Text>
            </View>
          </View>
        )}

        {/* Subscription remaining */}
        {subscription && (
          <View style={styles.quotaCard}>
            <Text style={styles.quotaText}>
              {subscription.plan === 'premium'
                ? '👑 Premium: Unlimited analyses'
                : `📊 ${subscription.remaining} of ${subscription.analysesLimit} analyses remaining`}
            </Text>
          </View>
        )}

        {/* Strengths */}
        <Section title="Strengths" items={strengths} color={COLORS.success} icon="✦" />

        {/* Improvements */}
        <Section title="Areas to Improve" items={improvements} color={COLORS.warning} icon="⚡" />

        {/* Suggestions */}
        <Section title="Action Items" items={suggestions} color={COLORS.primary} icon="🎯" />

        {/* Keywords */}
        {(keywords.length > 0 || missingKeywords.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIcon, { backgroundColor: COLORS.primary + '22' }]}>
                <Text>🏷️</Text>
              </View>
              <Text style={styles.sectionTitle}>Keywords</Text>
            </View>
            {keywords.length > 0 && (
              <>
                <Text style={styles.kwSubtitle}>✅ Present</Text>
                <View style={styles.chips}>
                  {keywords.map((kw: string, i: number) => (
                    <View key={i} style={[styles.chip, styles.chipGood]}>
                      <Text style={[styles.chipText, { color: COLORS.success }]}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            {missingKeywords.length > 0 && (
              <>
                <Text style={[styles.kwSubtitle, { color: COLORS.error }]}>❌ Missing</Text>
                <View style={styles.chips}>
                  {missingKeywords.map((kw: string, i: number) => (
                    <View key={i} style={[styles.chip, styles.chipBad]}>
                      <Text style={[styles.chipText, { color: COLORS.error }]}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* ATS Issues */}
        {atsAnalysis?.currentIssues?.length > 0 && (
          <Section title="ATS Issues Found" items={atsAnalysis.currentIssues} color={COLORS.error} icon="⚠️" />
        )}
        {atsAnalysis?.suggestedImprovements?.length > 0 && (
          <Section title="ATS Fixes" items={atsAnalysis.suggestedImprovements} color={COLORS.accent} icon="🛠️" />
        )}

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Main', { screen: 'Companies' })}>
          <Text style={styles.ctaText}>🏢 Browse Matching Companies</Text>
        </TouchableOpacity>
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

  targetCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  targetLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  targetName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  targetIndustry: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },

  scoreWrap: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  scoreRing: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 8, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, backgroundColor: COLORS.card,
  },
  scoreNum: { fontSize: 40, fontWeight: '900' },
  scoreLabel: { fontSize: 14, color: COLORS.textMuted, marginTop: -4 },
  scoreGrade: { fontSize: 18, fontWeight: '700' },

  summaryCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  summaryIcon: { fontSize: 20, marginTop: 1 },
  summaryText: { flex: 1, color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },

  atsCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  atsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  atsScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  atsScoreBar: {
    flex: 1, height: 10, backgroundColor: COLORS.border,
    borderRadius: 5, overflow: 'hidden',
  },
  atsScoreFill: { height: 10, borderRadius: 5 },
  atsScoreNum: { fontSize: 16, fontWeight: '700', color: COLORS.text, width: 40, textAlign: 'right' },

  quotaCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.primary + '15', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: COLORS.primary + '33',
  },
  quotaText: { color: COLORS.primary, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  section: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.card, borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  bullet: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  bulletDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  bulletText: { flex: 1, color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },

  kwSubtitle: { fontSize: 13, fontWeight: '600', color: COLORS.success, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  chipGood: { backgroundColor: COLORS.success + '22' },
  chipBad: { backgroundColor: COLORS.error + '22' },
  chipText: { fontSize: 13, fontWeight: '600' },

  cta: {
    marginHorizontal: 20, marginTop: 8,
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bulletCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bulletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bulletCardCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bulletCardIssue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  suggestionBox: {
    backgroundColor: COLORS.background + '88',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Dimensions, Animated, Modal, ScrollView, Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { templatesAPI } from '../../api/api';

const { width, height } = Dimensions.get('window');

const ROLES = ['All', 'Data Analyst', 'Software Developer', 'Marketing', 'Designer'];

const TEMPLATE_THEMES: Record<string, { gradient: string[]; mockupHeader: string[] }> = {
  'data-pro': { gradient: ['#1e3a5f', '#2d5a8a'], mockupHeader: ['#00c6ff', '#0072ff'] },
  'analytics-expert': { gradient: ['#1a3a2e', '#2d5a44'], mockupHeader: ['#56ab2f', '#a8ff78'] },
  'dev-portfolio': { gradient: ['#2e1a3a', '#442d5a'], mockupHeader: ['#903ab1', '#f580ff'] },
  'marketing-maven': { gradient: ['#3a2e1a', '#5a442d'], mockupHeader: ['#f857a6', '#ff5858'] },
  'design-studio': { gradient: ['#1a3a3a', '#2d5a5a'], mockupHeader: ['#11998e', '#38ef7d'] },
  'bi-specialist': { gradient: ['#1f1f2e', '#3b3b5c'], mockupHeader: ['#4e54c8', '#8f94fb'] },
};

// Realistic mock details representing HTML templates content
const TEMPLATE_CONTENT: Record<string, {
  name: string;
  contact: string;
  summary: string;
  experience: { role: string; company: string; duration: string; bullet: string }[];
  skills: string[];
}> = {
  'data-pro': {
    name: 'Alex Rivera',
    contact: 'alex.rivera@example.com | +1 555-0199 | Austin, TX',
    summary: 'Highly analytical and detail-oriented Data Analyst with 4+ years of experience transforming complex structured and unstructured datasets into actionable business intelligence. Proven track record of developing automated SQL pipelines and Python models to drive continuous growth.',
    experience: [
      { role: 'Senior Data Analyst', company: 'Quantum Tech Inc', duration: '2023 - Present', bullet: 'Engineered robust SQL and ETL pipelines reducing daily data latency by 35% and automated standard dashboards for executive stakeholders.' },
      { role: 'Junior Data Analyst', company: 'Apex Consulting', duration: '2021 - 2023', bullet: 'Collaborated with marketing stakeholders to run statistical A/B testing models on landing pages, improving overall conversions by 14%.' }
    ],
    skills: ['SQL (PostgreSQL)', 'Python (Pandas, NumPy)', 'Tableau', 'Power BI', 'Excel Formulas', 'ETL Pipelines', 'A/B Testing']
  },
  'analytics-expert': {
    name: 'Sarah Chen',
    contact: 'sarah.chen@example.com | +1 555-0245 | Seattle, WA',
    summary: 'Business Intelligence and Data Specialist focused on predictive analytics, statistical modeling, and interactive storytelling. Passionate about empowering engineering and product leaders with clear quantitative narratives.',
    experience: [
      { role: 'Analytics Lead', company: 'DataMetrics Corp', duration: '2022 - Present', bullet: 'Designed core company forecasting models using time-series analysis, predicting quarterly revenue changes with 98% accuracy.' }
    ],
    skills: ['R Programming', 'Python', 'Tableau Desktop', 'Statistical Modeling', 'Predictive Analysis', 'Excel VBA']
  },
  'dev-portfolio': {
    name: 'Jordan Miller',
    contact: 'jordan.m@example.com | +1 555-8833 | San Francisco, CA',
    summary: 'Passionate and engineering-focused Full Stack Developer with expert knowledge in building responsive, high-performance web and mobile products. Skilled in modern JavaScript frameworks, cloud computing architectures, and clean-code design systems.',
    experience: [
      { role: 'Senior Full Stack Engineer', company: 'AppLabs Software', duration: '2022 - Present', bullet: 'Led a squad of 4 developers to build a high-scale React Native e-commerce app, boosting client conversion rates by 42% on Android & iOS.' },
      { role: 'Software Engineer', company: 'SaaSFlow Solutions', duration: '2020 - 2022', bullet: 'Maintained and migrated serverless Node.js REST APIs to AWS Lambda, optimizing system database queries and reducing server costs by 30%.' }
    ],
    skills: ['React Native', 'React.js', 'TypeScript', 'Node.js (Express)', 'AWS Services', 'Docker', 'MongoDB & PostgreSQL']
  },
  'marketing-maven': {
    name: 'Emily Watson',
    contact: 'emily.w@example.com | +1 555-0142 | New York, NY',
    summary: 'Strategic and results-driven Growth Marketing Specialist with a history of scaling brand visibility across multiple digital channels. Expertise in Google Analytics, search engine optimization (SEO), and targeted social media PPC campaigns.',
    experience: [
      { role: 'Growth Marketer', company: 'BrandBoost Digital', duration: '2023 - Present', bullet: 'Orchestrated multi-channel SEO and Google Ads strategies that grew organic website traffic by 120% within 8 months.' }
    ],
    skills: ['Google SEO & SEM', 'Google Analytics (GA4)', 'Content Strategy', 'Social Media PPC', 'A/B Testing', 'Copywriting', 'HubSpot']
  },
  'design-studio': {
    name: 'Leo Hayes',
    contact: 'leo.design@example.com | +1 555-0922 | Brooklyn, NY',
    summary: 'User-centric Product and UI/UX Designer dedicated to wireframing and prototyping interactive, aesthetically elevated interfaces. Skilled at translating complex user requirements into elegant, accessible user flows.',
    experience: [
      { role: 'Product Designer', company: 'DesignCo Labs', duration: '2022 - Present', bullet: 'Spearheaded design sprint workshops and created a unified internal Figma design system that accelerated design-to-dev velocity by 50%.' }
    ],
    skills: ['Figma UI/UX', 'Wireframing & Prototyping', 'Design Systems', 'Interactive Prototypes', 'User Research', 'Adobe Creative Suite']
  },
  'bi-specialist': {
    name: 'Marcus Vance',
    contact: 'marcus.v@example.com | +1 555-0988 | Chicago, IL',
    summary: 'BI Specialist focused on crafting automated, corporate-level data reporting structures. Expert in modeling data warehousing schemas and implementing robust dashboards for operational visibility.',
    experience: [
      { role: 'BI & ETL Architect', company: 'Enterprise Analytics', duration: '2022 - Present', bullet: 'Modeled complete star-schema database architecture in SQL Server and managed automated ETL data pipelines.' }
    ],
    skills: ['Power BI', 'DAX & M Query', 'SQL Server Integration (SSIS)', 'Data Warehousing', 'Data Modeling', 'ETL Architecture']
  }
};

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

export default function TemplatesScreen() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('All');
  
  // Interactive Layout Preview States
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const roleFilter = activeRole !== 'All' ? activeRole : undefined;
      const res = await templatesAPI.getAll(roleFilter);
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, [activeRole]);

  const handleDownload = (template: any) => {
    Alert.alert(
      'Download Success ✓',
      `"${template.title}" has been successfully downloaded to your device.\n\nWould you like to open and preview the layout right now?`,
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Open Layout',
          onPress: () => {
            setSelectedTemplate(template);
            setPreviewVisible(true);
          },
        },
      ]
    );
  };

  const renderTemplate = ({ item }: { item: any }) => {
    const theme = TEMPLATE_THEMES[item.id] || { gradient: ['#1a1a2e', '#2d2d44'], mockupHeader: ['#6C63FF', '#FF6584'] };
    
    return (
      <View style={styles.cardWrapper}>
        <ScaleButton onPress={() => handleDownload(item)}>
          <View style={styles.card}>
            {/* Glass gradient background */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Embedded dynamic colorful glow blurred behind the card contents */}
            <View style={[styles.cardInternalGlow, { backgroundColor: theme.mockupHeader[0], bottom: -20, right: -20 }]} />

            {/* Beautiful visual mockup matching the HTML version in style.css */}
            <LinearGradient
              colors={theme.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.previewContainer}
            >
              <View style={styles.mockupHeader}>
                <LinearGradient
                  colors={theme.mockupHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.mockupTitleBar}
                />
                <View style={[styles.mockupLine, styles.mockupLineShort]} />
              </View>
              <View style={styles.mockupBody}>
                <View style={styles.mockupSection} />
                <View style={styles.mockupLine} />
                <View style={styles.mockupLine} />
              </View>
              <View style={styles.templateBadge}>
                <Text style={styles.templateBadgeText}>{item.role}</Text>
              </View>
            </LinearGradient>

            {/* Template Info details */}
            <View style={styles.cardDetails}>
              <Text style={styles.templateTitle}>{item.title}</Text>
              <Text style={styles.templateRoleSub}>{item.role} Specialist</Text>
              
              <View style={styles.tagList}>
                {item.tags.map((t: string) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>

              <LinearGradient
                colors={['#6C63FF', '#FF6584']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.downloadBtn}
              >
                <Text style={styles.downloadBtnText}>📥 Download & Open</Text>
              </LinearGradient>
            </View>
          </View>
        </ScaleButton>
      </View>
    );
  };

  const previewData = selectedTemplate ? TEMPLATE_CONTENT[selectedTemplate.id] : null;

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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Resume Templates</Text>
        <Text style={styles.subtitle}>Select a high-performing professional template</Text>
      </View>

      {/* Category/Role Filter Selector */}
      <View style={{ height: 48, marginBottom: 14 }}>
        <FlatList
          horizontal
          data={ROLES}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          renderItem={({ item }) => {
            const isActive = activeRole === item;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveRole(item)}
                style={styles.filterChipWrapper}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#6C63FF', '#FF6584']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.filterChipActive}
                  >
                    <Text style={styles.filterChipTextActive}>{item}</Text>
                  </LinearGradient>
                ) : (
                  <LinearGradient
                    colors={['rgba(30, 27, 46, 0.7)', 'rgba(18, 16, 30, 0.7)']}
                    style={styles.filterChip}
                  >
                    <Text style={styles.filterChipText}>{item}</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading templates...</Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(i) => i.id}
          renderItem={renderTemplate}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        />
      )}

      {/* Full-Screen Interactive Layout Preview Overlay Modal */}
      {selectedTemplate && previewData && (
        <Modal
          visible={previewVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View style={styles.modalBg}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['rgba(30, 27, 46, 0.98)', 'rgba(15, 14, 26, 0.98)']}
                style={styles.modalContent}
              >
                {/* Modal Header */}
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalHeadline}>Resume Preview</Text>
                    <Text style={styles.modalSubhead}>{selectedTemplate.title}</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setPreviewVisible(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Simulated High-Fidelity Resume Document */}
                <ScrollView showsVerticalScrollIndicator={false} style={styles.resumePaper}>
                  <View style={styles.resumeHeader}>
                    <Text style={styles.resumeName}>{previewData.name}</Text>
                    <Text style={styles.resumeContact}>{previewData.contact}</Text>
                  </View>

                  <View style={styles.resumeSection}>
                    <Text style={styles.resumeSectionTitle}>Professional Summary</Text>
                    <View style={styles.resumeSectionDivider} />
                    <Text style={styles.resumeText}>{previewData.summary}</Text>
                  </View>

                  <View style={styles.resumeSection}>
                    <Text style={styles.resumeSectionTitle}>Work Experience</Text>
                    <View style={styles.resumeSectionDivider} />
                    {previewData.experience.map((exp, index) => (
                      <View key={index} style={styles.experienceBlock}>
                        <View style={styles.expHeader}>
                          <Text style={styles.expRole}>{exp.role}</Text>
                          <Text style={styles.expDuration}>{exp.duration}</Text>
                        </View>
                        <Text style={styles.expCompany}>{exp.company}</Text>
                        <Text style={styles.expBullet}>• {exp.bullet}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.resumeSection}>
                    <Text style={styles.resumeSectionTitle}>Technical Skills & Core Competencies</Text>
                    <View style={styles.resumeSectionDivider} />
                    <View style={styles.resumeSkillsGrid}>
                      {previewData.skills.map((skill) => (
                        <View key={skill} style={styles.resumeSkillChip}>
                          <Text style={styles.resumeSkillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* Footer action buttons */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPreviewVisible(false)}
                    style={styles.footerCancelBtn}
                  >
                    <Text style={styles.footerCancelText}>Close Preview</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setPreviewVisible(false);
                      Alert.alert('Perfect Choice ✨', `"${selectedTemplate.title}" is ready. You can now import your contact details inside the resume templates editor!`);
                    }}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={['#43E97B', '#38ef7d']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.footerUseBtn}
                    >
                      <Text style={styles.footerUseText}>Use Layout</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      )}
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
  blob: { position: 'absolute', borderRadius: 150 },
  blob2: { position: 'absolute', borderRadius: 125 },

  header: { paddingHorizontal: 22, paddingTop: 64, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: '#A8A6C0', marginTop: 4, marginBottom: 10, fontWeight: '500' },

  filterList: { height: 40 },
  filterChipWrapper: {
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  filterChip: {
    paddingHorizontal: 18,
    height: '100%',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    paddingHorizontal: 18,
    height: '100%',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: { fontSize: 13, color: '#A8A6C0', fontWeight: '700' },
  filterChipTextActive: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  cardWrapper: {
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.045)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardInternalGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.035, // extremely subtle low opacity solid overlay for smooth native rendering
  },
  previewContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    paddingTop: 10,
  },
  mockupHeader: {
    width: 140,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  mockupTitleBar: {
    height: 6,
    borderRadius: 2,
    marginBottom: 3,
  },
  mockupBody: {
    width: 140,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  mockupSection: {
    height: 22,
    backgroundColor: '#F5F6FA',
    borderRadius: 3,
    marginBottom: 4,
  },
  mockupLine: {
    height: 4,
    backgroundColor: '#E2E6F0',
    borderRadius: 2,
    marginBottom: 4,
  },
  mockupLineShort: {
    width: '40%',
  },
  templateBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(7, 6, 15, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  templateBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cardDetails: {
    padding: 20,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  templateRoleSub: {
    fontSize: 12,
    color: '#A8A6C0',
    marginTop: 4,
    fontWeight: '600',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderColor: 'rgba(108, 99, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#8C84FF',
    fontWeight: '700',
  },
  downloadBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Interactive full-screen Modal Styles
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(7, 6, 15, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.88,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeadline: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  modalSubhead: {
    fontSize: 13,
    color: '#A8A6C0',
    marginTop: 3,
    fontWeight: '600',
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalCloseText: {
    color: '#A8A6C0',
    fontSize: 16,
    fontWeight: '600',
  },

  // High-fidelity resume simulation styles
  resumePaper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    marginBottom: 20,
  },
  resumeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resumeName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  resumeContact: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  resumeSection: {
    marginBottom: 18,
  },
  resumeSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resumeSectionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
    marginBottom: 8,
  },
  resumeText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  experienceBlock: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  expDuration: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  expCompany: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
  expBullet: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 4,
    paddingLeft: 4,
  },
  resumeSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  resumeSkillChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resumeSkillText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },

  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  footerCancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCancelText: {
    color: '#A8A6C0',
    fontSize: 14,
    fontWeight: '700',
  },
  footerUseBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#43E97B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  footerUseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: '#A8A6C0', marginTop: 12, fontWeight: '600' },
});


import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Platform, Image, TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DocumentPicker from 'react-native-document-picker';
import { resumeAPI, companiesAPI } from '../../api/api';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';

interface Company { name: string; slug: string; industry: string; }

export default function ResumeScreen({ navigation, route }: any) {
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [isPreSelected, setIsPreSelected] = useState(false);

  const logout = useAuthStore((state) => state.logout);

  // Automatically read company and job role from route parameters when arriving from Company or Job detail screens
  React.useEffect(() => {
    if (route?.params?.company) {
      setSelectedCompany(route.params.company);
      setIsPreSelected(true);
    }
    if (route?.params?.jobRole) {
      setJobRole(route.params.jobRole);
    }
  }, [route?.params]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.plainText],
      });
      setFile(result);
      setUploadedFilename(null);
      // We explicitly DO NOT clear selectedCompany here, so selection is preserved!
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) Alert.alert('Error', 'Could not pick file.');
    }
  };

  const uploadResume = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', {
        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
        name: file.name || 'resume.pdf',
        type: file.type || 'application/pdf',
      } as any);
      const res = await resumeAPI.upload(formData);
      if (res.data.success) {
        const filename = res.data.data.filename;
        setUploadedFilename(filename);
        if (selectedCompany) {
          // If company is already selected, directly analyze it!
          await analyzeResume(filename);
        } else {
          Alert.alert('✅ Uploaded!', 'Now select a company to analyze against.');
          loadCompanies('');
        }
      } else {
        Alert.alert('Upload Failed', res.data.error || 'Try again.');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.', [
          { text: 'OK', onPress: () => logout() }
        ]);
      } else {
        Alert.alert('Upload Error', err.response?.data?.error || 'Upload failed.');
      }
    } finally {
      setUploading(false);
    }
  };

  const loadCompanies = async (q: string) => {
    setLoadingCompanies(true);
    try {
      const res = await companiesAPI.getAll(1, 30, q || undefined);
      if (res.data.success) setCompanies(res.data.data);
    } catch {}
    setLoadingCompanies(false);
  };

  const analyzeResume = async (filenameParam?: string) => {
    const fileToAnalyze = filenameParam || uploadedFilename;
    if (!fileToAnalyze || !selectedCompany) {
      Alert.alert('Missing Info', 'Upload resume and select a company first.');
      return;
    }
    setAnalyzing(true);
    try {
      const res = await resumeAPI.analyze(fileToAnalyze, selectedCompany.slug, jobRole || undefined);
      if (res.data.success) {
        navigation.navigate('ResumeAnalysis', {
          analysis: res.data.data.analysis,
          atsAnalysis: res.data.data.atsAnalysis,
          company: res.data.data.company,
          subscription: res.data.subscription,
        });
      } else {
        Alert.alert('Analysis Failed', res.data.message || res.data.error || 'Try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Analysis failed.';
      if (err.response?.status === 403) {
        Alert.alert('Limit Reached', msg, [
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
          { text: 'Cancel' },
        ]);
      } else if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.', [
          { text: 'OK', onPress: () => logout() }
        ]);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

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
        <View style={styles.header}>
          <Text style={styles.title}>Resume Analyzer</Text>
          <Text style={styles.subtitle}>Get AI-powered feedback for any company</Text>
        </View>

        {/* Step 1: Pick file */}
        <View style={styles.section}>
          {/* Glass background */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Embedded soft pink radial glow blurred behind */}
          <View style={[styles.cardInternalGlow, { backgroundColor: '#FF6584' }]} />

          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <LinearGradient
                colors={['#FF6584', '#FFA000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Select Resume</Text>
          </View>

          <TouchableOpacity style={styles.dropzone} onPress={pickFile} activeOpacity={0.8}>
            <Text style={styles.dropzoneIcon}>{file ? '📄' : '☁️'}</Text>
            <Text style={styles.dropzoneText}>
              {file ? file.name : 'Tap to select PDF, DOC, or DOCX'}
            </Text>
            {file && <Text style={styles.dropzoneSize}>{(file.size / 1024).toFixed(0)} KB</Text>}
          </TouchableOpacity>

          {file && !uploadedFilename && (
            <TouchableOpacity style={styles.uploadBtnWrapper} onPress={uploadResume} disabled={uploading} activeOpacity={0.85}>
              <LinearGradient
                colors={['#FF6584', '#FFA000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.uploadBtn}
              >
                {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadBtnText}>Upload Resume ↑</Text>}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {uploadedFilename && (
            <View style={styles.successBadge}>
              <Text style={styles.successText}>✅ Uploaded successfully</Text>
            </View>
          )}
        </View>

        {/* Step 2: Select company */}
        {uploadedFilename && !isPreSelected && (
          <View style={styles.section}>
            {/* Glass background */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Embedded soft blue radial glow blurred behind */}
            <View style={[styles.cardInternalGlow, { backgroundColor: '#00D9FF' }]} />

            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <LinearGradient
                  colors={['#00D9FF', '#8C84FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.stepNum}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Select Company</Text>
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: '#FFFFFF', paddingVertical: Platform.OS === 'ios' ? 12 : 8, flex: 1 }]}
                placeholder="Search companies..."
                placeholderTextColor="#8A889D"
                value={searchQ}
                onChangeText={(text) => {
                  setSearchQ(text);
                  loadCompanies(text);
                }}
              />
            </View>

            <View style={styles.searchInputWrap}>
              {companies.slice(0, 15).filter(c =>
                !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase())
              ).map(c => (
                <TouchableOpacity
                  key={c.slug}
                  style={[styles.companyRow, selectedCompany?.slug === c.slug && styles.companyRowActive]}
                  onPress={() => setSelectedCompany(c)}
                >
                  <View style={styles.companyRowIcon}><Text>🏢</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyRowName}>{c.name}</Text>
                    <Text style={styles.companyRowIndustry}>{c.industry}</Text>
                  </View>
                  {selectedCompany?.slug === c.slug && <Text style={{ color: '#00D9FF', fontWeight: '800' }}>✓</Text>}
                </TouchableOpacity>
              ))}
              {loadingCompanies && <ActivityIndicator color="#00D9FF" style={{ marginVertical: 16 }} />}
            </View>
          </View>
        )}

        {/* Step 3: Analyze */}
        {uploadedFilename && selectedCompany && (
          <View style={styles.section}>
            {/* Glass background */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Embedded soft gold radial glow blurred behind */}
            <View style={[styles.cardInternalGlow, { backgroundColor: '#C5A880' }]} />

            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <LinearGradient
                  colors={['#C5A880', '#5E4831']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.stepNum}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Analyze</Text>
            </View>

            <View style={styles.targetCard}>
              <LinearGradient
                colors={['rgba(197, 168, 128, 0.12)', 'rgba(197, 168, 128, 0.02)']}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.targetLabel}>Target Company</Text>
              <Text style={styles.targetValue}>{selectedCompany.name}</Text>
            </View>

            <TouchableOpacity style={styles.analyzeBtnWrapper} onPress={analyzeResume} disabled={analyzing} activeOpacity={0.85}>
              <LinearGradient
                colors={['#C5A880', '#5E4831']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.analyzeBtn}
              >
                {analyzing ? (
                  <>
                    <ActivityIndicator color="#1E1B2E" />
                    <Text style={[styles.analyzeBtnText, { color: '#1E1B2E' }]}>Analyzing with AI...</Text>
                  </>
                ) : (
                  <Text style={[styles.analyzeBtnText, { color: '#1E1B2E' }]}>🤖 Analyze Resume</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.analyzeNote}>This may take 20-40 seconds</Text>
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

  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: '#8A889D', marginTop: 6, fontWeight: '500' },

  section: {
    marginHorizontal: 20, 
    marginBottom: 24,
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
  cardInternalGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.035, // extremely subtle low opacity solid overlay for smooth native rendering
    top: -20,
    right: -20,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, zIndex: 2 },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  stepNum: { color: '#000', fontWeight: '900', fontSize: 14, zIndex: 2 },
  stepTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', zIndex: 2 },

  dropzone: {
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.06)', 
    borderStyle: 'dashed',
    borderRadius: 16, 
    padding: 32,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    zIndex: 2,
  },
  dropzoneIcon: { fontSize: 40, marginBottom: 12 },
  dropzoneText: { color: '#8A889D', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  dropzoneSize: { color: '#6B6882', fontSize: 12, marginTop: 8 },

  uploadBtnWrapper: {
    borderRadius: 14,
    marginTop: 16,
    overflow: 'hidden',
    zIndex: 2,
  },
  uploadBtn: {
    paddingVertical: 14, 
    alignItems: 'center',
  },
  uploadBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  successBadge: {
    backgroundColor: 'rgba(56, 239, 125, 0.15)', 
    borderRadius: 12,
    paddingVertical: 10, 
    alignItems: 'center', 
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 239, 125, 0.25)',
    zIndex: 2,
  },
  successText: { color: '#38ef7d', fontWeight: '800' },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
    borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', 
    marginBottom: 12,
    zIndex: 2,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { fontSize: 15, flex: 1, fontWeight: '600' },
  searchInputWrap: { zIndex: 2 },

  companyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12, marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  companyRowActive: { borderColor: '#00D9FF', backgroundColor: 'rgba(0, 217, 255, 0.05)' },
  companyRowIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  companyRowName: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  companyRowIndustry: { fontSize: 12, color: '#8A889D', marginTop: 2 },

  targetCard: {
    borderRadius: 14,
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(197, 168, 128, 0.2)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },
  targetLabel: { fontSize: 11, color: '#C5A880', fontWeight: '800', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  targetValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },

  analyzeBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 2,
  },
  analyzeBtn: {
    paddingVertical: 18, 
    alignItems: 'center',
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 10,
  },
  analyzeBtnText: { fontSize: 18, fontWeight: '900' },
  analyzeNote: { color: '#6B6882', fontSize: 12, textAlign: 'center', marginTop: 8, fontWeight: '600', zIndex: 2 },
});


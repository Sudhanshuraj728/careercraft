import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authAPI } from '../../api/api';
import { useAuthStore } from '../../store/authStore';
import { COLORS, GOOGLE_WEB_CLIENT_ID } from '../../utils/constants';

GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(email.trim(), password);
      if (res.data.success) {
        await setAuth(res.data.token, res.data.user);
      } else {
        Alert.alert('Login Failed', res.data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      // Force account picker by signing out first
      try { await GoogleSignin.signOut(); } catch (e) {}
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error('No ID token received from Google');
      const res = await authAPI.googleSignIn(idToken);
      if (res.data.success) {
        await setAuth(res.data.token, res.data.user);
      } else {
        Alert.alert('Google Sign-In Failed', res.data.error || 'Please try again.');
      }
    } catch (err: any) {
      if (err.code === 'SIGN_IN_CANCELLED') return; // user dismissed
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network')) {
        Alert.alert('Network Error', 'Cannot reach the server. Make sure the backend is running.');
      } else if (err.response?.status === 503) {
        Alert.alert('Service Unavailable', 'The backend server is unavailable. Check the backend deployment or use a local server.');
      } else if (err.response?.data?.error) {
        // Server returned a specific error (rate limit, invalid token, etc.)
        Alert.alert('Sign-In Error', err.response.data.error);
      } else if (err.response?.status === 429) {
        Alert.alert('Too Many Attempts', 'Please wait a few minutes before trying again.');
      } else {
        Alert.alert('Google Sign-In Error', err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Background blobs */}
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Career<Text style={styles.logoAccent}>Craft</Text></Text>
          <Text style={styles.subtitle}>Welcome back 👋</Text>
          <Text style={styles.subtext}>Sign in to continue your career journey</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerAccent}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.12 },
  blob1: { width: 250, height: 250, backgroundColor: COLORS.primary, top: -60, right: -60 },
  blob2: { width: 180, height: 180, backgroundColor: COLORS.secondary, bottom: 100, left: -60 },

  header: { paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logoText: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  logoAccent: { color: COLORS.primary },
  subtitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 6 },
  subtext: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  eyeBtn: { padding: 14, backgroundColor: COLORS.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },
  eyeText: { fontSize: 18 },

  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: 13 },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  googleIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    fontWeight: '800',
    color: '#4285F4',
    overflow: 'hidden',
  },
  googleBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },

  registerLink: { alignItems: 'center', marginTop: 28 },
  registerText: { color: COLORS.textSecondary, fontSize: 15 },
  registerAccent: { color: COLORS.primary, fontWeight: '700' },
});

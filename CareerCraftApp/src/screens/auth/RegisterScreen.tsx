import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { authAPI } from '../../api/api';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/constants';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(name.trim(), email.trim(), password);
      if (res.data.success) {
        await setAuth(res.data.token, res.data.user);
      } else {
        Alert.alert('Registration Failed', res.data.error);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />

        <View style={styles.header}>
          <Text style={styles.logoText}>Career<Text style={styles.logoAccent}>Craft</Text></Text>
          <Text style={styles.subtitle}>Create Account ✨</Text>
          <Text style={styles.subtext}>Start building your dream career today</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: 'Full Name', value: name, set: setName, placeholder: 'John Doe', type: 'default' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'you@example.com', type: 'email-address' },
          ].map(({ label, value, set, placeholder, type }) => (
            <View key={label}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                value={value}
                onChangeText={set}
                keyboardType={type as any}
                autoCapitalize={type === 'email-address' ? 'none' : 'words'}
                autoCorrect={false}
              />
            </View>
          ))}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Min 6 characters"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Text>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor={COLORS.textMuted}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPass}
          />

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account →</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginAccent}>Sign In</Text>
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
  blob1: { width: 220, height: 220, backgroundColor: COLORS.accent, top: -50, left: -50 },
  blob2: { width: 200, height: 200, backgroundColor: COLORS.primary, bottom: 80, right: -60 },

  header: { paddingTop: 70, paddingBottom: 36, alignItems: 'center' },
  logoText: { fontSize: 30, fontWeight: '800', color: COLORS.text },
  logoAccent: { color: COLORS.primary },
  subtitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 6 },
  subtext: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },

  card: { backgroundColor: COLORS.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 4,
  },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  eyeBtn: { padding: 14, backgroundColor: COLORS.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },

  btn: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  loginLink: { alignItems: 'center', marginTop: 28 },
  loginText: { color: COLORS.textSecondary, fontSize: 15 },
  loginAccent: { color: COLORS.primary, fontWeight: '700' },
});

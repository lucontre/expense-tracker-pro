import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '../lib/supabase';
import { TermsModal } from '../components/TermsModal';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingSignUp, setPendingSignUp] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const supabase = createClient();
  const navigation = useNavigation();

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // User is already logged in, navigate to main app
      // @ts-ignore
      navigation.navigate('Dashboard');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Navigate to Dashboard on successful login
      // @ts-ignore
      navigation.navigate('Dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setPendingSignUp(true);
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Update user profile with terms acceptance
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      setShowTermsModal(false);
      setPendingSignUp(false);
      
      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Dashboard after signup
              // @ts-ignore
              navigation.navigate('Dashboard');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTermsDecline = () => {
    Alert.alert(
      'Terms Required',
      'You must accept the terms and conditions to create an account.'
    );
    setShowTermsModal(false);
    setPendingSignUp(false);
  };

  const translations = {
    en: {
      title: 'Welcome to Expense Tracker Pro',
      subtitle: 'Manage your finances with ease',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      switchToSignUp: "Don't have an account? Sign Up",
      switchToSignIn: 'Already have an account? Sign In',
      loading: 'Loading...',
    },
    es: {
      title: 'Bienvenido a Expense Tracker Pro',
      subtitle: 'Gestiona tus finanzas con facilidad',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar Sesión',
      signUp: 'Registrarse',
      switchToSignUp: '¿No tienes cuenta? Regístrate',
      switchToSignIn: '¿Ya tienes cuenta? Inicia Sesión',
      loading: 'Cargando...',
    },
  };

  const t = translations[language];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.email}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.password}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? t.loading : (isSignUp ? t.signUp : t.signIn)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp ? t.switchToSignIn : t.switchToSignUp}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.languageSelector}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'es' && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('es')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'es' && styles.languageButtonTextActive,
                ]}
              >
                Español
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TermsModal
        visible={showTermsModal}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
        language={language}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  languageButtonActive: {
    backgroundColor: '#3b82f6',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  languageButtonTextActive: {
    color: '#ffffff',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { createClient } from '../lib/supabase';
import { useCurrency } from '../hooks/useCurrency';
import { useTheme } from '../hooks/useTheme';
import { Avatar } from '../components/Avatar';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [subscription, setSubscription] = useState<any>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const supabase = createClient();
  const { currency, setCurrency, getAllCurrencies } = useCurrency();
  const { theme, setTheme, colors, isDark } = useTheme();
  
  // Keep local state for initial loading
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');

  const handleAvatarChange = (avatarUrl: string) => {
    setUser((prev: any) => prev ? { ...prev, avatar_url: avatarUrl } : null);
  };

  // Translations
  const translations = {
    en: {
      title: 'Profile',
      subtitle: 'Manage your account',
      personalInfo: 'Personal Information',
      email: 'Email',
      fullName: 'Full Name',
      preferences: 'Preferences',
      language: 'Language',
      currency: 'Currency',
      theme: 'Dark Mode',
      subscription: 'Subscription',
      currentPlan: 'Current Plan',
      trialDaysLeft: 'Trial Days Left',
      startTrial: 'Start 7-Day Free Trial',
      cancelSubscription: 'Cancel Subscription',
      manageSubscription: 'Manage Subscription',
      upgradeToPro: 'Upgrade to Pro',
      saveChanges: 'Save Changes',
      logout: 'Sign Out',
      logoutConfirm: 'Are you sure you want to sign out?',
      english: 'English',
      spanish: 'Spanish',
      light: 'Light',
      dark: 'Dark',
      success: 'Settings saved successfully!',
      error: 'Error saving settings',
      trialStarted: '7-day trial started!',
      trialEnded: 'Your trial has ended',
      cancelConfirm: 'Are you sure you want to cancel your subscription?',
      startTrialConfirm: 'Start your 7-day free trial of Pro features?',
    },
    es: {
      title: 'Perfil',
      subtitle: 'Gestiona tu cuenta',
      personalInfo: 'Información Personal',
      email: 'Correo Electrónico',
      fullName: 'Nombre Completo',
      preferences: 'Preferencias',
      language: 'Idioma',
      currency: 'Moneda',
      theme: 'Modo Oscuro',
      subscription: 'Suscripción',
      currentPlan: 'Plan Actual',
      trialDaysLeft: 'Días de Prueba Restantes',
      startTrial: 'Iniciar Prueba Gratuita de 7 Días',
      cancelSubscription: 'Cancelar Suscripción',
      manageSubscription: 'Gestionar Suscripción',
      upgradeToPro: 'Actualizar a Pro',
      saveChanges: 'Guardar Cambios',
      logout: 'Cerrar Sesión',
      logoutConfirm: '¿Estás seguro de que quieres cerrar sesión?',
      english: 'Inglés',
      spanish: 'Español',
      light: 'Claro',
      dark: 'Oscuro',
      success: '¡Configuración guardada exitosamente!',
      error: 'Error al guardar configuración',
      trialStarted: '¡Prueba de 7 días iniciada!',
      trialEnded: 'Tu prueba ha terminado',
      cancelConfirm: '¿Estás seguro de que quieres cancelar tu suscripción?',
      startTrialConfirm: '¿Iniciar tu prueba gratuita de 7 días de funciones Pro?',
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadUserData();
  }, []);

  const refreshControlProps =
    Platform.OS === 'web'
      ? {}
      : {
          refreshControl: (
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ),
        };

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch user's subscription plan and preferences
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData) {
        // Combine auth user with userData to include avatar_url
        const userWithProfile = {
          ...user,
          avatar_url: userData.avatar_url || null,
          full_name: userData.full_name || null,
        };
        setUser(userWithProfile);
        
        setUserPlan(userData.subscription_plan || 'free');
        setLanguage(userData.language || 'en');
        setFullName(userData.full_name || userData.name || '');
        setEmail(user?.email || '');
        const userTheme = userData.theme || 'light';
        setLocalTheme(userTheme);
        setTheme(userTheme);

        // Load subscription if Pro
        if (userData.subscription_plan === 'pro') {
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          // Si no hay error y hay datos, establecer la suscripción
          // Si no hay registro, subscriptionData será null, pero el usuario sigue siendo Pro
          if (!subscriptionError && subscriptionData) {
            setSubscription(subscriptionData);
          } else {
            // Si no hay registro de suscripción pero el usuario es Pro, establecer null
            setSubscription(null);
          }
        }
      } else {
        setUser(user);
      }
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          language,
          theme: localTheme,
          currency,
          full_name: fullName,
          name: fullName,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Reload currency from context to sync
      await loadUserData();

      Alert.alert('Success', t.success);
    } catch (err: any) {
      Alert.alert('Error', err.message || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleStartTrial = async () => {
    if (!user) return;

    Alert.alert('Start Trial', t.startTrialConfirm, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start Trial',
        onPress: async () => {
          setSaving(true);

          try {
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7);

            // Update user to Pro with trial
            const { error: userError } = await supabase
              .from('users')
              .update({
                subscription_plan: 'pro',
                trial_started_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            if (userError) throw userError;

            // Create trial subscription
            const { error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: user.id,
                plan_id: 'pro',
                status: 'trial',
                current_period_start: new Date().toISOString(),
                current_period_end: trialEndDate.toISOString(),
              });

            if (subscriptionError) throw subscriptionError;

            Alert.alert('Success', t.trialStarted);
            await loadUserData();
          } catch (err: any) {
            Alert.alert('Error', err.message || t.error);
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    Alert.alert('Cancel Subscription', t.cancelConfirm, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Cancel Subscription',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);

          try {
            // Update subscription status if subscription exists
            if (subscription) {
              const { error: updateError } = await supabase
                .from('user_subscriptions')
                .update({ 
                  cancel_at_period_end: true,
                  status: 'cancelled'
                })
                .eq('user_id', user.id);

              if (updateError) throw updateError;
            }

            // Always update user's plan to free
            const { error: userUpdateError } = await supabase
              .from('users')
              .update({ 
                subscription_plan: 'free'
              })
              .eq('id', user.id);

            if (userUpdateError) throw userUpdateError;

            Alert.alert('Success', 'Subscription cancelled successfully');
            await loadUserData();
          } catch (err: any) {
            Alert.alert('Error', err.message || t.error);
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: language === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
      {
        text: t.logout,
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  const getTrialDaysLeft = () => {
    if (!user?.trial_started_at) return 0;
    
    const trialStart = new Date(user.trial_started_at);
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const isTrialActive = () => {
    return user?.subscription_plan === 'pro' && subscription?.status === 'trial';
  };

  const isTrialExpired = () => {
    return isTrialActive() && getTrialDaysLeft() === 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.card, borderBottomColor: colors.border },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    card: { backgroundColor: colors.card },
    cardTitle: { color: colors.text },
    websiteCard: { 
      backgroundColor: colors.card, 
      borderColor: colors.border,
    },
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
        <View style={[styles.header, dynamicStyles.header]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, dynamicStyles.title]}>{t.title}</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>{t.subtitle}</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          bounces={Platform.OS !== 'web'}
          scrollEnabled={true}
          nestedScrollEnabled={Platform.OS === 'android'}
          removeClippedSubviews={Platform.OS === 'android'}
          {...refreshControlProps}
        >
          <View style={styles.content}>
          {/* Website Link Section - Only for Pro users */}
          {userPlan === 'pro' && (
            <TouchableOpacity
              style={[styles.websiteCard, dynamicStyles.websiteCard]}
              onPress={() => Linking.openURL('https://expense-tracker-pro-web.vercel.app')}
              activeOpacity={0.7}
            >
              <View style={styles.websiteContent}>
                <View style={[styles.websiteIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.websiteIconText, { color: colors.primary }]}>🌐</Text>
                </View>
                <View style={styles.websiteTextContainer}>
                  <Text style={[styles.websiteLabel, { color: colors.textSecondary }]}>
                    {language === 'es' ? 'Visita nuestra web' : 'Visit our website'}
                  </Text>
                  <Text style={[styles.websiteUrl, { color: colors.primary }]} numberOfLines={1}>
                    expense-tracker-pro-web.vercel.app
                  </Text>
                </View>
                <View style={styles.websiteArrow}>
                  <Text style={[styles.websiteArrowText, { color: colors.textSecondary }]}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Personal Information */}
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{t.personalInfo}</Text>
            
            {/* Avatar Section - Centered */}
            <View style={styles.avatarSection}>
              <Avatar 
                user={user} 
                size={100} 
                onAvatarChange={handleAvatarChange}
              />
            </View>

            {/* Input Fields */}
            <View style={styles.inputFieldsContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t.email}</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textSecondary}
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t.fullName}</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={language === 'es' ? 'Ej: Diego Castillo' : 'e.g. Diego Castillo'}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Preferences */}
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{t.preferences}</Text>
            
            <View style={styles.preferenceItem}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>{t.language}</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => setShowLanguageModal(true)}
              >
                <Text 
                  style={[styles.dropdownText, { color: colors.text, flex: 1 }]}
                  numberOfLines={1}
                >
                  {language === 'en' ? t.english : t.spanish}
                </Text>
                <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.preferenceItem}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>{t.currency}</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => setShowCurrencyModal(true)}
              >
                <Text 
                  style={[styles.dropdownText, { color: colors.text, flex: 1 }]}
                  numberOfLines={1}
                >
                  {getAllCurrencies().find(c => c.code === currency)?.name || 'USD'}
                </Text>
                <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.preferenceItem}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>{t.theme}</Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={(value) => {
                  const newTheme = value ? 'dark' : 'light';
                  setTheme(newTheme);
                  setLocalTheme(newTheme);
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={theme === 'dark' ? colors.card : colors.border}
              />
            </View>
          </View>

          {/* Subscription */}
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{t.subscription}</Text>
            
            <View style={styles.subscriptionInfo}>
              <View style={styles.subscriptionRow}>
                <Text style={[styles.subscriptionLabel, { color: colors.textSecondary }]}>{t.currentPlan}</Text>
                <View style={[
                  styles.planBadge, 
                  userPlan === 'pro' ? styles.proBadge : styles.freeBadge
                ]}>
                  <Text style={[
                    styles.planText,
                    userPlan === 'pro' ? styles.proText : styles.freeText
                  ]}>
                    {userPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </Text>
                </View>
              </View>

              {isTrialActive() && !isTrialExpired() && (
                <View style={styles.subscriptionRow}>
                  <Text style={[styles.subscriptionLabel, { color: colors.textSecondary }]}>{t.trialDaysLeft}</Text>
                  <Text style={[styles.trialDaysText, { color: colors.text }]}>
                    {getTrialDaysLeft()} days
                  </Text>
                </View>
              )}

              {isTrialExpired() && (
                <View style={[styles.trialExpiredContainer, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.trialExpiredText, { color: colors.error }]}>{t.trialEnded}</Text>
                </View>
              )}
            </View>

            <View style={styles.subscriptionActions}>
              {userPlan === 'free' && (
                <TouchableOpacity
                  onPress={handleStartTrial}
                  disabled={saving}
                  style={[styles.actionButton, styles.trialButton]}
                >
                  <Text style={styles.actionButtonText}>{t.startTrial}</Text>
                </TouchableOpacity>
              )}

              {userPlan === 'pro' && (
                <TouchableOpacity
                  onPress={handleCancelSubscription}
                  disabled={saving}
                  style={[styles.actionButton, styles.cancelButton]}
                >
                  <Text style={styles.actionButtonText}>{t.cancelSubscription}</Text>
                </TouchableOpacity>
              )}

              {userPlan === 'free' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.upgradeButton]}
                >
                  <Text style={styles.actionButtonText}>{t.upgradeToPro}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Save Changes Button */}
          <View style={[styles.card, dynamicStyles.card, styles.saveChangesCard]}>
            <TouchableOpacity
              onPress={handleSaveSettings}
              disabled={saving}
              style={[styles.actionButton, styles.saveButton]}
            >
              <Text style={styles.actionButtonText}>
                {saving ? 'Saving...' : t.saveChanges}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logout Section */}
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{t.logout}</Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButtonLarge}
            >
              <Text style={styles.logoutButtonLargeText}>{t.logout}</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.language}</Text>
            <TouchableOpacity
              style={[
                styles.modalOption,
                { backgroundColor: colors.background },
                language === 'en' && styles.modalOptionActive,
              ]}
              onPress={() => {
                setLanguage('en');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                { color: colors.text },
                language === 'en' && styles.modalOptionTextActive,
              ]}>
                {t.english}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalOption,
                { backgroundColor: colors.background },
                language === 'es' && styles.modalOptionActive,
              ]}
              onPress={() => {
                setLanguage('es');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                { color: colors.text },
                language === 'es' && styles.modalOptionTextActive,
              ]}>
                {t.spanish}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.currency}</Text>
            {getAllCurrencies().map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.modalOption,
                  { backgroundColor: colors.background },
                  currency === curr.code && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setCurrency(curr.code);
                  setShowCurrencyModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: colors.text },
                  currency === curr.code && styles.modalOptionTextActive,
                ]}>
                  {language === 'es' ? curr.nameEs : curr.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingLeft: 70, // Space for menu button
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' && {
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }),
  },
  scrollContent: {
    paddingBottom: 50,
    ...(Platform.OS === 'web' && {
      minHeight: '100%',
    }),
  },
  content: {
    padding: 15,
  },
  websiteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  websiteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  websiteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#3b82f620',
  },
  websiteIconText: {
    fontSize: 24,
  },
  websiteTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  websiteLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  websiteUrl: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
  websiteArrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  websiteArrowText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  planContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  inputFieldsContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 50,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proBadge: {
    backgroundColor: '#3b82f6',
  },
  freeBadge: {
    backgroundColor: '#6b7280',
  },
  planText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  proText: {
    color: '#fff',
  },
  freeText: {
    color: '#fff',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  languageButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#666',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  subscriptionInfo: {
    marginBottom: 20,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  subscriptionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  trialDaysText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  trialExpiredContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  trialExpiredText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  subscriptionActions: {
    gap: 12,
    marginTop: 4,
  },
  saveChangesCard: {
    marginTop: 8,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    width: '100%',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  logoutButtonLarge: {
    backgroundColor: '#ef4444',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonLargeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  trialButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 150,
    gap: 8,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  modalOptionActive: {
    backgroundColor: '#3b82f6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

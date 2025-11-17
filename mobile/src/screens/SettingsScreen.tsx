import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl, Linking, Platform } from 'react-native';
import { createClient } from '../lib/supabase';

export default function SettingsScreen() {
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Fetch user's subscription plan
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();

      if (userData) {
        setUserPlan(userData.subscription_plan || 'free');
      }

      // Fetch subscription details if Pro
      if (userData?.subscription_plan === 'pro') {
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setSubscription(subscriptionData);
      }
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Pro',
      'This upgrade is handled on our website for now.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Website',
          onPress: () => {
            Linking.openURL('https://expense-tracker-pro-web.vercel.app/checkout');
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'Manage your Pro subscription on our website.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Website',
          onPress: () => {
            Linking.openURL('https://expense-tracker-pro-web.vercel.app/settings/subscription');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const refreshControlProps =
    Platform.OS === 'web'
      ? {}
      : {
          refreshControl: (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ),
        };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        {...refreshControlProps}
      >
        <View style={styles.content}>
          {/* User Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile</Text>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
                <View style={styles.planContainer}>
                  <Text style={[styles.userRole, { marginRight: 8 }]}>Plan:</Text>
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
              </View>
            </View>
          </View>

          {/* Subscription Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Subscription</Text>
            {userPlan === 'free' ? (
              <View>
                <Text style={styles.subscriptionText}>
                  You're currently on the Free plan with limited features.
                </Text>
                <TouchableOpacity 
                  onPress={handleUpgrade} 
                  style={styles.upgradeButton}
                >
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to Pro
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.subscriptionText}>
                  You're subscribed to the Pro plan with unlimited features.
                </Text>
                {subscription && (
                  <View style={styles.subscriptionDetails}>
                    <Text style={styles.subscriptionDetail}>
                      Status: <Text style={styles.statusText}>
                        {subscription.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </Text>
                    <Text style={styles.subscriptionDetail}>
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                <TouchableOpacity onPress={handleManageSubscription} style={styles.manageButton}>
                  <Text style={styles.manageButtonText}>Manage Subscription</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Features Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Basic Reports</Text>
                  <Text style={styles.featureStatus}>✓ Available</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📈</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Advanced Analytics</Text>
                  <Text style={[
                    styles.featureStatus,
                    userPlan === 'pro' ? styles.available : styles.unavailable
                  ]}>
                    {userPlan === 'pro' ? '✓ Available' : '✗ Pro Only'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎨</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Custom Categories</Text>
                  <Text style={[
                    styles.featureStatus,
                    userPlan === 'pro' ? styles.available : styles.unavailable
                  ]}>
                    {userPlan === 'pro' ? '✓ Available' : '✗ Pro Only'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📤</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Export Reports</Text>
                  <Text style={[
                    styles.featureStatus,
                    userPlan === 'pro' ? styles.available : styles.unavailable
                  ]}>
                    {userPlan === 'pro' ? '✓ Available' : '✗ Pro Only'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🌐</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Web Access</Text>
                  <Text style={[
                    styles.featureStatus,
                    userPlan === 'pro' ? styles.available : styles.unavailable
                  ]}>
                    {userPlan === 'pro' ? '✓ Available' : '✗ Pro Only'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.appName}>Expense Tracker Pro</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              A modern expense tracking application to help you manage your finances.
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingLeft: 70,
    paddingVertical: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
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
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadge: {
    backgroundColor: '#3b82f6',
  },
  freeBadge: {
    backgroundColor: '#6b7280',
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
  },
  proText: {
    color: '#fff',
  },
  freeText: {
    color: '#fff',
  },
  subscriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  subscriptionDetails: {
    marginBottom: 15,
  },
  subscriptionDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusText: {
    fontWeight: '600',
    color: '#10b981',
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  featureStatus: {
    fontSize: 14,
    color: '#10b981',
  },
  available: {
    color: '#10b981',
  },
  unavailable: {
    color: '#ef4444',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

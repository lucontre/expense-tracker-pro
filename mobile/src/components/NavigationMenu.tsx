import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { createClient } from '../lib/supabase';

interface NavigationMenuItem {
  name: string;
  label: string;
  icon: string;
  isAction?: boolean;
  action?: () => void;
}

const menuItems: NavigationMenuItem[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: '📊' },
  { name: 'Transactions', label: 'Transactions', icon: '💰' },
  { name: 'Budgets', label: 'Budgets', icon: '📈' },
  { name: 'Reports', label: 'Reports', icon: '📋' },
  { name: 'Settings', label: 'Settings', icon: '⚙️' },
  { name: 'SavingsGoals', label: 'Savings', icon: '🎯' },
  { name: 'Notifications', label: 'Alerts', icon: '🔔' },
  { name: 'AccountSharing', label: 'Share', icon: '👥' },
  { name: 'Contact', label: 'Contact', icon: '📧' },
  { name: 'Export', label: 'Export', icon: '📤' },
  { name: 'Profile', label: 'Profile', icon: '👤' },
  { name: 'SignOut', label: 'Sign Out', icon: '🚪', isAction: true },
];

export function NavigationMenu() {
  const [visible, setVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const supabase = createClient();

  const handleNavigate = (screenName: string) => {
    setActiveScreen(screenName);
    setVisible(false);
    // @ts-ignore
    navigation.navigate(screenName);
  };

  const performLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (navigation && typeof navigation.reset === 'function') {
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Sign Out', 'There was a problem signing out. Please try again.');
    }
  };

  const handleLogout = () => {
    setVisible(false);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm('Are you sure you want to sign out?');
        if (confirmed) {
          performLogout();
        }
      } else {
        performLogout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  const handleMenuPress = (item: NavigationMenuItem) => {
    if (item.isAction && item.name === 'SignOut') {
      handleLogout();
    } else {
      handleNavigate(item.name);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <TouchableOpacity
          style={[styles.webMenuButton, { backgroundColor: colors.card }]}
          onPress={() => setVisible(true)}
        >
          <Text style={[styles.webMenuButtonText, { color: colors.text }]}>☰</Text>
        </TouchableOpacity>

        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity
            style={styles.webModalOverlay}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          >
            <View 
              style={[styles.webMenuDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}
              onStartShouldSetResponder={() => true}
            >
              <View style={[styles.webMenuHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.webMenuTitle, { color: colors.text }]}>Menu</Text>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <Text style={[styles.webCloseButton, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.webMenuList}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.webMenuItem,
                      { borderBottomColor: colors.border },
                      activeScreen === item.name && styles.webMenuItemActive,
                      item.isAction && { backgroundColor: colors.error + '10' },
                    ]}
                    onPress={() => handleMenuPress(item)}
                  >
                    <Text style={styles.webMenuItemIcon}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.webMenuItemText,
                        { color: item.isAction ? colors.error : colors.text },
                        activeScreen === item.name && styles.webMenuItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Menu</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.menuList}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.menuItem,
                    { borderBottomColor: colors.border },
                    activeScreen === item.name && styles.menuItemActive,
                    item.isAction && { backgroundColor: colors.error + '10' },
                  ]}
                  onPress={() => handleMenuPress(item)}
                >
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: item.isAction ? colors.error : colors.text },
                      activeScreen === item.name && styles.menuItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  webMenuButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  webMenuButtonText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
    color: '#374151',
  },
  webModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingLeft: 16,
  },
  webMenuDropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 240,
    maxWidth: 320,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  webMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  webMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  webCloseButton: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: 'bold',
    padding: 4,
  },
  webMenuList: {
    maxHeight: 400,
  },
  webMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  webMenuItemActive: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  webMenuItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  webMenuItemText: {
    fontSize: 15,
    color: '#374151',
  },
  webMenuItemTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 1000,
    backgroundColor: '#3b82f6',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  menuList: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
  },
  menuItemTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});


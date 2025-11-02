import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import screens
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SavingsGoalsScreen from './src/screens/SavingsGoalsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import AccountSharingScreen from './src/screens/AccountSharingScreen';
import ContactScreen from './src/screens/ContactScreen';
import ExportScreen from './src/screens/ExportScreen';

// Import providers
import { CurrencyProvider } from './src/hooks/useCurrency';
import { ThemeProvider } from './src/hooks/useTheme';

// Import wrapper
import { withNavigation } from './src/components/WithNavigation';
import { createClient } from './src/lib/supabase';

const Stack = createStackNavigator();
const supabase = createClient();

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(true);
  const navigationRef = React.useRef<any>(null);

  const checkAuthState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const authenticated = !!user;
      setIsAuthenticated(authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    // Check initial auth state
    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      
      // Navigate based on auth state (with delay to ensure navigation is ready)
      setTimeout(() => {
        if (navigationRef.current) {
          if (authenticated) {
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          } else {
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        }
      }, 100);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (initializing) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator 
              initialRouteName={isAuthenticated ? "Dashboard" : "Auth"}
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="Dashboard" component={withNavigation(DashboardScreen)} />
              <Stack.Screen name="Transactions" component={withNavigation(TransactionsScreen)} />
              <Stack.Screen name="Budgets" component={withNavigation(BudgetsScreen)} />
              <Stack.Screen name="Reports" component={withNavigation(ReportsScreen)} />
              <Stack.Screen name="Settings" component={withNavigation(SettingsScreen)} />
              <Stack.Screen name="SavingsGoals" component={withNavigation(SavingsGoalsScreen)} />
              <Stack.Screen name="Notifications" component={withNavigation(NotificationsScreen)} />
              <Stack.Screen name="AccountSharing" component={withNavigation(AccountSharingScreen)} />
              <Stack.Screen name="Contact" component={withNavigation(ContactScreen)} />
              <Stack.Screen name="Export" component={withNavigation(ExportScreen)} />
              <Stack.Screen name="Profile" component={withNavigation(ProfileScreen)} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </CurrencyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Platform, TextInput } from 'react-native';
import { createClient } from '../lib/supabase';
import { Transaction, Category } from '@expense-tracker-pro/shared';
import { useNavigation } from '@react-navigation/native';
import { useCurrency } from '../hooks/useCurrency';
import { useTheme } from '../hooks/useTheme';
// import { Chart } from '../components/Chart'; // TEMPORARILY DISABLED
import { useAppNavigation } from '../hooks/useAppNavigation';
import { FloatingActionButton } from '../components/FloatingActionButton';

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [userFullName, setUserFullName] = useState<string>('');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [displayTransactions, setDisplayTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionFormData, setTransactionFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD' as 'USD' | 'MXN' | 'GTQ' | 'EUR',
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const supabase = createClient();
  const navigation = useNavigation();
  const { formatCurrency, getAllCurrencies, currency: userCurrency } = useCurrency();
  const { colors } = useTheme();
  const { 
    navigateToTransactions, 
    navigateToBudgets, 
    navigateToReports, 
    navigateToSavingsGoals,
    navigateToNotifications,
    navigateToAccountSharing,
    navigateToContact,
    navigateToProfile 
  } = useAppNavigation();

  useEffect(() => {
    loadData();
  }, []);

  // Load categories - ensure we get all categories including system ones
  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      console.log('Categories query result:', { data, error });

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      console.log('Loaded categories:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Category names:', data.map(c => c.name));
      }
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    // Set selected currency from user preference
    setSelectedCurrency(userCurrency);
  }, [userCurrency]);

  useEffect(() => {
    // Filter transactions by selected currency
    const filtered = allTransactions.filter(t => {
      // If transaction has currency field, filter by it
      // Otherwise, include all transactions (for backward compatibility)
      return !t.currency || t.currency === selectedCurrency;
    });
    setDisplayTransactions(filtered);
  }, [selectedCurrency, allTransactions]);

  // Debug effect to track userFullName changes
  useEffect(() => {
    console.log('userFullName state changed:', userFullName);
  }, [userFullName]);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUser(user);

    // Load user's full name from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    console.log('=== Dashboard User Data Load ===');
    console.log('User ID:', user.id);
    console.log('User Data:', userData);
    console.log('User Error:', userError);

    if (userData) {
      // Get full_name from database
      const fullName = (userData.full_name || '').trim();
      
      console.log('Full name check:', {
        'userData.full_name': userData.full_name,
        'calculated fullName': fullName,
        'fullName length': fullName.length,
        'will set to': fullName || '(empty, will use email)'
      });
      
      setUserFullName(fullName);
      
      // Log what will be displayed
      const displayName = fullName || user?.email || 'User';
      console.log('Will display:', displayName);
    } else {
      console.log('No userData returned, userError:', userError);
      setUserFullName('');
    }

    // Load ALL transactions for stats calculation
    const { data: allTransactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (allTransactionsData) {
      setAllTransactions(allTransactionsData as Transaction[]);
      
      // Set initial filtered transactions
      const filtered = allTransactionsData.filter(t => {
        return !t.currency || t.currency === selectedCurrency;
      });
      setDisplayTransactions(filtered);
    }

    // Load categories
    await loadCategories();

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calculateStats = () => {
    // Use displayTransactions which are already filtered by currency
    const totalIncome = displayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = displayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  };

  const generateChartData = () => {
    console.log('Generating chart data...');
    console.log('All transactions:', displayTransactions);
    console.log('All categories:', categories);
    
    // Create a map of category_id to category_name
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    console.log('Category map:', categoryMap);
    
    // Income vs Expenses Pie Chart
    const pieData = [
      {
        name: 'Income',
        value: Number(stats.totalIncome) || 0,
        color: '#10b981',
        legendFontColor: '#1f2937',
        legendFontSize: 12,
      },
      {
        name: 'Expenses',
        value: Number(stats.totalExpenses) || 0,
        color: '#ef4444',
        legendFontColor: '#1f2937',
        legendFontSize: 12,
      },
    ];

    // Expense by Category Bar Chart
    const categoryTotals = displayTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryName = t.category_id ? categoryMap.get(t.category_id) || 'Other' : 'Other';
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    console.log('Category totals:', categoryTotals);

    const categoryData: { category: string; amount: number }[] = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount: Number(amount) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 categories

    console.log('Category chart data:', categoryData);

    const barData = {
      labels: categoryData.map(d => d.category),
      datasets: [{
        data: categoryData.map(d => d.amount),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      }],
    };

    // Last 7 days line chart
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayIncome = displayTransactions
        .filter(t => t.type === 'income' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dayExpenses = displayTransactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        income: dayIncome,
        expenses: dayExpenses,
      });
    }

    const lineData = {
      labels: last7Days.map(d => d.date),
      datasets: [
        {
          data: last7Days.map(d => d.income),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: last7Days.map(d => d.expenses),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return { pieData, lineData, barData };
  };

  const stats = calculateStats();
  // const chartData = generateChartData(); // TEMPORARILY DISABLED

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.card, borderBottomColor: colors.border },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
  };

    return (
      <View style={[styles.mainContainer, dynamicStyles.container]}>
        <View style={[styles.container, dynamicStyles.container]}>
          <ScrollView
            style={styles.scrollView}
            {...(Platform.OS === 'web'
              ? {}
              : {
                  refreshControl: (
                    <RefreshControl 
                      refreshing={refreshing} 
                      onRefresh={onRefresh}
                      tintColor={colors.primary}
                    />
                  ),
                })}
          >
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, dynamicStyles.title]}>Dashboard</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Welcome back, {(userFullName && userFullName.trim() !== '') ? userFullName.trim() : (user?.email || 'User')}
            </Text>
          </View>
        </View>
        
        {/* Currency Filter */}
        <View style={styles.currencyFilter}>
          <Text style={[styles.currencyFilterLabel, { color: colors.textSecondary }]}>
            Filtrar por Moneda:
          </Text>
          <TouchableOpacity
            style={[styles.currencyButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => setShowCurrencyModal(true)}
          >
            <Text style={[styles.currencyButtonText, { color: colors.text }]}>
              {getAllCurrencies().find(c => c.code === selectedCurrency)?.name || 'USD'} ({getAllCurrencies().find(c => c.code === selectedCurrency)?.symbol || '$'})
            </Text>
            <Text style={[styles.currencyButtonArrow, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Statistics */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statLabel}>Total Income</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalIncome)}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalExpenses)}</Text>
        </View>
      </View>

      {/* Balance Card */}
      <View style={[styles.balanceCard, stats.balance >= 0 ? styles.balancePositive : styles.balanceNegative]}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceValue}>{formatCurrency(stats.balance)}</Text>
      </View>

      {/* Charts Section - TEMPORARILY DISABLED */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        
        <Chart
          type="pie"
          data={chartData.pieData}
          title="Income vs Expenses"
          height={200}
        />
        
        <Chart
          type="line"
          data={chartData.lineData}
          title="Last 7 Days Trend"
          height={200}
        />
      </View> */}

      {/* Quick Navigation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={navigateToTransactions}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.quickActionIconText}>💰</Text>
            </View>
            <Text style={styles.quickActionLabel}>Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={navigateToBudgets}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#10b981' }]}>
              <Text style={styles.quickActionIconText}>📈</Text>
            </View>
            <Text style={styles.quickActionLabel}>Budgets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={navigateToReports}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.quickActionIconText}>📋</Text>
            </View>
            <Text style={styles.quickActionLabel}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={navigateToSavingsGoals}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#8b5cf6' }]}>
              <Text style={styles.quickActionIconText}>🎯</Text>
            </View>
            <Text style={styles.quickActionLabel}>Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={navigateToNotifications}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#ef4444' }]}>
              <Text style={styles.quickActionIconText}>🔔</Text>
            </View>
            <Text style={styles.quickActionLabel}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={navigateToAccountSharing}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#06b6d4' }]}>
              <Text style={styles.quickActionIconText}>👥</Text>
            </View>
            <Text style={styles.quickActionLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={navigateToContact}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#84cc16' }]}>
              <Text style={styles.quickActionIconText}>📧</Text>
            </View>
            <Text style={styles.quickActionLabel}>Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={navigateToProfile}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#f97316' }]}>
              <Text style={styles.quickActionIconText}>👤</Text>
            </View>
            <Text style={styles.quickActionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions' as never)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {displayTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Start by adding a transaction</Text>
          </View>
        ) : (
          displayTransactions.slice(0, 5).map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDescription, { color: colors.text }]}>{transaction.description}</Text>
                <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                ]}
              >
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
              </Text>
            </View>
          ))
          )}
          </View>
          </ScrollView>

          {/* Floating Action Button - Fixed position */}
          <FloatingActionButton 
            onPress={() => {
              setTransactionFormData({
                amount: '',
                description: '',
                category_id: '',
                type: 'expense',
                date: new Date().toISOString().split('T')[0],
                currency: userCurrency || 'USD',
              });
              setShowTransactionModal(true);
            }}
            icon="+"
          />
        </View>

        {/* Currency Selection Modal */}
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Moneda</Text>
              {getAllCurrencies().map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.modalOption,
                    { backgroundColor: colors.background },
                    selectedCurrency === curr.code && styles.modalOptionActive,
                    selectedCurrency === curr.code && { backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => {
                    setSelectedCurrency(curr.code);
                    setShowCurrencyModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    { color: colors.text },
                    selectedCurrency === curr.code && styles.modalOptionTextActive,
                    selectedCurrency === curr.code && { color: colors.primary, fontWeight: '600' }
                  ]}>
                    {curr.name} ({curr.symbol})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Transaction Modal */}
        <Modal
          visible={showTransactionModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowTransactionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Transaction</Text>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Type</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      const newType = 'income';
                      const selectedCategory = categories.find(cat => cat.id === transactionFormData.category_id);
                      const newCategoryId = (selectedCategory && selectedCategory.type === newType) 
                        ? transactionFormData.category_id 
                        : '';
                      setTransactionFormData({ ...transactionFormData, type: newType, category_id: newCategoryId });
                    }}
                    style={[
                      styles.typeButton,
                      transactionFormData.type === 'income' && styles.typeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        transactionFormData.type === 'income' && styles.typeButtonTextActive,
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const newType = 'expense';
                      const selectedCategory = categories.find(cat => cat.id === transactionFormData.category_id);
                      const newCategoryId = (selectedCategory && selectedCategory.type === newType) 
                        ? transactionFormData.category_id 
                        : '';
                      setTransactionFormData({ ...transactionFormData, type: newType, category_id: newCategoryId });
                    }}
                    style={[
                      styles.typeButton,
                      transactionFormData.type === 'expense' && styles.typeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        transactionFormData.type === 'expense' && styles.typeButtonTextActive,
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { 
                    borderColor: colors.border, 
                    backgroundColor: colors.card 
                  }]}
                  onPress={() => setShowCurrencyModal(true)}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[styles.dropdownText, { color: colors.text }]} 
                    numberOfLines={1}
                  >
                    {getAllCurrencies().find(c => c.code === transactionFormData.currency)?.name || 'USD'} ({getAllCurrencies().find(c => c.code === transactionFormData.currency)?.symbol || '$'})
                  </Text>
                  <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }]}
                  value={transactionFormData.amount}
                  onChangeText={(text) => setTransactionFormData({ ...transactionFormData, amount: text })}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }]}
                  value={transactionFormData.description}
                  onChangeText={(text) => setTransactionFormData({ ...transactionFormData, description: text })}
                  placeholder="Enter description"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { 
                    borderColor: colors.border, 
                    backgroundColor: colors.card 
                  }]}
                  onPress={() => setShowCategoryModal(true)}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[styles.dropdownText, { color: colors.text }]} 
                    numberOfLines={1}
                  >
                    {transactionFormData.category_id 
                      ? categories.find(c => c.id === transactionFormData.category_id)?.name || 'Select Category'
                      : 'None'}
                  </Text>
                  <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Date</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  }]}
                  value={transactionFormData.date}
                  onChangeText={(text) => setTransactionFormData({ ...transactionFormData, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setShowTransactionModal(false)}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const transactionData = {
                      user_id: user.id,
                      amount: parseFloat(transactionFormData.amount),
                      description: transactionFormData.description,
                      category_id: transactionFormData.category_id || null,
                      type: transactionFormData.type,
                      date: transactionFormData.date,
                      currency: transactionFormData.currency,
                    };

                    await supabase.from('transactions').insert([transactionData]);
                    setShowTransactionModal(false);
                    setTransactionFormData({
                      amount: '',
                      description: '',
                      category_id: '',
                      type: 'expense',
                      date: new Date().toISOString().split('T')[0],
                      currency: userCurrency || 'USD',
                    });
                    await loadData();
                  }}
                  style={[styles.modalButton, styles.saveButton]}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowCategoryModal(false)}
            />
            <View 
              style={[styles.modalContent, { backgroundColor: colors.card, zIndex: 1000 }]} 
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
                <TouchableOpacity 
                  onPress={() => setShowCategoryModal(false)}
                  style={styles.modalCloseButtonContainer}
                >
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                style={styles.categoryModalScrollView}
                contentContainerStyle={styles.categoryModalScrollContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    { backgroundColor: colors.background },
                    transactionFormData.category_id === '' && styles.modalOptionActive,
                    transactionFormData.category_id === '' && { backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => {
                    setTransactionFormData({ ...transactionFormData, category_id: '' });
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    { color: colors.text },
                    transactionFormData.category_id === '' && styles.modalOptionTextActive,
                    transactionFormData.category_id === '' && { color: colors.primary, fontWeight: '600' }
                  ]}>None</Text>
                </TouchableOpacity>
                {categories
                  .filter((c) => c.type === transactionFormData.type)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.modalOption,
                        { backgroundColor: colors.background },
                        transactionFormData.category_id === category.id && styles.modalOptionActive,
                        transactionFormData.category_id === category.id && { backgroundColor: colors.primary + '10' }
                      ]}
                      onPress={() => {
                        setTransactionFormData({ ...transactionFormData, category_id: category.id });
                        setShowCategoryModal(false);
                      }}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        { color: colors.text },
                        transactionFormData.category_id === category.id && styles.modalOptionTextActive,
                        transactionFormData.category_id === category.id && { color: colors.primary, fontWeight: '600' }
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingLeft: 70,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerTop: {
    marginBottom: 16,
  },
  currencyFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  currencyFilterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  currencyButtonText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  currencyButtonArrow: {
    fontSize: 10,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceCard: {
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  balancePositive: {
    backgroundColor: '#d1fae5',
  },
  balanceNegative: {
    backgroundColor: '#fee2e2',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  quickActionButton: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 15,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 48,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  categoryScrollView: {
    maxHeight: 150,
  },
  categoryOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    minHeight: 48,
    gap: 8,
    zIndex: 10,
    elevation: 5,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  categoryModalScrollView: {
    maxHeight: 300,
  },
  categoryModalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  modalCloseButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

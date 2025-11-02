import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { createClient } from '../lib/supabase';
import { Transaction, Category } from '@expense-tracker-pro/shared';
import { useNavigation } from '@react-navigation/native';
import { useCurrency } from '../hooks/useCurrency';

export default function ReportsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const defaultFilters = {
    type: 'all' as 'all' | 'income' | 'expense',
    categories: [] as string[],
    dateFrom: '',
    dateTo: '',
    currency: 'all' as string,
  };
  const [filters, setFilters] = useState({ ...defaultFilters });
  const supabase = createClient();
  const navigation = useNavigation<any>();
  const { getAllCurrencies } = useCurrency();
  const currencies = getAllCurrencies();
  const isPro = userPlan === 'pro';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Load user plan for Pro features
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();

    if (userData) {
      setUserPlan(userData.subscription_plan || 'free');
    }

    // Load transactions
    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (transactionsData) {
      setTransactions(transactionsData as Transaction[]);
    }

    // Load categories - ensure we get all categories including system ones
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('Error loading categories:', categoriesError);
    }

    if (categoriesData) {
      console.log('Loaded categories in ReportsScreen:', categoriesData.length);
      setCategories(categoriesData as Category[]);
    } else {
      console.warn('No categories found in database');
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filters.type !== 'all' && transaction.type !== filters.type) return false;
      if (filters.categories.length > 0) {
        if (!transaction.category_id || !filters.categories.includes(transaction.category_id)) {
          return false;
        }
      }
      if (filters.currency !== 'all' && transaction.currency !== filters.currency) return false;
      if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [transactions, filters]);

  const getCategorySpending = (data: Transaction[]) => {
    const expenses = data.filter((t) => t.type === 'expense');
    const categoryMap: Record<string, number> = {};

    expenses.forEach((transaction) => {
      const categoryId = transaction.category_id || 'uncategorized';
      const categoryName = transaction.category_id
        ? categories.find((c) => c.id === transaction.category_id)?.name || 'Uncategorized'
        : 'Uncategorized';

      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + transaction.amount;
    });

    return Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getMonthlySpending = (data: Transaction[]) => {
    const expenses = data.filter((t) => t.type === 'expense');
    const monthlyMap: Record<string, number> = {};

    expenses.forEach((transaction) => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      monthlyMap[month] = (monthlyMap[month] || 0) + transaction.amount;
    });

    return Object.entries(monthlyMap)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const getTotalStats = (data: Transaction[]) => {
    const totalIncome = data
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = data
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  };

  const formatAmount = (amount: number, transactionCurrency?: string) => {
    let targetCurrency = 'USD';

    if (filters.currency !== 'all') {
      targetCurrency = filters.currency;
    } else if (transactionCurrency) {
      targetCurrency = transactionCurrency;
    } else if (currencies.length > 0) {
      targetCurrency = currencies[0].code;
    }

    const currencyInfo = currencies.find((c) => c.code === targetCurrency) || currencies[0];
    const symbol = currencyInfo?.symbol || '$';

    return `${symbol}${amount.toFixed(2)}`;
  };

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.categories.length > 0 ||
    filters.currency !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  const getFiltersSummary = () => {
    const summary: string[] = [];

    if (filters.type !== 'all') {
      summary.push(filters.type === 'income' ? 'Income' : 'Expense');
    }

    if (filters.categories.length > 0) {
      const names = filters.categories
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean) as string[];
      if (names.length > 0) {
        summary.push(names.join(', '));
      }
    }

    if (filters.currency !== 'all') {
      const currencyInfo = currencies.find((c) => c.code === filters.currency);
      if (currencyInfo) {
        summary.push(currencyInfo.name);
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      summary.push(`${filters.dateFrom || 'Start'} → ${filters.dateTo || 'End'}`);
    }

    return summary.join(' • ');
  };

  const handleResetFilters = () => {
    setFilters({ ...defaultFilters });
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!isPro) {
      Alert.alert('Pro Feature', 'Export is available for Pro users only.');
      return;
    }

    Alert.alert(
      format === 'pdf' ? 'Export PDF' : 'Export Excel',
      'Open the export center to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Export',
          onPress: () => navigation.navigate('Export' as never, { defaultType: format } as never),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const stats = getTotalStats(filteredTransactions);
  const categorySpending = getCategorySpending(filteredTransactions);
  const monthlySpending = getMonthlySpending(filteredTransactions);
  const maxCategory = Math.max(...categorySpending.map((c) => c.amount), 1);
  const maxMonthly = Math.max(...monthlySpending.map((m) => m.amount), 1);

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>Financial insights and analytics</Text>
          {hasActiveFilters && (
            <View style={styles.filtersSummaryBadge}>
              <Text style={styles.filtersSummaryText}>{getFiltersSummary()}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setShowFiltersModal(true)}
          >
            <Text style={styles.headerActionIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isPro ? (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleExport('pdf')}
          >
            <Text style={styles.actionButtonIcon}>📄</Text>
            <Text style={styles.actionButtonText}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleExport('excel')}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.actionButtonText}>Export Excel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.proNotice}>
          <Text style={styles.proNoticeText}>Export is available for Pro users only.</Text>
        </View>
      )}

      {/* Summary Statistics */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statLabel}>Total Income</Text>
          <Text style={styles.statValue}>{formatAmount(stats.totalIncome)}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>{formatAmount(stats.totalExpenses)}</Text>
        </View>
      </View>

      {/* Balance Card */}
      <View
        style={[
          styles.balanceCard,
          stats.balance >= 0 ? styles.balancePositive : styles.balanceNegative,
        ]}
      >
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceValue}>{formatAmount(stats.balance)}</Text>
      </View>

      {/* Category Spending */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {categorySpending.length === 0 ? (
          <Text style={styles.emptyText}>No spending data available</Text>
        ) : (
          categorySpending.map((item) => (
            <View key={item.name} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryAmount}>{formatAmount(item.amount)}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(item.amount / maxCategory) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </View>

      {/* Monthly Spending */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Spending</Text>
        {monthlySpending.length === 0 ? (
          <Text style={styles.emptyText}>No monthly data available</Text>
        ) : (
          monthlySpending.map((item) => (
            <View key={item.month} style={styles.monthlyItem}>
              <View style={styles.monthlyHeader}>
                <Text style={styles.monthlyMonth}>{item.month}</Text>
                <Text style={styles.monthlyAmount}>{formatAmount(item.amount)}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFillOrange,
                    { width: `${(item.amount / maxMonthly) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </View>
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFiltersModal(false)}
        >
          <View
            style={styles.filterModalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFiltersModal(false)}
                style={styles.modalCloseButtonContainer}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Type</Text>
                <View style={styles.filterButtonRow}>
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'income', label: 'Income' },
                    { value: 'expense', label: 'Expense' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOptionButton,
                        filters.type === option.value && styles.filterOptionButtonActive,
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, type: option.value as 'all' | 'income' | 'expense' })
                      }
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filters.type === option.value && styles.filterOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Date Range</Text>
                <View style={styles.dateInputs}>
                  <TextInput
                    style={styles.dateInput}
                    value={filters.dateFrom}
                    onChangeText={(text) => setFilters({ ...filters, dateFrom: text })}
                    placeholder="YYYY-MM-DD"
                  />
                  <TextInput
                    style={styles.dateInput}
                    value={filters.dateTo}
                    onChangeText={(text) => setFilters({ ...filters, dateTo: text })}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Category</Text>
                <ScrollView style={styles.optionList} nestedScrollEnabled>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      filters.categories.length === 0 && styles.optionItemActive,
                    ]}
                    onPress={() => setFilters({ ...filters, categories: [] })}
                  >
                    <Text
                      style={[
                        styles.optionItemText,
                        filters.categories.length === 0 && styles.optionItemTextActive,
                      ]}
                    >
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => {
                    const isSelected = filters.categories.includes(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemActive,
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setFilters({
                              ...filters,
                              categories: filters.categories.filter((id) => id !== category.id),
                            });
                          } else {
                            setFilters({
                              ...filters,
                              categories: [...filters.categories, category.id],
                            });
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.optionItemText,
                            isSelected && styles.optionItemTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Currency Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Currency</Text>
                <ScrollView style={styles.optionList} nestedScrollEnabled>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      filters.currency === 'all' && styles.optionItemActive,
                    ]}
                    onPress={() => setFilters({ ...filters, currency: 'all' })}
                  >
                    <Text
                      style={[
                        styles.optionItemText,
                        filters.currency === 'all' && styles.optionItemTextActive,
                      ]}
                    >
                      All Currencies
                    </Text>
                  </TouchableOpacity>
                  {currencies.map((curr) => (
                    <TouchableOpacity
                      key={curr.code}
                      style={[
                        styles.optionItem,
                        filters.currency === curr.code && styles.optionItemActive,
                      ]}
                      onPress={() => setFilters({ ...filters, currency: curr.code })}
                    >
                      <Text
                        style={[
                          styles.optionItemText,
                          filters.currency === curr.code && styles.optionItemTextActive,
                        ]}
                      >
                        {curr.name} ({curr.symbol})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonGhost}
                onPress={() => {
                  handleResetFilters();
                  setShowFiltersModal(false);
                }}
              >
                <Text style={styles.modalButtonGhostText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
    padding: 20,
    paddingLeft: 70,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerActionIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  filtersSummaryBadge: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignSelf: 'flex-start',
  },
  filtersSummaryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1d4ed8',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 15,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 16,
    color: '#fff',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  proNotice: {
    marginHorizontal: 15,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
  },
  proNoticeText: {
    color: '#92400e',
    fontSize: 13,
    textAlign: 'center',
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
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  monthlyItem: {
    marginBottom: 15,
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthlyMonth: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  monthlyAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressFillOrange: {
    height: '100%',
    backgroundColor: '#f97316',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCloseButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  filterSection: {
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filterButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterOptionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  filterOptionButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  dateInputs: {
    gap: 10,
  },
  dateInput: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  optionList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 4,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  optionItemText: {
    fontSize: 14,
    color: '#374151',
  },
  optionItemTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButtonGhost: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalButtonGhostText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

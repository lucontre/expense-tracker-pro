import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { createClient } from '../lib/supabase';
import { Transaction, Category } from '@expense-tracker-pro/shared';
import { useCurrency } from '../hooks/useCurrency';
import { FloatingActionButton } from '../components/FloatingActionButton';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD' as 'USD' | 'MXN' | 'GTQ' | 'EUR',
  });
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    categories: [] as string[],
    dateFrom: '',
    dateTo: '',
  });
  const supabase = createClient();
  const { formatCurrency, getAllCurrencies, currency: userCurrency } = useCurrency();

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

    // Load user plan
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
      setAllTransactions(transactionsData as Transaction[]);
      applyFilters(transactionsData as Transaction[]);
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
      console.log('Loaded categories:', categoriesData.length);
      console.log('Categories by type:', {
        income: categoriesData.filter(c => c.type === 'income').map(c => c.name),
        expense: categoriesData.filter(c => c.type === 'expense').map(c => c.name),
      });
      setCategories(categoriesData as Category[]);
    } else {
      console.warn('No categories found in database');
    }

    setLoading(false);
  };

  const applyFilters = (transactionsList: Transaction[]) => {
    let filtered = [...transactionsList];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter((t) => t.category_id && filters.categories.includes(t.category_id));
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((t) => t.date <= filters.dateTo);
    }

    setTransactions(filtered);
  };

  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFilters(allTransactions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Clear category selection when type changes if current category doesn't match the new type
  useEffect(() => {
    if (formData.category_id) {
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      if (selectedCategory && selectedCategory.type !== formData.type) {
        console.log('Clearing category because type changed:', {
          oldType: selectedCategory.type,
          newType: formData.type,
          categoryName: selectedCategory.name,
        });
        setFormData(prev => ({ ...prev, category_id: '' }));
      }
    }
  }, [formData.type, categories, formData.category_id]);

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.categories.length > 0 ||
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

    if (filters.dateFrom || filters.dateTo) {
      summary.push(`${filters.dateFrom || 'Start'} → ${filters.dateTo || 'End'}`);
    }

    return summary.join(' • ');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const transactionData = {
      user_id: user.id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category_id: formData.category_id || null,
      type: formData.type,
      date: formData.date,
      currency: formData.currency,
    };

    if (editingTransaction) {
      await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', editingTransaction.id);
    } else {
      await supabase.from('transactions').insert([transactionData]);
    }

    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      amount: '',
      description: '',
      category_id: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      currency: userCurrency || 'USD',
    });
    await loadData();
  };

  const handleEdit = (transaction: Transaction) => {
    console.log('Editing transaction:', {
      id: transaction.id,
      type: transaction.type,
      category_id: transaction.category_id,
      currency: transaction.currency,
      categoriesLoaded: categories.length,
    });
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category_id: transaction.category_id || '',
      type: transaction.type,
      date: transaction.date,
      currency: (transaction.currency as 'USD' | 'MXN' | 'GTQ' | 'EUR') || userCurrency || 'USD',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('transactions').delete().eq('id', id);
          await loadData();
        },
      },
    ]);
  };

  const openModal = () => {
    setEditingTransaction(null);
    const defaultCurrency = userCurrency || 'USD';
    setFormData({
      amount: '',
      description: '',
      category_id: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      currency: defaultCurrency as 'USD' | 'MXN' | 'GTQ' | 'EUR',
    });
    console.log('=== Opening transaction modal ===');
    console.log('Categories loaded:', categories.length);
    console.log('Expense categories:', categories.filter(c => c.type === 'expense').length);
    console.log('Income categories:', categories.filter(c => c.type === 'income').length);
    console.log('Default currency:', defaultCurrency);
    console.log('FormData initialized with currency:', defaultCurrency);
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Transactions</Text>
          {hasActiveFilters && (
            <View style={styles.filtersSummaryBadge}>
              <Text style={styles.filtersSummaryText}>{getFiltersSummary()}</Text>
            </View>
          )}
        </View>
        {userPlan === 'pro' && (
          <TouchableOpacity 
            onPress={() => setShowFiltersModal(true)}
            style={styles.headerFilterButton}
          >
            <Text style={styles.headerFilterIcon}>🔍</Text>
          </TouchableOpacity>
        )}
      </View>

        {/* Transactions List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={
            transactions.length === 0 
              ? [styles.listContent, styles.listContentEmpty]
              : styles.listContent
          }
          {...(Platform.OS === 'web'
            ? {}
            : {
                refreshControl: (
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                ),
              })}
        >
          {transactions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>💰</Text>
                </View>
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>Tap the "+" button to create your first transaction</Text>
              </View>
            </View>
          ) : (
            transactions.map((transaction) => (
              <TouchableOpacity key={transaction.id} onPress={() => handleEdit(transaction)}>
                <View style={styles.transactionCard}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.transactionActions}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                      ]}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDelete(transaction.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Floating Action Button - Fixed position */}
      <FloatingActionButton onPress={openModal} />

      {/* Filters Modal */}
      {userPlan === 'pro' && (
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
            <View style={styles.modalContent}>
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
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {/* Type Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Type</Text>
                  <View style={styles.filterButtons}>
                    <TouchableOpacity
                      onPress={() => setFilters({ ...filters, type: 'all' })}
                      style={[
                        styles.filterButtonOption,
                        filters.type === 'all' && styles.filterButtonOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterButtonOptionText,
                          filters.type === 'all' && styles.filterButtonOptionTextActive,
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setFilters({ ...filters, type: 'income' })}
                      style={[
                        styles.filterButtonOption,
                        filters.type === 'income' && styles.filterButtonOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterButtonOptionText,
                          filters.type === 'income' && styles.filterButtonOptionTextActive,
                        ]}
                      >
                        Income
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setFilters({ ...filters, type: 'expense' })}
                      style={[
                        styles.filterButtonOption,
                        filters.type === 'expense' && styles.filterButtonOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterButtonOptionText,
                          filters.type === 'expense' && styles.filterButtonOptionTextActive,
                        ]}
                      >
                        Expense
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Category</Text>
                  <ScrollView 
                    style={styles.categoryFilterScrollView}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    <TouchableOpacity
                      onPress={() => setFilters({ ...filters, categories: [] })}
                      style={[
                        styles.filterButtonOption,
                        styles.filterButtonOptionFull,
                        filters.categories.length === 0 && styles.filterButtonOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterButtonOptionText,
                          filters.categories.length === 0 && styles.filterButtonOptionTextActive,
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
                          style={[
                            styles.filterButtonOption,
                            styles.filterButtonOptionFull,
                            isSelected && styles.filterButtonOptionActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterButtonOptionText,
                              isSelected && styles.filterButtonOptionTextActive,
                            ]}
                          >
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Date Range Filters */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Date Range</Text>
                  <View style={styles.dateRangeContainer}>
                    <View style={styles.dateInputGroup}>
                      <Text style={styles.dateLabel}>From</Text>
                      <TextInput
                        style={styles.filterInput}
                        value={filters.dateFrom}
                        onChangeText={(text) => setFilters({ ...filters, dateFrom: text })}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <View style={styles.dateInputGroup}>
                      <Text style={styles.dateLabel}>To</Text>
                      <TextInput
                        style={styles.filterInput}
                        value={filters.dateTo}
                        onChangeText={(text) => setFilters({ ...filters, dateTo: text })}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setFilters({
                      type: 'all',
                      categories: [],
                      dateFrom: '',
                      dateTo: '',
                    });
                  }}
                  style={[styles.modalButton, styles.resetButton]}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowFiltersModal(false)}
                  style={[styles.modalButton, styles.applyButton]}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          <View 
            style={styles.modalContent} 
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowModal(false)}
                style={styles.modalCloseButtonContainer}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      const newType = 'income';
                      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
                      // Clear category if it doesn't match the new type
                      const newCategoryId = (selectedCategory && selectedCategory.type === newType) 
                        ? formData.category_id 
                        : '';
                      console.log('Changing type to income:', {
                        hadCategory: !!formData.category_id,
                        categoryMatches: selectedCategory?.type === newType,
                        newCategoryId,
                      });
                      setFormData({ ...formData, type: newType, category_id: newCategoryId });
                    }}
                    style={[
                      styles.typeButton,
                      formData.type === 'income' && styles.typeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === 'income' && styles.typeButtonTextActive,
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const newType = 'expense';
                      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
                      // Clear category if it doesn't match the new type
                      const newCategoryId = (selectedCategory && selectedCategory.type === newType) 
                        ? formData.category_id 
                        : '';
                      console.log('Changing type to expense:', {
                        hadCategory: !!formData.category_id,
                        categoryMatches: selectedCategory?.type === newType,
                        newCategoryId,
                      });
                      setFormData({ ...formData, type: newType, category_id: newCategoryId });
                    }}
                    style={[
                      styles.typeButton,
                      formData.type === 'expense' && styles.typeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === 'expense' && styles.typeButtonTextActive,
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Currency Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Currency</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => {
                    console.log('Opening currency modal, current currency:', formData.currency);
                    setShowCurrencyModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText} numberOfLines={1}>
                    {getAllCurrencies().find(c => c.code === formData.currency)?.name || 'USD'} ({getAllCurrencies().find(c => c.code === formData.currency)?.symbol || '$'})
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Amount Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Enter description"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Category Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    console.log('Opening category modal:', {
                      categoriesCount: categories.length,
                      type: formData.type,
                      filteredCategories: categories.filter(c => c.type === formData.type).map(c => c.name),
                    });
                    setShowCategoryModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText} numberOfLines={1}>
                    {formData.category_id 
                      ? categories.find(c => c.id === formData.category_id)?.name || 'Select Category'
                      : 'None'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Date Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
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
            style={[styles.modalContent, { zIndex: 1000 }]} 
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
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
                  formData.category_id === '' && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setFormData({ ...formData, category_id: '' });
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  formData.category_id === '' && styles.modalOptionTextActive,
                ]}>None</Text>
              </TouchableOpacity>
              {categories.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Loading categories...</Text>
                </View>
              ) : (() => {
                const filteredCategories = categories.filter((c) => c.type === formData.type);
                console.log('Categories filtered for modal:', {
                  type: formData.type,
                  totalCategories: categories.length,
                  filteredCount: filteredCategories.length,
                  filteredNames: filteredCategories.map(c => c.name),
                  allCategoryNames: categories.map(c => `${c.name} (${c.type})`),
                });
                
                if (filteredCategories.length === 0) {
                  return (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#666', fontSize: 14 }}>
                        No {formData.type} categories found
                      </Text>
                      <Text style={{ color: '#999', fontSize: 12, marginTop: 5 }}>
                        Total categories: {categories.length}
                      </Text>
                    </View>
                  );
                }
                
                return filteredCategories
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalOption,
                      formData.category_id === category.id && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, category_id: category.id });
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      formData.category_id === category.id && styles.modalOptionTextActive,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                  ));
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowCurrencyModal(false)}
          />
          <View 
            style={[styles.modalContent, { zIndex: 1000 }]} 
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity 
                onPress={() => setShowCurrencyModal(false)}
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
              {getAllCurrencies().map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.modalOption,
                    formData.currency === curr.code && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, currency: curr.code as 'USD' | 'MXN' | 'GTQ' | 'EUR' });
                    setShowCurrencyModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.currency === curr.code && styles.modalOptionTextActive,
                  ]}>
                    {curr.name} ({curr.symbol})
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

// Helper function to convert shadow styles to boxShadow for web
const shadowToBoxShadow = (shadowColor: string, shadowOffset: { width: number; height: number }, shadowOpacity: number, shadowRadius: number) => {
  if (Platform.OS === 'web') {
    const rgba = shadowColor === '#000' 
      ? `rgba(0, 0, 0, ${shadowOpacity})` 
      : shadowColor === '#3b82f6'
      ? `rgba(59, 130, 246, ${shadowOpacity})`
      : shadowColor;
    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${rgba}`,
    } as any;
  }
  return {};
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    overflow: 'visible',
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
    ...(Platform.OS === 'web' ? shadowToBoxShadow('#000', { width: 0, height: 1 }, 0.05, 2) : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    }),
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerFilterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? shadowToBoxShadow('#3b82f6', { width: 0, height: 2 }, 0.3, 4) : {
      shadowColor: '#3b82f6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  headerFilterIcon: {
    fontSize: 18,
    color: '#fff',
  },
  filtersSummaryBadge: {
    marginTop: 8,
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: 15,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  transactionActions: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
    width: '100%',
    paddingVertical: 60,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    width: '100%',
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    flex: 1,
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
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
    flexGrow: 1,
    minHeight: 600,
  },
  formGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
    letterSpacing: 0.1,
    width: '100%',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
    color: '#1a1a1a',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    ...(Platform.OS === 'web' ? shadowToBoxShadow('#3b82f6', { width: 0, height: 2 }, 0.2, 4) : {
      shadowColor: '#3b82f6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
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
    width: '100%',
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
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
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButtonOption: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  filterButtonOptionFull: {
    flex: 0,
    width: '100%',
    marginBottom: 8,
  },
  filterButtonOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    ...(Platform.OS === 'web' ? shadowToBoxShadow('#3b82f6', { width: 0, height: 2 }, 0.2, 4) : {
      shadowColor: '#3b82f6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  filterButtonOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  filterButtonOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryFilterScrollView: {
    maxHeight: 220,
  },
  dateRangeContainer: {
    gap: 14,
  },
  dateInputGroup: {
    width: '100%',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  filterInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
  },
  resetButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#3b82f6',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

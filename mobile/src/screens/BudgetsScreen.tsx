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
import { Budget, Category } from '@expense-tracker-pro/shared';

type BudgetRow = {
  id: string;
  user_id: string;
  category: string | null;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
};

const mapBudget = (row: BudgetRow): Budget => ({
  id: row.id,
  userId: row.user_id,
  category: row.category ?? '',
  amount: row.amount,
  period: row.period,
  startDate: row.start_date ?? '',
  endDate: row.end_date ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
  });
  const supabase = createClient();

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

    // Load budgets
    const { data: budgetsData } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('amount', { ascending: false });

    if (budgetsData) {
      const mappedBudgets = (budgetsData as BudgetRow[]).map(mapBudget);
      setBudgets(mappedBudgets);
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
      console.log('Loaded categories in BudgetsScreen:', categoriesData.length);
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

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const budgetData = {
      user_id: user.id,
      category: formData.category || null,
      amount: parseFloat(formData.amount),
      period: formData.period,
    };

    if (editingBudget) {
      await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', editingBudget.id);
    } else {
      await supabase.from('budgets').insert([budgetData]);
    }

    setShowModal(false);
    setEditingBudget(null);
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
    });
    await loadData();
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category || '',
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Budget', 'Are you sure you want to delete this budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('budgets').delete().eq('id', id);
          await loadData();
        },
      },
    ]);
  };

  const openModal = () => {
    setEditingBudget(null);
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
    });
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity onPress={openModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        {...(Platform.OS === 'web'
          ? {}
          : {
              refreshControl: (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ),
            })}
      >
        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No budgets set yet</Text>
            <Text style={styles.emptySubtext}>Tap "+ Add" to create your first budget</Text>
          </View>
        ) : (
          budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.category);
            return (
              <TouchableOpacity key={budget.id} onPress={() => handleEdit(budget)}>
                <View style={styles.budgetCard}>
                  <View style={styles.budgetInfo}>
                    <Text style={styles.budgetCategory}>
                      {category ? category.name : 'All Categories'}
                    </Text>
                    <Text style={styles.budgetPeriod}>
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.budgetActions}>
                    <Text style={styles.budgetAmount}>${budget.amount.toFixed(2)}</Text>
                    <TouchableOpacity
                      onPress={() => handleDelete(budget.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingBudget ? 'Edit Budget' : 'Add Budget'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Period</Text>
              <View style={styles.periodButtons}>
                {(['weekly', 'monthly', 'yearly'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setFormData({ ...formData, period })}
                    style={[
                      styles.periodButton,
                      formData.period === period && styles.periodButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        formData.period === period && styles.periodButtonTextActive,
                      ]}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>

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
    alignItems: 'center',
    padding: 20,
    paddingLeft: 70,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  list: {
    flex: 1,
    padding: 15,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  budgetPeriod: {
    fontSize: 12,
    color: '#666',
  },
  budgetActions: {
    alignItems: 'flex-end',
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 5,
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
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
    backgroundColor: '#fff',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
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
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

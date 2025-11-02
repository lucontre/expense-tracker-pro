'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Transaction, CreateTransactionInput } from '@expense-tracker-pro/shared';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslatedCategoryName } from '@/lib/categoryTranslations';
import { LoadingButton } from '@/components/Loading';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  user, 
  editingTransaction 
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD' as 'USD' | 'MXN' | 'GTQ' | 'EUR',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{id: string, name: string, type: string}[]>([]);

  // Debug categories state
  useEffect(() => {
    console.log('Categories state updated:', categories);
  }, [categories]);

  const { language } = useLanguage();
  const { currency, getAllCurrencies /* , formatCurrency */ } = useCurrency();
  const supabase = createClient();

  const translations = {
    en: {
      title: editingTransaction ? 'Edit Transaction' : 'Add Transaction',
      amount: 'Amount',
      description: 'Description',
      category: 'Category',
      type: 'Type',
      currency: 'Currency',
      date: 'Date',
      income: 'Income',
      expense: 'Expense',
      save: 'Save',
      cancel: 'Cancel',
      saving: 'Saving...',
      error: 'Error saving transaction',
      success: 'Transaction saved successfully',
      amountRequired: 'Amount is required',
      descriptionRequired: 'Description is required',
      categoryRequired: 'Category is required',
    },
    es: {
      title: editingTransaction ? 'Editar Transacción' : 'Agregar Transacción',
      amount: 'Cantidad',
      description: 'Descripción',
      category: 'Categoría',
      type: 'Tipo',
      currency: 'Moneda',
      date: 'Fecha',
      income: 'Ingreso',
      expense: 'Gasto',
      save: 'Guardar',
      cancel: 'Cancelar',
      saving: 'Guardando...',
      error: 'Error al guardar la transacción',
      success: 'Transacción guardada exitosamente',
      amountRequired: 'La cantidad es requerida',
      descriptionRequired: 'La descripción es requerida',
      categoryRequired: 'La categoría es requerida',
    }
  };

  const t = translations[language];

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Set form data when editing
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        amount: editingTransaction.amount.toString(),
        description: editingTransaction.description,
        category_id: editingTransaction.category_id || '',
        type: editingTransaction.type,
        date: editingTransaction.date,
        currency: (editingTransaction.currency as 'USD' | 'MXN' | 'GTQ' | 'EUR') || currency || 'USD',
      });
    } else {
      setFormData({
        amount: '',
        description: '',
        category_id: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        currency: currency || 'USD',
      });
    }
  }, [editingTransaction, currency]);

  // Clear category selection when type changes if current category doesn't match the new type
  useEffect(() => {
    if (formData.category_id) {
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      if (selectedCategory && selectedCategory.type !== formData.type) {
        setFormData(prev => ({ ...prev, category_id: '' }));
      }
    }
  }, [formData.type, categories]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, type')
        .order('name');

      console.log('Categories query result:', { data, error });

      if (error) {
        console.error('Error loading categories:', error);
        // Don't use fallback categories with empty IDs
        // Instead, show an error message
        setError('Error loading categories. Please refresh the page.');
        return;
      }

      if (data) {
        console.log('Setting categories from database:', data);
        setCategories(data);
      } else {
        console.log('No data returned, showing error');
        setError('No categories found. Please check your database setup.');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error loading categories. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError(t.amountRequired);
      return;
    }
    if (!formData.description.trim()) {
      setError(t.descriptionRequired);
      return;
    }
    // Note: category_id is optional, we'll allow NULL values

    setLoading(true);
    setError('');

    // Define transactionData outside try block so it's accessible in catch
    const transactionData: CreateTransactionInput = {
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category_id: formData.category_id && formData.category_id.trim() !== '' ? formData.category_id : undefined, // Only use valid UUIDs
      type: formData.type,
      date: formData.date,
      currency: formData.currency,
    };

    try {
      console.log('Attempting to save transaction with data:', transactionData);
      console.log('User ID:', user.id);
      
      // Check authentication
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log('Auth user:', authUser);
      console.log('Auth error:', authError);
      console.log('User ID matches auth.uid():', user.id === authUser?.id);

      if (editingTransaction) {
        console.log('Updating existing transaction:', editingTransaction.id);
        // Update existing transaction
        const { error: updateError } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);

        console.log('Update result:', { updateError });

        if (updateError) {
          throw updateError;
        }
      } else {
        console.log('Creating new transaction');
        // Create new transaction
        const insertData = {
          ...transactionData,
          user_id: user.id,
          created_by_user_id: user.id, // Track who created the transaction
        };
        console.log('Insert data:', insertData);
        
        const { error: insertError } = await supabase
          .from('transactions')
          .insert([insertData]);

        console.log('Insert result:', { insertError });

        if (insertError) {
          throw insertError;
        }
      }

      // Reset form before closing
      setFormData({
        amount: '',
        description: '',
        category_id: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        currency: currency || 'USD',
      });
      setError('');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Transaction error:', err);
      console.error('Transaction data that failed:', transactionData);
      console.error('Error details:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
      
      // Show more specific error message
      let errorMessage = t.error;
      if (err.message) {
        errorMessage = err.message;
      } else if (err.details) {
        errorMessage = err.details;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setFormData({
      amount: '',
      description: '',
      category_id: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      currency: currency || 'USD',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {t.title}
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-900 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.amount}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-900 dark:text-slate-400">
                  {getAllCurrencies().find(c => c.code === formData.currency)?.symbol || '$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.description}
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'es' ? 'Descripción de la transacción' : 'Transaction description'}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.category}
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{language === 'es' ? 'Seleccionar categoría' : 'Select category'}</option>
                {filteredCategories.map((category, index) => (
                  <option key={category.id || `category-${index}`} value={category.id}>
                    {getTranslatedCategoryName(category.name, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.type}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newType = 'income';
                    const selectedCategory = categories.find(cat => cat.id === formData.category_id);
                    const newCategoryId = (selectedCategory && selectedCategory.type === newType) 
                      ? formData.category_id 
                      : '';
                    setFormData({ ...formData, type: newType, category_id: newCategoryId });
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    formData.type === 'income'
                      ? 'shadow-md hover:shadow-lg'
                      : 'bg-slate-100 border border-slate-300 hover:bg-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'
                  }`}
                  style={formData.type === 'income' 
                    ? { 
                        backgroundColor: '#2EB873', 
                        color: '#ffffff', 
                        border: '2px solid #2EB873',
                        boxShadow: '0 2px 6px rgba(46, 184, 115, 0.4)'
                      } 
                    : { 
                        color: '#1E1E21',
                        fontWeight: '500'
                      }}
                >
                  {t.income}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newType = 'expense';
                    const selectedCategory = categories.find(cat => cat.id === formData.category_id);
                    const newCategoryId = (selectedCategory && selectedCategory.type === newType) 
                      ? formData.category_id 
                      : '';
                    setFormData({ ...formData, type: newType, category_id: newCategoryId });
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    formData.type === 'expense'
                      ? 'shadow-md hover:shadow-lg'
                      : 'bg-slate-100 border border-slate-300 hover:bg-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'
                  }`}
                  style={formData.type === 'expense' 
                    ? { 
                        backgroundColor: '#C55A5A', 
                        color: '#ffffff',
                        border: '2px solid #C55A5A',
                        boxShadow: '0 2px 6px rgba(197, 90, 90, 0.4)'
                      } 
                    : { 
                        color: '#1E1E21',
                        fontWeight: '500'
                      }}
                >
                  {t.expense}
                </button>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.currency}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'MXN' | 'GTQ' | 'EUR' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getAllCurrencies().map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {language === 'es' ? curr.nameEs : curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.date}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 font-medium transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? <LoadingButton text={t.saving} /> : t.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

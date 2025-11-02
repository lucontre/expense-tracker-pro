'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category } from '@expense-tracker-pro/shared';
import { canCreateCustomCategories } from '@/lib/plan-limits';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslatedCategoryName, getTranslatedCategoryDescription } from '@/lib/categoryTranslations';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function CategoriesPage() {
  // const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [canCreateCustom, setCanCreateCustom] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    color: '#6B7280',
    type: 'expense' as 'income' | 'expense',
  });
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();

  // Translations
  const translations = {
    en: {
      title: 'Categories',
      subtitle: 'Organize your spending with custom categories',
      addCategory: 'Add Category',
      backToDashboard: 'Back to Dashboard',
      noCategories: 'No categories yet. Click "Add Category" to create one.',
      customCategoriesNotice: 'Custom categories are a Pro feature.',
      upgradePrompt: 'Upgrade to Pro to create unlimited custom categories',
      name: 'Name',
      description: 'Description',
      type: 'Type',
      icon: 'Icon',
      color: 'Color',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      income: 'income',
      expense: 'expense',
      save: 'Save',
      cancel: 'Cancel',
      addNewCategory: 'Add New Category',
      editCategory: 'Edit Category',
      namePlaceholder: 'Enter category name',
      descriptionPlaceholder: 'Enter description (optional)',
      selectIcon: 'Select an icon',
      selectColor: 'Select a color',
    },
    es: {
      title: 'Categorías',
      subtitle: 'Organiza tus gastos con categorías personalizadas',
      addCategory: 'Agregar Categoría',
      backToDashboard: 'Volver al Dashboard',
      noCategories: 'Aún no hay categorías. Haz clic en "Agregar Categoría" para crear una.',
      customCategoriesNotice: 'Las categorías personalizadas son una función Pro.',
      upgradePrompt: 'Actualiza a Pro para crear categorías personalizadas ilimitadas',
      name: 'Nombre',
      description: 'Descripción',
      type: 'Tipo',
      icon: 'Icono',
      color: 'Color',
      actions: 'Acciones',
      edit: 'Editar',
      delete: 'Eliminar',
      income: 'ingreso',
      expense: 'gasto',
      save: 'Guardar',
      cancel: 'Cancelar',
      addNewCategory: 'Agregar Nueva Categoría',
      editCategory: 'Editar Categoría',
      namePlaceholder: 'Ingresa el nombre de la categoría',
      descriptionPlaceholder: 'Ingresa descripción (opcional)',
      selectIcon: 'Selecciona un icono',
      selectColor: 'Selecciona un color',
    }
  };

  const t = translations[language];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
        // setUser(user);
        await loadCategories();
        await checkCustomPermission();
        setLoading(false);
    };

    checkUser();
  }, [router, supabase.auth]);

  const loadCategories = async () => {
    console.log('Loading categories...');
    const { data: categoriesData, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    console.log('Categories query result:', { categoriesData, error });

    if (error) {
      console.error('Error loading categories:', error);
      return;
    }

    if (categoriesData) {
      console.log('Setting categories:', categoriesData);
      setCategories(categoriesData as Category[]);
    } else {
      console.log('No categories data returned');
    }
  };

  const checkCustomPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const permission = await canCreateCustomCategories(user.id);
    setCanCreateCustom(permission);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateCustom && !editingCategory) {
      alert('Custom categories are only available for Pro users. Please upgrade your plan.');
      return;
    }

    const categoryData = {
      ...formData,
      is_system: false,
    };

    if (editingCategory) {
      // Update category
      await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
    } else {
      // Create category
      await supabase.from('categories').insert([categoryData]);
    }

    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📦',
      color: '#6B7280',
      type: 'expense',
    });
    await loadCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📦',
      color: category.color || '#6B7280',
      type: category.type || 'expense',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await supabase.from('categories').delete().eq('id', id);
      await loadCategories();
    }
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📦',
      color: '#6B7280',
      type: 'expense',
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {t.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>
                 <div className="flex gap-3">
                   <Link
                     href="/dashboard"
                     className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                   >
                     {t.backToDashboard}
                   </Link>
                   <button
                     onClick={openModal}
                     disabled={!canCreateCustom}
                     className={`rounded-lg px-4 py-2 font-semibold text-white transition-all ${
                       canCreateCustom
                         ? 'bg-violet-600 hover:bg-violet-700 shadow-sm hover:shadow-md'
                         : 'bg-slate-400 cursor-not-allowed'
                     }`}
                   >
                     {t.addCategory}
                   </button>
                 </div>
        </div>

        {/* Custom Categories Notice */}
        {!canCreateCustom && (
          <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  {t.customCategoriesNotice}
                  <Link href="/pricing" className="ml-2 font-semibold underline hover:text-blue-900 dark:hover:text-blue-100">
                    {t.upgradePrompt}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-12">
              <p className="text-lg font-medium">{t.noCategories}</p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {category.is_system ? getTranslatedCategoryName(category.name, language) : category.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      category.type === 'income'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
                    }`}>
                      {category.type === 'income' ? t.income : t.expense}
                    </span>
                  </div>
                </div>
                {category.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {category.is_system ? getTranslatedCategoryDescription(category.description, language) : category.description}
                  </p>
                )}
                {!category.is_system && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
                    >
                      {t.delete}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {editingCategory ? t.editCategory : t.addNewCategory}
            </h2>
                   <form onSubmit={handleSubmit}>
                     <div className="space-y-4">
                       <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                           {t.name}
                         </label>
                         <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                           placeholder={t.namePlaceholder}
                           required
                         />
                       </div>

                       <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                           {t.type}
                         </label>
                         <select
                           value={formData.type}
                           onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                           className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                           required
                         >
                           <option value="income">{t.income}</option>
                           <option value="expense">{t.expense}</option>
                         </select>
                       </div>

                       <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                           {t.icon}
                         </label>
                         <div className="mt-1 flex gap-2">
                           <input
                             type="text"
                             value={formData.icon}
                             onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                             className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                             placeholder="📦"
                             maxLength={2}
                           />
                           <div className="flex items-center justify-center w-12 h-10 rounded-lg border border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-700">
                             <span className="text-lg">{formData.icon}</span>
                           </div>
                         </div>
                         <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                           Use emojis or symbols (max 2 characters)
                         </p>
                       </div>

                       <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                           {t.color}
                         </label>
                         <div className="mt-1 flex gap-2">
                           <input
                             type="color"
                             value={formData.color}
                             onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                             className="h-10 w-16 rounded-lg border border-zinc-300 dark:border-zinc-600"
                           />
                           <input
                             type="text"
                             value={formData.color}
                             onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                             className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                             placeholder="#6B7280"
                           />
                         </div>
                       </div>

                       <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                           {t.description}
                         </label>
                         <textarea
                           value={formData.description}
                           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                           className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                           rows={3}
                         />
                       </div>
                     </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}

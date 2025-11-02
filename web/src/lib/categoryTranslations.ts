// System categories translations
export const systemCategoriesTranslations = {
  en: {
    'Bills & Utilities': 'Bills & Utilities',
    'Bills': 'Bills',
    'Business': 'Business',
    'Education': 'Education',
    'Entertainment': 'Entertainment',
    'Food & Dining': 'Food & Dining',
    'Food': 'Food',
    'Freelance': 'Freelance',
    'Gift': 'Gift',
    'Healthcare': 'Healthcare',
    'Investment': 'Investment',
    'Other Expense': 'Other Expense',
    'Other Income': 'Other Income',
    'Other': 'Other',
    'Refund': 'Refund',
    'Salary': 'Salary',
    'Shopping': 'Shopping',
    'Transportation': 'Transportation',
    'Transport': 'Transport',
    'Travel': 'Travel',
  },
  es: {
    'Bills & Utilities': 'Facturas y Servicios',
    'Bills': 'Facturas',
    'Business': 'Negocios',
    'Education': 'Educación',
    'Entertainment': 'Entretenimiento',
    'Food & Dining': 'Comida y Restaurantes',
    'Food': 'Comida',
    'Freelance': 'Trabajo Independiente',
    'Gift': 'Regalos',
    'Healthcare': 'Salud',
    'Investment': 'Inversiones',
    'Other Expense': 'Otros Gastos',
    'Other Income': 'Otros Ingresos',
    'Other': 'Otros',
    'Refund': 'Reembolso',
    'Salary': 'Salario',
    'Shopping': 'Compras',
    'Transportation': 'Transporte',
    'Transport': 'Transporte',
    'Travel': 'Viajes',
  }
};

// System categories descriptions translations
export const systemCategoriesDescriptionsTranslations = {
  en: {
    'Bills & Utilities': 'Electricity, water, internet',
    'Bills': 'Electricity, water, internet',
    'Business': 'Business income and sales',
    'Education': 'Courses, books',
    'Entertainment': 'Movies, games, streaming',
    'Food & Dining': 'Restaurants, groceries',
    'Food': 'Restaurants, groceries',
    'Freelance': 'Freelance work income',
    'Gift': 'Received gifts',
    'Healthcare': 'Medical expenses',
    'Investment': 'Investment returns',
    'Other Expense': 'Other expenses',
    'Other Income': 'Other income sources',
    'Other': 'Other expenses',
    'Refund': 'Refunds and reimbursements',
    'Salary': 'Monthly salary income',
    'Shopping': 'Clothing, electronics',
    'Transportation': 'Gas, public transport',
    'Transport': 'Gas, public transport',
    'Travel': 'Hotels, flights, vacation',
  },
  es: {
    'Bills & Utilities': 'Electricidad, agua, internet',
    'Bills': 'Electricidad, agua, internet',
    'Business': 'Ingresos y ventas de negocios',
    'Education': 'Cursos, libros',
    'Entertainment': 'Películas, juegos, streaming',
    'Food & Dining': 'Restaurantes, supermercado',
    'Food': 'Restaurantes, supermercado',
    'Freelance': 'Ingresos por trabajo independiente',
    'Gift': 'Regalos recibidos',
    'Healthcare': 'Gastos médicos',
    'Investment': 'Retornos de inversión',
    'Other Expense': 'Otros gastos',
    'Other Income': 'Otras fuentes de ingresos',
    'Other': 'Otros gastos',
    'Refund': 'Reembolsos y reembolsos',
    'Salary': 'Ingresos salariales mensuales',
    'Shopping': 'Ropa, electrónicos',
    'Transportation': 'Gasolina, transporte público',
    'Transport': 'Gasolina, transporte público',
    'Travel': 'Hoteles, vuelos, vacaciones',
  }
};

// Helper function to get translated category name
export function getTranslatedCategoryName(categoryName: string, language: 'en' | 'es'): string {
  // Try exact match first
  const translations = systemCategoriesTranslations[language] as Record<string, string>;
  if (translations[categoryName]) {
    return translations[categoryName];
  }
  
  // Try case-insensitive match
  const normalizedName = categoryName.trim();
  for (const [key, value] of Object.entries(translations)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return value;
    }
  }
  
  // No translation found, return original
  return categoryName;
}

// Helper function to get translated category description
export function getTranslatedCategoryDescription(description: string, language: 'en' | 'es'): string {
  const translations = systemCategoriesDescriptionsTranslations[language] as Record<string, string>;
  return translations[description] || description;
}

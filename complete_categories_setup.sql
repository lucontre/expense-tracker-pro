-- Actualizar categorías existentes y agregar ingresos (completo)
-- Run this in your Supabase SQL editor

-- 1. Agregar columna type si no existe
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' CHECK (type IN ('income', 'expense'));

-- 2. Agregar columna is_system si no existe
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- 3. Actualizar categorías existentes para asegurar que sean 'expense'
UPDATE categories 
SET type = 'expense', is_system = true
WHERE name IN ('Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other');

-- 4. Insertar categorías de ingresos
INSERT INTO categories (name, description, color, icon, type, is_system) VALUES
('Salary', 'Monthly salary and wages', '#10b981', '💰', 'income', true),
('Freelance', 'Freelance work and projects', '#3b82f6', '💼', 'income', true),
('Investment', 'Investment returns and dividends', '#8b5cf6', '📈', 'income', true),
('Business', 'Business income and sales', '#f59e0b', '🏢', 'income', true),
('Gift', 'Gifts and bonuses', '#ef4444', '🎁', 'income', true),
('Refund', 'Refunds and reimbursements', '#06b6d4', '↩️', 'income', true),
('Other Income', 'Other miscellaneous income', '#84cc16', '💵', 'income', true);

-- 5. Verificar resultado final
SELECT 
  COUNT(*) as total_categories,
  COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_categories,
  COUNT(CASE WHEN type = 'income' THEN 1 END) as income_categories
FROM categories;

-- 6. Mostrar todas las categorías organizadas por tipo
SELECT name, type, color, icon, is_system 
FROM categories 
ORDER BY type, name;

SELECT 'Categorías completas: gastos e ingresos agregados exitosamente!' as status;

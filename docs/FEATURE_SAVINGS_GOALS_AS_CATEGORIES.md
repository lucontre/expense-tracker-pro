# Feature: Objetivos de Ahorro como Categorías

## Descripción
Permitir que los objetivos de ahorro aparezcan como opciones en el dropdown de categorías cuando se crea una transacción de tipo "income", y que al seleccionar esa categoría, el objetivo se actualice automáticamente.

## Complejidad
**MEDIA** - 4-5 horas estimadas

## Diseño Propuesto

### Opción Recomendada: Agregar columna `savings_goal_id` a `categories`

```sql
ALTER TABLE categories 
ADD COLUMN savings_goal_id UUID REFERENCES savings_goals(id) ON DELETE SET NULL;
```

## Archivos a Modificar

1. **`web/src/app/savings-goals/page.tsx`**
   - Al crear un objetivo, crear automáticamente una categoría de tipo "income" vinculada
   - Al eliminar un objetivo, eliminar o desvincular la categoría asociada

2. **`web/src/components/TransactionModal.tsx`**
   - Mostrar objetivos como opciones especiales en el dropdown de categorías cuando `type === 'income'`
   - Agregar diferenciación visual (icono, prefijo "💰 Objetivo: Nombre")
   - Al guardar transacción con categoría vinculada a objetivo:
     - Actualizar `current_amount` del objetivo
     - Verificar si se completó (`is_completed = true`)
     - Mostrar notificación de éxito

3. **`shared/types/index.ts`**
   - Actualizar interfaz `Category` para incluir `savingsGoalId?: string`

4. **Scripts SQL**
   - Crear migración para agregar columna `savings_goal_id`
   - Considerar índices para mejor rendimiento

## Lógica de Implementación

### 1. Crear Objetivo → Crear Categoría
```typescript
// Al crear objetivo exitosamente
const categoryData = {
  name: `Savings: ${goal.name}`, // o solo goal.name
  description: `Objetivo de ahorro: ${goal.name}`,
  type: 'income',
  is_system: false,
  savings_goal_id: newGoal.id,
  color: '#10B981',
  icon: '💰'
};
```

### 2. Seleccionar Categoría en Transacción Income
```typescript
// En TransactionModal cuando se guarda transacción
if (formData.type === 'income' && selectedCategory.savings_goal_id) {
  // Actualizar objetivo
  const goal = await getSavingsGoal(selectedCategory.savings_goal_id);
  const newAmount = goal.currentAmount + transactionAmount;
  const isCompleted = newAmount >= goal.targetAmount;
  
  await updateSavingsGoal(selectedCategory.savings_goal_id, {
    current_amount: newAmount,
    is_completed: isCompleted
  });
}
```

### 3. Visualización en Dropdown
```typescript
// En TransactionModal, filtrar y mostrar objetivos
const goalCategories = categories.filter(cat => 
  cat.savings_goal_id && cat.type === 'income'
);

// Renderizar con diferenciación visual
{goalCategories.map(cat => (
  <option key={cat.id} value={cat.id}>
    💰 {cat.name} - Objetivo de Ahorro
  </option>
))}
```

## Casos Edge a Considerar

1. **Objetivo eliminado**: Si se elimina objetivo, ¿qué pasa con la categoría?
   - Opción A: Eliminar categoría (ON DELETE CASCADE)
   - Opción B: Mantener categoría pero desvincular (ON DELETE SET NULL)

2. **Transacción editada/eliminada**: ¿Descontar del objetivo si se edita/elimina?
   - Considerar historial de cambios
   - Validar que no se doble conteo

3. **Objetivo completado**: ¿Seguir permitiendo agregar dinero?
   - Opción A: Bloquear nuevas transacciones vinculadas
   - Opción B: Permitir y actualizar target si necesario

4. **Categoría existente**: ¿Permitir vincular categoría existente a objetivo?
   - Evaluar impacto en datos históricos

## Estimación de Tiempo

- Base de datos y migración: **30 minutos**
- Lógica de creación automática de categoría: **1 hora**
- UI para mostrar objetivos en dropdown: **1 hora**
- Lógica de actualización automática: **1.5 horas**
- Testing y manejo de casos edge: **1 hora**

**Total: 4-5 horas**

## Ventajas

✅ Integración natural entre objetivos y transacciones
✅ Automatización del seguimiento de progreso
✅ Mejor experiencia de usuario
✅ Reduce pasos manuales

## Desafíos

⚠️ Manejo de casos edge (eliminaciones, ediciones)
⚠️ Validación para evitar doble contabilización
⚠️ Considerar impacto en reportes y analytics
⚠️ Sincronización entre transacciones y objetivos

## Estado
📋 **PENDIENTE** - Análisis completo, esperando aprobación para implementación

---
**Fecha de análisis**: 2025-01-29
**Revisado por**: Auto (AI Assistant)


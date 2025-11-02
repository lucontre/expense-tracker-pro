# Expense Tracker Pro - Scripts de Base de Datos

## 📋 Scripts Esenciales

### **🚀 Scripts Principales (Usar en este orden)**

#### **1. Configuración Completa de Categorías**
```sql
-- complete_categories_setup.sql
-- ✅ Configuración completa: gastos + ingresos + columnas necesarias
-- Incluye: 8 categorías de gastos + 7 categorías de ingresos + columnas type e is_system
```

#### **2. Diagnóstico de Transacciones**
```sql
-- diagnose_transactions_categories.sql
-- ✅ Verifica el estado actual de transacciones y categorías
-- Útil para: diagnosticar problemas antes de actualizar
```

#### **3. Actualización de Transacciones**
```sql
-- update_transactions_with_categories.sql
-- ✅ Asigna categorías automáticamente a transacciones existentes
-- Basado en: palabras clave en las descripciones
```

### **🔧 Scripts de Funcionalidades Específicas**

#### **Avatar/Foto de Perfil**
```sql
-- simple_avatar_migration.sql (recomendado)
-- minimal_avatar_migration.sql (alternativo)
-- ✅ Agrega soporte para fotos de perfil
```

#### **Moneda**
```sql
-- currency_migration.sql
-- ✅ Agrega soporte para múltiples monedas (USD, MXN, GTQ, EUR)
```

#### **Suscripciones Pro**
```sql
-- subscription_migration_safe.sql (recomendado)
-- subscription_migration.sql (alternativo)
-- ✅ Configura sistema de suscripciones Pro/Free
```

#### **Compartir Cuentas**
```sql
-- complete_account_sharing_migration.sql (recomendado)
-- account_sharing_migration.sql (alternativo)
-- create_sharing_code_function.sql
-- ✅ Funcionalidad Pro: compartir cuentas entre usuarios
```

#### **Términos y Condiciones**
```sql
-- terms_acceptance_migration.sql
-- ✅ Registra aceptación de términos y condiciones
```

### **📊 Scripts de Diagnóstico**

#### **Verificar Estructura de Usuarios**
```sql
-- check_users_table_structure.sql
-- ✅ Verifica la estructura de la tabla users
```

### **🗂️ Scripts de Migración (Solo si es necesario)**

#### **Categorías**
```sql
-- categories_migration.sql
-- ✅ Crea tabla categories básica (solo si no existe)
```

#### **Transacciones**
```sql
-- complete_transactions_migration.sql
-- transactions_currency_migration.sql
-- ✅ Configuración completa de transacciones con moneda
```

#### **Base de Datos Completa**
```sql
-- database_migration.sql
-- ✅ Migración completa de todas las tablas
```

## 🎯 **Guía de Uso Recomendada**

### **Para Nuevo Usuario:**
1. `complete_categories_setup.sql` - Configurar categorías
2. `simple_avatar_migration.sql` - Soporte para avatares
3. `currency_migration.sql` - Soporte para monedas
4. `subscription_migration_safe.sql` - Sistema Pro/Free

### **Para Usuario Existente:**
1. `diagnose_transactions_categories.sql` - Verificar estado
2. `update_transactions_with_categories.sql` - Actualizar transacciones
3. `add_income_categories.sql` - Solo si faltan categorías de ingresos

### **Para Funcionalidades Pro:**
1. `complete_account_sharing_migration.sql` - Compartir cuentas
2. `terms_acceptance_migration.sql` - Términos y condiciones

## ⚠️ **Notas Importantes**

- **Siempre hacer backup** antes de ejecutar scripts
- **Ejecutar en orden** según las dependencias
- **Verificar resultados** después de cada script
- **Los scripts con "safe"** son más seguros para ejecutar múltiples veces

## 📁 **Archivos de Documentación**

- `DATABASE_SETUP.md` - Guía detallada de configuración
- `IMPLEMENTATION_STATUS.md` - Estado de implementación
- `README.md` - Documentación general del proyecto

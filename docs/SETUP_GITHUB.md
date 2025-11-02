# 🚀 Guía: Subir tu Código a GitHub

Esta guía te ayudará a subir tu código local a GitHub para poder hacer deploy fácilmente en Vercel.

## 📋 Requisitos Previos

- ✅ Git instalado (acabas de instalarlo)
- ✅ Cuenta en GitHub - [Crear cuenta](https://github.com/signup)
- ✅ Tu código local en `C:\dev\expense-tracker-pro`

---

## 🔄 Paso 1: Reiniciar PowerShell

**⚠️ IMPORTANTE:** Después de instalar Git, cierra y vuelve a abrir PowerShell para que los comandos funcionen.

1. Cierra PowerShell completamente
2. Abre PowerShell de nuevo
3. Navega a tu proyecto:
   ```powershell
   cd C:\dev\expense-tracker-pro
   ```

---

## 🧪 Paso 2: Verificar que Git Funciona

```powershell
git --version
```

Deberías ver algo como: `git version 2.42.0` (o la versión que instalaste)

---

## 📦 Paso 3: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Configura:
   - **Repository name:** `expense-tracker-pro`
   - **Description:** "Expense Tracker Pro - Web and Mobile Application"
   - **Visibility:** Selecciona **Private** (recomendado para proyectos personales)
   - ☑️ **NO** marques "Add a README file" (ya tienes uno)
   - ☑️ **NO** marques "Add .gitignore" (ya tienes uno)
   - ☑️ **NO** marques "Choose a license"
5. Haz clic en **"Create repository"**

---

## 🔗 Paso 4: Configurar Git en tu Proyecto

En PowerShell, ejecuta estos comandos:

```powershell
# Ir al directorio del proyecto
cd C:\dev\expense-tracker-pro

# Inicializar git (si no está inicializado)
git init

# Configurar tu nombre de usuario (reemplaza con tu nombre real)
git config user.name "Tu Nombre"

# Configurar tu email (reemplaza con tu email de GitHub)
git config user.email "tu-email@ejemplo.com"
```

**Nota:** Si ya configuraste Git antes, puedes omitir los comandos `git config`.

---

## 📝 Paso 5: Agregar y Commitear Archivos

```powershell
# Verificar estado (opcional, para ver qué archivos están listos)
git status

# Agregar todos los archivos
git add .

# Crear el commit inicial
git commit -m "Initial commit - Expense Tracker Pro"
```

---

## 🚀 Paso 6: Conectar con GitHub y Subir

```powershell
# Renombrar la rama a 'main' (si es necesario)
git branch -M main

# Agregar GitHub como origen (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/expense-tracker-pro.git

# Subir tu código
git push -u origin main
```

**Nota:** Te pedirá tus credenciales de GitHub:
- **Username:** Tu usuario de GitHub
- **Password:** Usa un **Personal Access Token** (no tu contraseña). Ver instrucciones abajo.

---

## 🔑 Paso 7: Crear Personal Access Token

GitHub ya no acepta contraseñas normales. Necesitas un Token:

1. En GitHub, ve a **Settings** (tu perfil → Settings)
2. En el menú lateral izquierdo, ve a **Developer settings**
3. Haz clic en **Personal access tokens** → **Tokens (classic)**
4. Haz clic en **Generate new token** → **Generate new token (classic)**
5. Configura:
   - **Note:** "Expense Tracker Pro Local Development"
   - **Expiration:** Selecciona "90 days" o "No expiration"
   - **Scopes:** Marca:
     - ✅ `repo` (Full control of private repositories)
6. Haz clic en **Generate token**
7. **IMPORTANTE:** Copia el token inmediatamente (solo se muestra una vez)
8. Usa este token como contraseña cuando Git te lo pida

---

## ✅ Paso 8: Verificar en GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/expense-tracker-pro`
2. Verifica que todos tus archivos estén ahí
3. Si ves tus archivos, ¡todo salió bien! 🎉

---

## 🔄 Paso 9: Actualizar Git Remoto (Si es necesario)

Si copiaste mal la URL del repositorio, puedes corregirla:

```powershell
# Ver el remote actual
git remote -v

# Si necesitas cambiarlo:
git remote set-url origin https://github.com/TU_USUARIO/expense-tracker-pro.git
```

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"

```powershell
# Eliminar el remote existente
git remote remove origin

# Agregarlo de nuevo
git remote add origin https://github.com/TU_USUARIO/expense-tracker-pro.git
```

### Error: "failed to push some refs"

Primero necesitas hacer un pull:

```powershell
git pull origin main --allow-unrelated-histories
```

Luego haz push de nuevo:

```powershell
git push -u origin main
```

### Error: "git is not recognized"

- Reinicia PowerShell completamente
- Verifica que Git esté en el PATH: `git --version`
- Si sigue sin funcionar, reinstala Git con la opción 2 seleccionada

### Error: Autenticación fallida

- Asegúrate de usar tu **Personal Access Token**, no tu contraseña
- El token debe tener el scope `repo` habilitado
- Si el token expiró, genera uno nuevo

---

## 📝 Comandos Útiles para el Futuro

Cuando hagas cambios, actualiza GitHub así:

```powershell
# Ver qué archivos cambiaron
git status

# Agregar todos los cambios
git add .

# O agregar archivos específicos
git add archivo1.ts archivo2.ts

# Crear commit con un mensaje descriptivo
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push
```

---

## ✅ Checklist

- [ ] Git instalado y funcionando (`git --version`)
- [ ] Cuenta en GitHub creada
- [ ] Repositorio en GitHub creado
- [ ] Git configurado en tu máquina (nombre y email)
- [ ] Código local agregado a Git (`git add .`)
- [ ] Primer commit creado (`git commit`)
- [ ] Personal Access Token creado en GitHub
- [ ] Código subido a GitHub (`git push`)
- [ ] Archivos visibles en GitHub

---

¡Ahora tu código está en GitHub y listo para deployar en Vercel! 🚀

Siguiente paso: Configurar variables de entorno en Vercel usando la guía `DEPLOYMENT_ENV_VARS.md`


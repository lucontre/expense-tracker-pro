# 🔐 Guía Paso a Paso: Configurar Variables de Entorno en Producción

Esta guía te ayudará a configurar las variables de entorno para la aplicación web y móvil en producción.

## 📋 Requisitos Previos

Antes de comenzar, necesitas:

1. ✅ Tu URL de Supabase (ejemplo: `https://xxxxx.supabase.co`)
2. ✅ Tu clave anónima (anon key) de Supabase
3. ✅ Una cuenta en Vercel (para web) - [Crear cuenta](https://vercel.com/signup)
4. ✅ Una cuenta en Expo (para móvil) - [Crear cuenta](https://expo.dev/signup)
5. ✅ EAS CLI instalado (para móvil): `npm install -g eas-cli`

---

## 🌐 Parte 1: Variables de Entorno para Web (Vercel)

### Opción A: Usando Vercel Dashboard (Recomendado)

#### Paso 1: Crear proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New..."** → **"Project"**

#### Opción A1: Si tu código está en GitHub/GitLab/Bitbucket

1. Si tu código está en GitHub/GitLab/Bitbucket:
   - Conecta tu repositorio
   - Selecciona el proyecto `expense-tracker-pro`
   - Selecciona el directorio `web` como **Root Directory**
   - Haz clic en **"Deploy"**

#### Opción A2: Si tu código está solo localmente (sin Git remoto)

**Tienes dos opciones:**

**Opción 1: Subir tu código a GitHub primero (Recomendado)**
1. Crea una cuenta en [GitHub](https://github.com) si no tienes una
2. Crea un nuevo repositorio (ejemplo: `expense-tracker-pro`)
3. En tu máquina local, abre PowerShell en `C:\dev\expense-tracker-pro`:
   ```powershell
   # Si Git no está instalado, descárgalo de: https://git-scm.com/download/win
   # Luego ejecuta:
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/expense-tracker-pro.git
   git push -u origin main
   ```
4. Luego en Vercel, conecta este repositorio de GitHub

**Opción 2: Desplegar desde tu máquina local usando Vercel CLI**
Sigue las instrucciones de la **Opción B** más abajo (usando Vercel CLI)

#### Paso 2: Configurar variables de entorno

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a la pestaña **"Settings"**
3. En el menú lateral, haz clic en **"Environment Variables"**
4. Haz clic en **"Add New"** o **"Add Environment Variable"**

#### Paso 3: Agregar la primera variable

1. **Name**: `NEXT_PUBLIC_SUPABASE_URL`
2. **Value**: Tu URL de Supabase (ejemplo: `https://xxxxx.supabase.co`)
3. **Environment**: Selecciona todas las opciones:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
4. Haz clic en **"Save"**

#### Paso 4: Agregar la segunda variable

1. **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Value**: Tu clave anónima de Supabase (ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
3. **Environment**: Selecciona todas las opciones:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
4. Haz clic en **"Save"**

#### Paso 5: Verificar y redeplegar

1. Verifica que ambas variables estén listadas
2. Ve a la pestaña **"Deployments"**
3. Haz clic en los tres puntos (...) del último deployment
4. Selecciona **"Redeploy"**
5. Asegúrate de marcar **"Use existing Build Cache"** si está disponible
6. Haz clic en **"Redeploy"**

#### Paso 6: Verificar en producción

1. Después del redeploy, visita tu URL de producción
2. Abre las herramientas de desarrollador (F12)
3. Ve a la consola y verifica que no hay errores de conexión a Supabase
4. Intenta hacer login para verificar que las variables funcionan

---

### Opción B: Usando Vercel CLI

#### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Paso 2: Iniciar sesión

```bash
vercel login
```

#### Paso 3: Vincular proyecto

```bash
cd web
vercel link
```

Sigue las instrucciones para vincular tu proyecto existente o crear uno nuevo.

#### Paso 4: Agregar variables de entorno

```bash
# Agregar NEXT_PUBLIC_SUPABASE_URL para producción
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Cuando te pregunte por el valor, pega tu URL de Supabase
# Presiona Enter para confirmar

# Agregar NEXT_PUBLIC_SUPABASE_ANON_KEY para producción
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Cuando te pregunte por el valor, pega tu anon key
# Presiona Enter para confirmar
```

#### Paso 5: Agregar para preview y development

```bash
# Para preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

# Para development
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

#### Paso 6: Desplegar

```bash
vercel --prod
```

---

## 📱 Parte 2: Variables de Entorno para Mobile (EAS Build)

### Paso 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Paso 2: Iniciar sesión en Expo

```bash
eas login
```

Ingresa tu email y contraseña de Expo. Si no tienes cuenta, créala en [expo.dev/signup](https://expo.dev/signup).

### Paso 3: Configurar EAS en el proyecto

```bash
cd mobile
eas build:configure
```

Esto creará un archivo `eas.json` si no existe. Responde las preguntas:
- **What would you like to name your build profile?** → Presiona Enter (usa el default: `production`)
- **Would you like to configure Android?** → `Yes`
- **Would you like to configure iOS?** → `Yes` (opcional si solo haces Android)

### Paso 4: Inicializar proyecto EAS

```bash
eas init
```

Esto vinculará tu proyecto con Expo. Selecciona:
- **Would you like to create a new project?** → `Yes` (o `No` si ya tienes uno)

### Paso 5: Configurar variables de entorno en EAS

#### Opción A: Usando EAS Secrets (Recomendado)

```bash
# Agregar NEXT_PUBLIC_SUPABASE_URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "tu_url_de_supabase"

# Agregar NEXT_PUBLIC_SUPABASE_ANON_KEY
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "tu_anon_key"
```

**Nota:** En móvil, las variables deben empezar con `EXPO_PUBLIC_` (no `NEXT_PUBLIC_`).

#### Opción B: Usando eas.json

Edita `mobile/eas.json` y agrega las variables en los perfiles de build:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "tu_url_de_supabase",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "tu_anon_key"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "tu_url_de_supabase",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "tu_anon_key"
      }
    },
    "development": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "tu_url_de_supabase",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "tu_anon_key"
      }
    }
  }
}
```

**⚠️ Advertencia:** Este método expone las variables en el código. Usa EAS Secrets para mayor seguridad.

### Paso 6: Verificar que las variables estén configuradas

```bash
# Listar todos los secrets
eas secret:list
```

Deberías ver tus dos variables listadas.

### Paso 7: Verificar configuración del proyecto

Edita `mobile/app.json` y actualiza el `projectId` si EAS lo generó:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "tu-project-id-de-eas"
      }
    }
  }
}
```

### Paso 8: Crear un build de prueba

```bash
# Build para Android (prueba)
eas build --platform android --profile preview

# O build para iOS (si tienes cuenta de Apple Developer)
eas build --platform ios --profile preview
```

Este comando:
- Tomará varios minutos
- Creará un archivo APK/IPA que puedes instalar en tu dispositivo
- Usará las variables de entorno configuradas

---

## 🔍 Verificación Final

### Para Web (Vercel):

1. ✅ Ve a tu dashboard de Vercel
2. ✅ Verifica que las variables estén en "Environment Variables"
3. ✅ Haz un redeploy si es necesario
4. ✅ Visita tu sitio en producción
5. ✅ Abre la consola del navegador (F12)
6. ✅ Verifica que no hay errores de conexión a Supabase
7. ✅ Prueba hacer login

### Para Mobile (EAS):

1. ✅ Ejecuta `eas secret:list` y verifica que las variables estén listadas
2. ✅ Verifica que `mobile/app.json` tenga el `projectId` correcto
3. ✅ Crea un build de prueba con `eas build --platform android --profile preview`
4. ✅ Descarga e instala el APK en tu dispositivo
5. ✅ Abre la app y verifica que se conecta a Supabase
6. ✅ Prueba hacer login

---

## 🆘 Troubleshooting

### Problema: Las variables no se aplican en Vercel

**Solución:**
1. Asegúrate de que las variables empiecen con `NEXT_PUBLIC_`
2. Haz un redeploy después de agregar las variables
3. Verifica que seleccionaste todos los ambientes (Production, Preview, Development)

### Problema: Las variables no se aplican en EAS Build

**Solución:**
1. Asegúrate de que las variables empiecen con `EXPO_PUBLIC_` (no `NEXT_PUBLIC_`)
2. Verifica que las agregaste como secrets: `eas secret:list`
3. Si usas `eas.json`, asegúrate de que el formato JSON sea correcto

### Problema: Error de conexión a Supabase en producción

**Solución:**
1. Verifica que la URL de Supabase sea correcta (debe empezar con `https://`)
2. Verifica que la anon key sea correcta (no debe tener espacios)
3. Verifica que las políticas de RLS en Supabase permitan el acceso
4. Revisa los logs de Vercel/EAS para ver errores específicos

---

## 📝 Notas Importantes

1. **Seguridad:** Nunca commiteas archivos `.env` o `.env.local` al repositorio. Estos ya están en `.gitignore`.

2. **Diferencia entre Web y Mobile:**
   - **Web:** Usa `NEXT_PUBLIC_` como prefijo
   - **Mobile:** Usa `EXPO_PUBLIC_` como prefijo

3. **Actualización de Variables:**
   - En Vercel: Edita las variables en Settings → Environment Variables → Haz clic en la variable → Edita → Save → Redeploy
   - En EAS: `eas secret:update --scope project --name VARIABLE_NAME --value "nuevo_valor"`

4. **Múltiples Ambientes:**
   - Puedes tener diferentes valores para Production, Preview y Development
   - Útil si tienes proyectos de Supabase separados para cada ambiente

---

## ✅ Checklist Final

- [ ] Variables configuradas en Vercel (Web)
- [ ] Variables configuradas en EAS (Mobile)
- [ ] Web desplegada y funcionando en producción
- [ ] Build de móvil creado exitosamente
- [ ] Login funciona correctamente en web
- [ ] Login funciona correctamente en móvil
- [ ] No hay errores en consola/navegador
- [ ] Conexión a Supabase verificada

---

**¿Necesitas ayuda?** Revisa los logs en:
- Vercel: Dashboard → Tu proyecto → Deployments → Último deployment → Build Logs
- EAS: [expo.dev](https://expo.dev) → Tu proyecto → Builds → Último build → Ver logs


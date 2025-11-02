# Guía para Probar la Aplicación Móvil

## 🚀 Pasos para Ejecutar la App en Expo Go

### Prerrequisitos

1. **Node.js** instalado (versión 18 o superior)
2. **Expo Go** instalado en tu teléfono:
   - **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Pasos

1. **Asegúrate de estar en el directorio de mobile**:
   ```bash
   cd mobile
   ```

2. **Verifica que tienes las dependencias instaladas**:
   ```bash
   npm install
   ```

3. **Verifica el archivo `.env`**:
   Asegúrate de que el archivo `mobile/.env` existe y contiene:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://fasorgicidamrakyeayz.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
   ```
   
   > **Nota**: El archivo `.env` debe estar en la raíz del proyecto `mobile/`

4. **Inicia el servidor de Expo**:
   ```bash
   npm start
   ```
   
   Esto abrirá una ventana en tu navegador con el Metro Bundler.

5. **Escanea el código QR con tu teléfono**:
   
   - **iOS**: Abre la app **Cámara** y escanea el código QR
   - **Android**: Abre la app **Expo Go** y presiona "Scan QR Code"
   
   **IMPORTANTE**: Tu teléfono y tu computadora deben estar en la **misma red Wi-Fi**.

## 📱 Opciones de Prueba

### Opción 1: En Dispositivo Físico (Recomendado)

1. Sigue los pasos anteriores
2. Conecta tu teléfono a la misma red Wi-Fi que tu computadora
3. Escanea el QR code desde Expo Go

### Opción 2: Emulador Android

1. Instala **Android Studio**
2. Crea un emulador Android
3. Ejecuta:
   ```bash
   cd mobile
   npm run android
   ```

### Opción 3: Simulador iOS (Solo en Mac)

1. Instala **Xcode** desde el App Store
2. Ejecuta:
   ```bash
   cd mobile
   npm run ios
   ```

## 🔍 Solución de Problemas

### "No se muestra nada en Expo Go"

**Causas comunes:**

1. **El teléfono y la computadora no están en la misma red Wi-Fi**
   - ✅ Solución: Conecta ambos al mismo Wi-Fi

2. **Firewall bloqueando la conexión**
   - ✅ Solución: Desactiva temporalmente el firewall o permite Expo en el firewall

3. **Problemas con las credenciales de Supabase**
   - ✅ Solución: Verifica que el archivo `.env` tiene las credenciales correctas

4. **La app necesita autenticación**
   - ✅ Solución: La app ahora mostrará primero la pantalla de login. Inicia sesión con tus credenciales de la web.

### "Error de conexión"

Si ves un error de conexión:

1. Detén el servidor (Ctrl + C)
2. Limpia la caché:
   ```bash
   cd mobile
   npm start -- --clear
   ```
3. Reintenta

### "Cannot find module"

Si ves errores de módulos no encontrados:

```bash
cd mobile
rm -rf node_modules
npm install
npm start
```

## 🎯 Características de la App

Una vez que inicies sesión, podrás acceder a:

- ✅ **Dashboard**: Vista general de tus finanzas
- ✅ **Transactions**: Agregar y ver transacciones
- ✅ **Budgets**: Administrar presupuestos
- ✅ **Reports**: Ver reportes y análisis
- ✅ **Settings**: Configuración
- ✅ **Savings Goals**: Objetivos de ahorro
- ✅ **Profile**: Perfil de usuario
- ✅ **Export**: Exportar datos
- ✅ **Notifications**: Notificaciones (solo en mobile)
- ✅ **Account Sharing**: Compartir cuenta (solo en mobile)
- ✅ **Contact**: Contacto

## 📝 Notas Importantes

1. **La primera vez que abras la app, verás la pantalla de login**
2. **Usa las mismas credenciales que usas en la web**
3. **Los datos se sincronizan automáticamente con Supabase**
4. **La app funciona offline para ver datos previamente cargados**

## 🔄 Actualizaciones en Tiempo Real

Cuando hagas cambios en el código:

1. Guarda los archivos
2. La app se recargará automáticamente (Hot Reload)
3. Si no se recarga, agita tu teléfono y selecciona "Reload"

## 🆘 Obtener Ayuda

Si sigues teniendo problemas:

1. Revisa la consola de Expo en tu terminal para ver errores
2. Revisa la consola del dispositivo:
   - Agita tu teléfono en Expo Go
   - Selecciona "Debug Remote JS"
   - Abre Chrome DevTools en tu computadora
3. Verifica que todas las dependencias están instaladas correctamente

---

**Última actualización**: Noviembre 2025


# Guía Completa para Configurar la App Móvil

## ⚠️ Problema Identificado

La app móvil tiene problemas debido a:
1. **Proyecto en OneDrive** con rutas muy largas
2. **Falta de configuración de Metro** bundler
3. **NativeWind** no configurado correctamente
4. **Dependencias conflictivas**

## ✅ Solución: Mover el Proyecto a una Ruta Más Corta

### Pasos para Mover el Proyecto

1. **Abre PowerShell como Administrador**

2. **Crea un directorio para proyectos**:
   ```powershell
   mkdir C:\dev
   ```

3. **Mueve el proyecto completo** (puede tomar varios minutos):
   ```powershell
   Move-Item "C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence\expense-tracker-pro" "C:\dev\expense-tracker-pro" -Force
   ```

4. **Navega al nuevo directorio**:
   ```powershell
   cd C:\dev\expense-tracker-pro
   ```

5. **Instala las dependencias de mobile**:
   ```powershell
   cd mobile
   npm install
   ```

6. **Inicia el servidor de Expo**:
   ```powershell
   npm start -- --clear
   ```

7. **Escanea el QR** en tu dispositivo con Expo Go

## 📱 Archivos Configurados

Los siguientes archivos ya están configurados correctamente:

- ✅ `mobile/metro.config.js` - Configuración de Metro
- ✅ `mobile/app.json` - Configuración de Expo
- ✅ `mobile/App.tsx` - App principal con autenticación
- ✅ `mobile/src/screens/TestScreen.tsx` - Pantalla de prueba

## 🔧 Configuración Necesaria

### 1. Variables de Entorno

El archivo `mobile/.env` debe contener:
```
EXPO_PUBLIC_SUPABASE_URL=https://fasorgicidamrakyeayz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_key
```

### 2. Firewall de Windows

Si tienes problemas de conexión:

1. Busca "Windows Defender Firewall"
2. "Permitir una aplicación..."
3. Agrega Node.js (`C:\Program Files\nodejs\node.exe`)
4. Marca "Privado" y "Público"

## 🧪 Probar la App

### Opción 1: Dispositivo Físico

1. **iOS**:
   - Abre Expo Go
   - Escanea el QR code con la cámara
   
2. **Android**:
   - Abre Expo Go
   - Escanea el QR code desde la app

### Opción 2: Emulador

```powershell
# Android
npm run android

# iOS (Mac only)
npm run ios
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```powershell
cd mobile
rm -rf node_modules
npm install
```

### Error: "Timeout"
- Verifica que el firewall permite Node.js
- Asegúrate de estar en la misma red Wi-Fi
- Prueba con `npm start -- --tunnel`

### Error: "SHA-1"
- Limpia el caché: `npm start -- --clear`
- Si persiste, mueve el proyecto fuera de OneDrive

### La app carga pero muestra error
- Abre el debugger: Agita el teléfono → "Debug Remote JS"
- Revisa la consola en Chrome DevTools

## 📝 Notas Importantes

1. **No mantengas el proyecto en OneDrive** para desarrollo
2. **Usa Git** para sincronizar cambios entre computadoras
3. **La app en mobile** es independiente de la web pero usa la misma base de datos
4. **Los datos se sincronizan** automáticamente entre web y mobile gracias a Supabase

## 🚀 Próximos Pasos

Después de que la app funcione:

1. Verifica que la pantalla de prueba se muestre
2. Restaura la funcionalidad completa en `mobile/App.tsx`
3. Prueba iniciar sesión con tus credenciales
4. Verifica que los datos se carguen correctamente

---

**Última actualización**: Noviembre 2025


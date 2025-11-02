# Solución Rápida para Probar la App Móvil

## ⚠️ El Problema

La app móvil no funciona porque el proyecto está en OneDrive con rutas muy largas:
```
C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence\expense-tracker-pro
```

Metro (el bundler de Expo) no puede manejar rutas tan largas.

## ✅ Solución: Mover el Proyecto

### Pasos Rápidos (5 minutos)

1. **Abre PowerShell como Administrador**

2. **Mueve el proyecto**:
   ```powershell
   # Crea el directorio
   mkdir C:\dev
   
   # Mueve el proyecto
   Move-Item "C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence\expense-tracker-pro" "C:\dev\expense-tracker-pro" -Force
   ```

3. **Abre VS Code/Cursor en el nuevo directorio**:
   ```powershell
   cd C:\dev\expense-tracker-pro
   code .
   ```

4. **Inicia el servidor móvil**:
   ```powershell
   cd mobile
   npm start -- --clear
   ```

5. **Escanea el QR** en tu dispositivo con Expo Go

## 🔄 Sincronizar Cambios con Git

Después de mover:

1. **Commit de los cambios locales** (en C:\dev):
   ```powershell
   git add .
   git commit -m "Move project to C:\dev"
   ```

2. **Push al repositorio**:
   ```powershell
   git push
   ```

3. **En otra computadora**, clona el repo en una ruta corta también

## 📝 Notas Importantes

- El proyecto en OneDrive se moverá completamente
- Mantén Git para sincronizar entre dispositivos
- La app web seguirá funcionando igual
- No necesitas volver a instalar dependencias si las mueves

## 🆘 Si Tienes Problemas

Si PowerShell dice que no puede mover el proyecto:

1. Cierra VS Code/Cursor
2. Cierra todos los terminales
3. Ejecuta PowerShell **como Administrador**
4. Intenta mover de nuevo

---

**Tiempo estimado**: 5 minutos  
**Resultado**: App móvil funcionando ✓



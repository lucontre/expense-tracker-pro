# Problema con OneDrive y Expo

## El Problema

El proyecto está en OneDrive, lo que causa:
- Rutas de archivos muy largas (OneDrive agrega muchos directorios)
- Problemas con Metro bundler (SHA-1 errors)
- Archivos bloqueados o corruptos

## Soluciones

### Opción 1: Mover el Proyecto Fuera de OneDrive (Recomendado)

1. **Mueve el proyecto** a una ruta corta:
   - Ejemplo: `C:\dev\expense-tracker-pro`
   - O: `C:\projects\expense-tracker-pro`

2. **Pasos**:
   ```powershell
   # Crea el directorio
   mkdir C:\dev
   
   # Mueve el proyecto (desde PowerShell como administrador)
   Move-Item "C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence\expense-tracker-pro" "C:\dev\expense-tracker-pro"
   
   # Ve al nuevo directorio
   cd C:\dev\expense-tracker-pro
   
   # Instala dependencias
   cd mobile
   npm install
   npm start -- --clear
   ```

### Opción 2: Crear un Nuevo Proyecto Expo

Si mover el proyecto no funciona:

```bash
# Fuera de OneDrive
cd C:\dev
npx create-expo-app@latest expense-tracker-pro-mobile

# Copia el código fuente (no node_modules)
cp -r "C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence\expense-tracker-pro\mobile\src" ./expense-tracker-pro-mobile/

# Instala dependencias
cd expense-tracker-pro-mobile
npm install
npm start
```

### Opción 3: Usar Link Simbólico (Windows)

Crea un link simbólico a una ruta más corta:

```powershell
# Como administrador
New-Item -ItemType SymbolicLink -Path "C:\dev\expense-tracker" -Target "C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence\expense-tracker-pro"

# Luego trabaja desde C:\dev\expense-tracker
cd C:\dev\expense-tracker\mobile
npm install
npm start
```

### Opción 4: Configurar OneDrive

Si debes mantener el proyecto en OneDrive:

1. **Evita sincronizar `node_modules`**:
   - Click derecho en `node_modules` → "Free up space"
   - O: Configura OneDrive para excluir `node_modules`

2. **Desactiva la sincronización** para el directorio del proyecto temporalmente mientras trabajas

## Recomendación

**La mejor solución es la Opción 1**: Mover el proyecto a `C:\dev\expense-tracker-pro` o similar.

Esto resolverá:
- ✅ Problemas con Metro bundler
- ✅ Rutas muy largas
- ✅ Archivos bloqueados
- ✅ Performance general

## Próximos Pasos Después de Mover

1. Instala dependencias:
   ```bash
   cd C:\dev\expense-tracker-pro\mobile
   npm install
   ```

2. Inicia el servidor:
   ```bash
   npm start -- --clear
   ```

3. Escanea el QR en tu dispositivo

4. La app debería funcionar correctamente


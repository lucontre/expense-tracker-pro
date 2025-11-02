# 🚀 Guía Paso a Paso: Mover Proyecto a C:\dev

## ✅ **Por Qué Necesitamos Mover el Proyecto**

El proyecto está en OneDrive (`C:\Users\...\OneDrive - EZCORP\...`) y tiene rutas muy largas que causan problemas con la app móvil.

**Solución**: Moverlo a `C:\dev` que tiene una ruta corta y simple.

---

## 📋 **Paso 1: Detener Todos los Servidores**

### En la Terminal Actual

Si tienes servidores corriendo, verás algo como:
```
> expense-tracker-pro@1.0.0 start
> expo start --clear

› Metro waiting on exp://...
```

**Acción**: Presiona `Ctrl + C` en **CADA** terminal que tenga un servidor corriendo

### Verificar que Todo Está Detenido

- ✅ No deberías ver ningún "Metro waiting..." o "dev server running"
- ✅ El terminal debería estar inactivo

---

## 📋 **Paso 2: Cerrar VS Code/Cursor**

### Cerrar Completamente

1. Busca el icono de VS Code/Cursor en la barra de tareas (abajo)
2. **Click derecho** en el icono
3. Selecciona **"Cerrar ventana"** o **"Close Window"**

### Verificar que Está Cerrado

- ✅ El icono de VS Code/Cursor ya NO debe aparecer en la barra de tareas

---

## 📋 **Paso 3: Abrir PowerShell como Administrador**

### Opción A: Desde el Menú de Inicio

1. Presiona la tecla `Windows` en tu teclado
2. Escribe: `powershell`
3. Aparecerá "Windows PowerShell"
4. **No des Enter todavía**
5. **Click derecho** en "Windows PowerShell"
6. Selecciona **"Ejecutar como administrador"** o **"Run as administrator"**
7. Confirma con **"Sí"** o **"Yes"**

### Opción B: Buscar PowerShell

1. En la barra de búsqueda de Windows, escribe: `powershell`
2. **Click derecho** en el resultado
3. Selecciona **"Ejecutar como administrador"**

### Verificar que es Administrador

Al abrir PowerShell, deberías ver algo como:
```
PS C:\WINDOWS\system32>
```

Y la ventana debería decir **"Administrador"** o **"Administrator"** en la barra superior.

---

## 📋 **Paso 4: Crear Carpeta C:\dev**

### Comando

Copia y pega este comando en PowerShell:

```powershell
mkdir C:\dev
```

### Resultado Esperado

Deberías ver algo como:
```
    Directory: C:\


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        10/29/2025   9:00 PM                dev
```

---

## 📋 **Paso 5: Navegar a la Carpeta del Proyecto**

### Comando

Copia y pega este comando:

```powershell
cd "C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence"
```

### Verificar

Deberías ver:
```
PS C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence>
```

---

## 📋 **Paso 6: Mover el Proyecto**

### Comando

Copia y pega este comando:

```powershell
Move-Item "expense-tracker-pro" "C:\dev\expense-tracker-pro" -Force
```

### ¿Qué Esperar?

- **Si hay archivos abiertos**: Verás un error, regresa al Paso 1
- **Si funciona**: El comando se ejecuta sin mostrar nada (esto es normal)

### Tiempo

Este paso puede tomar 30 segundos a 2 minutos dependiendo del tamaño del proyecto.

---

## 📋 **Paso 7: Verificar que el Proyecto se Movió**

### Comando

```powershell
cd C:\dev
dir
```

### Resultado Esperado

Deberías ver:
```
    Directory: C:\dev


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        10/29/2025   9:01 PM                expense-tracker-pro
```

✅ **¡Perfecto! El proyecto se movió correctamente**

---

## 📋 **Paso 8: Abrir el Proyecto en Cursor**

### Comando

```powershell
cd C:\dev\expense-tracker-pro
code .
```

O si usas Cursor:
```powershell
cursor .
```

### Verificar

- Debería abrirse Cursor/VS Code
- Verás todos tus archivos en el explorador
- La ruta en la barra superior debería decir: `C:\dev\expense-tracker-pro`

---

## 📋 **Paso 9: Verificar que la App Web Funciona**

### Abrir Terminal en Cursor

Presiona `` Ctrl + ` `` (la tecla de tilde/crítica arriba del Tab)

### Navegar a la Carpeta Web

```powershell
cd web
```

### Verificar Dependencias

```powershell
npm install
```

### Iniciar la App Web

```powershell
npm run dev
```

### Resultado Esperado

Deberías ver:
```
✔ Ready in 2.3s
┌  Local:        http://localhost:3000
```

**Abre tu navegador en** `http://localhost:3000` y verifica que todo funciona.

---

## 📋 **Paso 10: Iniciar la App Móvil**

### Abrir Nueva Terminal en Cursor

Presiona el botón **"+"** al lado del terminal actual

### Navegar a Mobile

```powershell
cd ..\mobile
```

### Verificar Dependencias

```powershell
npm install
```

### Iniciar Expo

```powershell
npm start -- --clear
```

### Resultado Esperado

Deberías ver un **QR code** en la terminal y algo como:
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Escanear QR

1. Abre Expo Go en tu teléfono
2. Escanea el QR code
3. **La app debería cargar correctamente** ✅

---

## ✅ **¡Listo! Todo Debería Funcionar**

### Resumen de Ruta Nueva

**Antes:**
```
C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence\expense-tracker-pro
```

**Después:**
```
C:\dev\expense-tracker-pro
```

### Ventajas

- ✅ Rutas cortas → App móvil funciona
- ✅ No afecta el código → Todo sigue igual
- ✅ No afecta la base de datos → Datos intactos
- ✅ No afecta la app web → Funciona igual
- ✅ Mejor rendimiento → Sin sincronización de OneDrive

---

## 🆘 **Si Algo Sale Mal**

### Error: "Cannot move item because the item is in use"

**Solución:**
1. Cierra OneDrive completamente:
   - Click derecho en el icono de OneDrive en la bandeja (abajo derecha)
   - Selecciona "Configuración"
   - Ve a "Cuenta" → "Desconectar esta PC"
   - Espera 30 segundos
2. Intenta mover de nuevo

### Error: "Access Denied"

**Solución:**
- Asegúrate de haber abierto PowerShell **como Administrador**

### El Proyecto No Funciona Después de Mover

**Solución:**
1. En la terminal, ejecuta:
   ```powershell
   cd C:\dev\expense-tracker-pro\web
   npm install
   ```
2. Repite para mobile:
   ```powershell
   cd C:\dev\expense-tracker-pro\mobile
   npm install
   ```

---

## 📞 **Necesitas Ayuda?**

Si algo no funciona, anota:
1. En qué paso te quedaste
2. Qué error viste (copia el texto)
3. Escríbeme y te ayudo

---

**Tiempo Total Estimado: 5-10 minutos**


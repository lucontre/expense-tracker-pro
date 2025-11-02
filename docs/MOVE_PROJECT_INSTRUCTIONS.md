# Instrucciones para Mover el Proyecto a C:\dev

## ⚠️ Importante: El proyecto está en uso

Debes cerrar todo antes de mover:

## 🔧 Pasos a Seguir

### 1. Cerrar Todo

En tu terminal actual:
- Presiona `Ctrl + C` para detener todos los servidores

En VS Code/Cursor:
- Cierra VS Code/Cursor completamente

En el Explorador de Archivos:
- Cierra cualquier ventana que tenga abierta del proyecto

### 2. Abrir PowerShell como Administrador

1. Busca "PowerShell" en el menú de inicio
2. **Click derecho** en "Windows PowerShell"
3. Selecciona **"Ejecutar como administrador"**
4. Confirma con "Sí"

### 3. Mover el Proyecto

Copia y pega estos comandos uno por uno:

```powershell
# Navega al directorio del proyecto
cd "C:\Users\luis.contreras\OneDrive - EZCORP\Documents\Persoanl\Project\Project Independence"

# Mueve el proyecto
Move-Item "expense-tracker-pro" "C:\dev\expense-tracker-pro" -Force
```

### 4. Verificar que se Movió

```powershell
# Verifica que el proyecto está en C:\dev
cd C:\dev
dir
```

Deberías ver la carpeta `expense-tracker-pro`

### 5. Abrir el Proyecto

Desde PowerShell o desde el Explorador de Archivos:

```powershell
cd C:\dev\expense-tracker-pro
code .
```

Esto abrirá Cursor/VS Code en el nuevo directorio

### 6. Verificar que Todo Funciona

**Para la Web:**
```powershell
cd C:\dev\expense-tracker-pro\web
npm install
npm run dev
```

**Para Mobile:**
```powershell
cd C:\dev\expense-tracker-pro\mobile
npm install
npm start -- --clear
```

## ✅ Después de Mover

**La app web funcionará igual de bien**  
**La app móvil ahora funcionará sin problemas**

## 🔄 Si Algo Sale Mal

Si el comando falla, intenta:

1. Cerrar completamente OneDrive (icono en la bandeja del sistema → Pausar sincronización)
2. Esperar 30 segundos
3. Intentar el comando de nuevo

---

**Tiempo estimado**: 2-3 minutos  
**No afectará el funcionamiento**: Todo seguirá igual, pero funcionará mejor



# Solución para Timeout en iOS con Expo Go

## Problema
El QR se reconoce pero la app no carga y aparece un error de timeout.

## Soluciones

### 1. Permitir Expo en el Firewall de Windows

1. **Abre Windows Defender Firewall**:
   - Busca "Windows Defender Firewall" en el menú de inicio
   - Haz clic en "Permitir una aplicación o característica a través de Firewall de Windows Defender"

2. **Agrega Node.js**:
   - Haz clic en "Cambiar configuración" (requiere permisos de administrador)
   - Haz clic en "Permitir otra aplicación..."
   - Navega a tu instalación de Node.js (normalmente: `C:\Program Files\nodejs\node.exe`)
   - Agrega Node.js y marca las casillas para "Privado" y "Público"
   - Haz clic en "Aceptar"

3. **Agrega Puertos**:
   - Haz clic en "Configuración avanzada"
   - Selecciona "Reglas de entrada"
   - Haz clic en "Nueva regla..."
   - Selecciona "Puerto" y haz clic en "Siguiente"
   - Selecciona "TCP" y agrega los puertos: `8081`, `19000`, `19001`
   - Permite la conexión y aplica a todos los perfiles

### 2. Verificar que estás en la misma red Wi-Fi

1. En tu PC: Abre PowerShell y ejecuta `ipconfig`
   - Busca "Dirección IPv4" en tu adaptador Wi-Fi
   - Debería ser algo como `192.168.1.X` o `192.168.0.X`

2. En tu iPhone: Configuración → Wi-Fi → [Tu red]
   - La IP debería ser similar (por ejemplo, `192.168.1.Y`)

### 3. Desactivar temporalmente el Firewall (Solo para prueba)

1. Abre "Windows Defender Firewall" en el Panel de Control
2. Haz clic en "Activar o desactivar Firewall de Windows Defender"
3. Desactiva temporalmente el firewall para redes privadas
4. Prueba conectarte nuevamente
5. **Importante**: Reactiva el firewall después

### 4. Usar Tunnel (más lento pero más confiable)

```bash
cd mobile
npx expo start --tunnel
```

Esto usa un túnel a través de internet pero puede tardar más en cargar.

### 5. Verificar el firewall de tu Router

Si tu router tiene un firewall, verifica que no esté bloqueando las conexiones entre dispositivos en la misma red.

## Método Alternativo: Usar Android

Si tienes un dispositivo Android disponible, generalmente funciona mejor con Expo:

1. Conecta tu dispositivo Android a la misma red Wi-Fi
2. Abre Expo Go en Android
3. Escanea el QR code
4. Android no requiere configuración de firewall especial

## Verificación Final

Después de configurar el firewall:

1. Detén el servidor (Ctrl + C)
2. Inicia el servidor nuevamente:
   ```bash
   cd mobile
   npx expo start --clear
   ```
3. Escanea el QR desde tu iPhone
4. La app debería cargar correctamente

## Si sigue sin funcionar

Como último recurso, puedes crear un build de desarrollo:

```bash
cd mobile
npx expo install expo-dev-client
npx expo run:ios
```

Esto creará un build nativo que se instalará directamente en tu dispositivo (requiere cuenta de desarrollador de Apple).

---

**Nota**: Los pasos del firewall requieren permisos de administrador. Si no tienes estos permisos en tu PC, contacta a tu administrador de TI.


#!/bin/bash
# Script que EAS Build ejecuta automáticamente antes de instalar dependencias
# Este script maneja el monorepo y configura Java 17 para Gradle

set +e  # No salir inmediatamente en error para poder hacer debugging

echo "=== EAS Build Pre-install Hook ==="
echo "Directorio actual: $(pwd)"
echo "Contenido del directorio actual:"
ls -la || echo "No se pudo listar el directorio"

# EAS Build busca package.json en /home/expo/workingdir/build/mobile
TARGET_DIR="/home/expo/workingdir/build/mobile"
ROOT_BUILD_DIR="/home/expo/workingdir/build"

echo ""
echo "Buscando directorio mobile..."
echo "TARGET_DIR: $TARGET_DIR"
echo "ROOT_BUILD_DIR: $ROOT_BUILD_DIR"

# Verificar si el directorio root existe
if [ -d "$ROOT_BUILD_DIR" ]; then
    echo "✓ Root build directory existe: $ROOT_BUILD_DIR"
    echo "Contenido del root build directory:"
    ls -la "$ROOT_BUILD_DIR" || echo "No se pudo listar"
else
    echo "⚠ Root build directory no existe aún: $ROOT_BUILD_DIR"
fi

# Intentar encontrar el directorio mobile desde diferentes ubicaciones
MOBILE_DIR=""
if [ -d "$TARGET_DIR" ] && [ -f "$TARGET_DIR/package.json" ]; then
    echo "✓ Directorio mobile encontrado en $TARGET_DIR"
    MOBILE_DIR="$TARGET_DIR"
elif [ -d "mobile" ] && [ -f "mobile/package.json" ]; then
    echo "✓ Directorio mobile encontrado relativo: mobile/"
    MOBILE_DIR="$(pwd)/mobile"
elif [ -d "$ROOT_BUILD_DIR/mobile" ] && [ -f "$ROOT_BUILD_DIR/mobile/package.json" ]; then
    echo "✓ Directorio mobile encontrado en $ROOT_BUILD_DIR/mobile"
    MOBILE_DIR="$ROOT_BUILD_DIR/mobile"
else
    echo "⚠ No se encontró mobile/package.json en ubicaciones esperadas"
    echo "Buscando en el sistema..."
    find /home/expo/workingdir -type d -name "mobile" 2>/dev/null | head -5
    find /home/expo/workingdir -name "package.json" -type f 2>/dev/null | head -10
fi

# Si encontramos el directorio mobile, asegurarnos de que los archivos estén en TARGET_DIR
if [ -n "$MOBILE_DIR" ] && [ "$MOBILE_DIR" != "$TARGET_DIR" ]; then
    echo ""
    echo "Copiando archivos necesarios a $TARGET_DIR..."
    
    # Crear el directorio si no existe
    mkdir -p "$TARGET_DIR" || echo "No se pudo crear $TARGET_DIR"
    
    # Copiar archivos esenciales
    if [ -f "$MOBILE_DIR/package.json" ]; then
        cp "$MOBILE_DIR/package.json" "$TARGET_DIR/package.json" || echo "No se pudo copiar package.json"
        echo "✓ package.json copiado"
    fi
    
    if [ -f "$MOBILE_DIR/app.json" ]; then
        cp "$MOBILE_DIR/app.json" "$TARGET_DIR/app.json" || echo "No se pudo copiar app.json"
        echo "✓ app.json copiado"
    fi
    
    if [ -f "$MOBILE_DIR/eas.json" ]; then
        cp "$MOBILE_DIR/eas.json" "$TARGET_DIR/eas.json" || echo "No se pudo copiar eas.json"
        echo "✓ eas.json copiado"
    fi
    
    # Copiar otros archivos de configuración importantes
    for file in "tsconfig.json" "babel.config.js" "metro.config.js" ".npmrc"; do
        if [ -f "$MOBILE_DIR/$file" ]; then
            cp "$MOBILE_DIR/$file" "$TARGET_DIR/$file" 2>/dev/null || true
            echo "✓ $file copiado"
        fi
    done
fi

# Verificar que package.json existe en TARGET_DIR
if [ -f "$TARGET_DIR/package.json" ]; then
    echo ""
    echo "✓ package.json confirmado en $TARGET_DIR"
    echo "Contenido de $TARGET_DIR:"
    ls -la "$TARGET_DIR" || echo "No se pudo listar"
else
    echo ""
    echo "⚠ ADVERTENCIA: package.json no encontrado en $TARGET_DIR"
    echo "Intentando crear desde ubicación actual..."
    
    # Último intento: buscar package.json en cualquier lugar
    FOUND_PKG=$(find /home/expo/workingdir -name "package.json" -path "*/mobile/*" -type f 2>/dev/null | head -1)
    if [ -n "$FOUND_PKG" ]; then
        echo "Encontrado package.json en: $FOUND_PKG"
        mkdir -p "$TARGET_DIR"
        cp "$FOUND_PKG" "$TARGET_DIR/package.json" || echo "No se pudo copiar"
    fi
fi

# Configurar Java 17 para Gradle
echo ""
echo "Configurando Java 17 para Gradle..."

if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
    export PATH=$JAVA_HOME/bin:$PATH
    echo "Java 17 encontrado en: $JAVA_HOME"
elif [ -d "/usr/lib/jvm/java-17" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-17
    export PATH=$JAVA_HOME/bin:$PATH
    echo "Java 17 encontrado en: $JAVA_HOME"
elif [ -d "/usr/lib/jvm/java-17-openjdk" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
    export PATH=$JAVA_HOME/bin:$PATH
    echo "Java 17 encontrado en: $JAVA_HOME"
fi

# Verificar versión de Java
java -version || echo "Advertencia: No se pudo verificar la versión de Java"

# Exportar variables de entorno para que persistan
export EAS_BUILD_WORKING_DIR="$TARGET_DIR"
echo "EAS_BUILD_WORKING_DIR=$TARGET_DIR" >> /tmp/eas_build_env.txt 2>/dev/null || true

echo ""
echo "=== Pre-install hook completado ==="
echo "Directorio de trabajo esperado: $TARGET_DIR"

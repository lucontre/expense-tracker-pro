#!/bin/bash
# Script que EAS Build ejecuta automáticamente antes de instalar dependencias
# Este script configura Java 17 para que Gradle lo use y asegura que estamos en el directorio correcto

set -e

echo "=== Pre-install hook iniciado ==="
echo "Directorio actual: $(pwd)"
echo "Contenido del directorio:"
ls -la

# Si estamos en el root del monorepo, cambiar al directorio mobile
# Verificar si estamos en el root (tiene mobile/ subdirectorio y package.json con workspaces)
if [ -d "mobile" ] && [ -f "package.json" ] && grep -q '"workspaces"' package.json 2>/dev/null; then
    echo "Monorepo detectado en root, cambiando al directorio mobile..."
    cd mobile
    echo "Ahora en: $(pwd)"
elif [ -d "mobile" ] && [ ! -f "package.json" ]; then
    echo "Directorio mobile encontrado pero sin package.json en root, cambiando a mobile..."
    cd mobile
    echo "Ahora en: $(pwd)"
fi

# Verificar que package.json existe
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json no encontrado en $(pwd)"
    echo "Buscando package.json en directorios padre..."
    find .. -maxdepth 2 -name "package.json" 2>/dev/null || echo "No se encontró package.json"
    exit 1
fi

echo "✓ package.json encontrado en $(pwd)"

echo "Configurando Java 17 para Gradle..."

# Buscar Java 17 en el sistema
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

echo "=== Pre-install hook completado ==="

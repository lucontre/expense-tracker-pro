#!/bin/bash
# Script que EAS Build ejecuta automáticamente antes de instalar dependencias
# Este script configura Java 17 para que Gradle lo use y asegura que estamos en el directorio correcto

set -e

echo "=== Pre-install hook iniciado ==="
echo "Directorio actual: $(pwd)"
echo "Contenido del directorio:"
ls -la || echo "No se pudo listar el directorio"

# Intentar encontrar el directorio mobile desde diferentes ubicaciones posibles
MOBILE_DIR=""
if [ -d "mobile" ] && [ -f "mobile/package.json" ]; then
    MOBILE_DIR="mobile"
    echo "✓ Directorio mobile encontrado en: $(pwd)/mobile"
elif [ -f "package.json" ] && [ -d "../mobile" ] && [ -f "../mobile/package.json" ]; then
    MOBILE_DIR="../mobile"
    echo "✓ Directorio mobile encontrado en: $(pwd)/../mobile"
elif [ -f "../package.json" ] && [ -d "mobile" ] && [ -f "mobile/package.json" ]; then
    MOBILE_DIR="mobile"
    echo "✓ Directorio mobile encontrado en: $(pwd)/mobile"
else
    # Buscar recursivamente
    echo "Buscando directorio mobile..."
    MOBILE_DIR=$(find . -type d -name "mobile" -exec test -f {}/package.json \; -print | head -1)
    if [ -n "$MOBILE_DIR" ]; then
        echo "✓ Directorio mobile encontrado en: $(pwd)/$MOBILE_DIR"
    fi
fi

# Si encontramos el directorio mobile, cambiar a él
if [ -n "$MOBILE_DIR" ] && [ -d "$MOBILE_DIR" ]; then
    echo "Cambiando al directorio mobile: $MOBILE_DIR"
    cd "$MOBILE_DIR"
    echo "Ahora en: $(pwd)"
    echo "Contenido del directorio mobile:"
    ls -la || echo "No se pudo listar el directorio"
fi

# Verificar que package.json existe
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json no encontrado en $(pwd)"
    echo "Buscando package.json en directorios..."
    find . -maxdepth 3 -name "package.json" -type f 2>/dev/null | head -5 || echo "No se encontró package.json"
    echo "Estructura de directorios:"
    find . -maxdepth 2 -type d 2>/dev/null | head -10 || echo "No se pudo listar directorios"
    exit 1
fi

echo "✓ package.json encontrado en $(pwd)"
echo "Contenido de package.json (primeras líneas):"
head -5 package.json || echo "No se pudo leer package.json"

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

# Crear un archivo que indique el directorio de trabajo correcto
# Esto puede ser útil para otros hooks o scripts
echo "$(pwd)" > /tmp/eas_build_working_dir.txt 2>/dev/null || echo "No se pudo crear archivo de directorio de trabajo"

# Exportar el directorio de trabajo como variable de entorno
export EAS_BUILD_WORKING_DIR="$(pwd)"
echo "EAS_BUILD_WORKING_DIR=$EAS_BUILD_WORKING_DIR" >> ~/.bashrc 2>/dev/null || true

echo "=== Pre-install hook completado ==="
echo "Directorio de trabajo final: $(pwd)"

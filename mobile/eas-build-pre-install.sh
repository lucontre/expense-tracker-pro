#!/bin/bash
# Script que EAS Build ejecuta automáticamente antes de instalar dependencias
# Este script configura Java 17 para que Gradle lo use

set -e

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

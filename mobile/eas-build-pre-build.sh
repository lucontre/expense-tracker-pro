#!/bin/bash
# Script que EAS Build ejecuta antes de ejecutar Gradle
# Este script configura Java 17 en gradle.properties

set -e

echo "=== Configurando Java 17 para Gradle antes del build ==="

# Buscar todas las versiones de Java disponibles
echo "Buscando Java instalado en el sistema..."
ls -la /usr/lib/jvm/ 2>/dev/null || echo "No se encontró /usr/lib/jvm/"

# Buscar Java 17 en el sistema
JAVA_17_PATH=""
if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
    JAVA_17_PATH="/usr/lib/jvm/java-17-openjdk-amd64"
elif [ -d "/usr/lib/jvm/java-17" ]; then
    JAVA_17_PATH="/usr/lib/jvm/java-17"
elif [ -d "/usr/lib/jvm/java-17-openjdk" ]; then
    JAVA_17_PATH="/usr/lib/jvm/java-17-openjdk"
elif [ -d "/usr/lib/jvm/java-21-openjdk-amd64" ]; then
    # Java 21 también funciona con Gradle y es compatible
    JAVA_17_PATH="/usr/lib/jvm/java-21-openjdk-amd64"
    echo "Java 21 encontrado (compatible con Java 17)"
fi

if [ -n "$JAVA_17_PATH" ]; then
    echo "✓ Java 17 (o compatible) encontrado en: $JAVA_17_PATH"
    
    # Configurar JAVA_HOME
    export JAVA_HOME=$JAVA_17_PATH
    export PATH=$JAVA_HOME/bin:$PATH
    
    echo "JAVA_HOME configurado: $JAVA_HOME"
    
    # Verificar versión de Java
    echo "Verificando versión de Java:"
    java -version || echo "Advertencia: No se pudo verificar la versión de Java"
    
    # Verificar que el directorio android existe
    if [ -d "android" ]; then
        echo "✓ Directorio android encontrado"
        echo "Configurando gradle.properties en android/..."
        
        # Crear o modificar gradle.properties
        if [ -f "android/gradle.properties" ]; then
            echo "gradle.properties existe, modificándolo..."
            # Si ya existe org.gradle.java.home, reemplazarlo
            if grep -q "org.gradle.java.home" android/gradle.properties; then
                sed -i "s|org.gradle.java.home=.*|org.gradle.java.home=$JAVA_17_PATH|" android/gradle.properties
                echo "✓ Actualizado org.gradle.java.home en gradle.properties"
            else
                echo "" >> android/gradle.properties
                echo "org.gradle.java.home=$JAVA_17_PATH" >> android/gradle.properties
                echo "✓ Agregado org.gradle.java.home a gradle.properties"
            fi
        else
            echo "Creando gradle.properties..."
            echo "org.gradle.java.home=$JAVA_17_PATH" > android/gradle.properties
            echo "✓ Creado gradle.properties con Java 17"
        fi
        
        # Verificar que se configuró correctamente
        echo "Verificando gradle.properties:"
        cat android/gradle.properties | grep org.gradle.java.home || echo "ERROR: No se encontró org.gradle.java.home"
        echo "Contenido completo de gradle.properties:"
        cat android/gradle.properties
    else
        echo "ERROR: Directorio android/ no encontrado"
        echo "Directorios disponibles:"
        ls -la
    fi
else
    echo "ERROR: Java 17 o Java 21 no encontrado en el sistema"
    echo "Buscando todas las versiones de Java disponibles:"
    find /usr/lib/jvm -type d -name "java-*" 2>/dev/null || echo "No se encontraron versiones de Java"
    echo ""
    echo "Intentando usar Java 11 como fallback (esto fallará pero confirmará el problema)..."
fi

echo "=== Fin de configuración de Java ==="


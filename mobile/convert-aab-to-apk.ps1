# Script para convertir AAB a APK usando bundletool
# Requiere Java JDK instalado

Write-Host "=== Conversor AAB a APK ===" -ForegroundColor Cyan

# Verificar si Java está instalado
$javaInstalled = Get-Command java -ErrorAction SilentlyContinue
if (-not $javaInstalled) {
    Write-Host "ERROR: Java no está instalado." -ForegroundColor Red
    Write-Host "Por favor, instala Java JDK desde: https://www.oracle.com/java/technologies/downloads/" -ForegroundColor Yellow
    Write-Host "O usa: winget install Oracle.JDK.17" -ForegroundColor Yellow
    exit 1
}

# Verificar si bundletool existe
if (-not (Test-Path "bundletool.jar")) {
    Write-Host "Descargando bundletool..." -ForegroundColor Cyan
    $bundletoolUrl = "https://github.com/google/bundletool/releases/download/1.15.6/bundletool-all-1.15.6.jar"
    try {
        Invoke-WebRequest -Uri $bundletoolUrl -OutFile "bundletool.jar"
        Write-Host "✓ bundletool descargado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: No se pudo descargar bundletool" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

# Verificar si el AAB existe
if (-not (Test-Path "expense-tracker-pro.aab")) {
    Write-Host "ERROR: No se encontró expense-tracker-pro.aab" -ForegroundColor Red
    Write-Host "Por favor, asegúrate de estar en el directorio mobile/ y que el AAB esté descargado" -ForegroundColor Yellow
    exit 1
}

Write-Host "Convirtiendo AAB a APKs..." -ForegroundColor Cyan
java -jar bundletool.jar build-apks `
  --bundle=expense-tracker-pro.aab `
  --output=expense-tracker-pro.apks `
  --mode=universal

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Conversión exitosa" -ForegroundColor Green
    Write-Host "Extrayendo APK..." -ForegroundColor Cyan
    
    # Extraer el APK del archivo .apks (que es un ZIP)
    if (Test-Path "expense-tracker-pro.apks") {
        # Renombrar a ZIP
        Rename-Item -Path "expense-tracker-pro.apks" -NewName "expense-tracker-pro.zip" -Force
        
        # Extraer
        Expand-Archive -Path "expense-tracker-pro.zip" -DestinationPath "." -Force
        
        # Buscar el APK
        if (Test-Path "splits\universal.apk") {
            Write-Host "✓ APK extraído exitosamente" -ForegroundColor Green
            Write-Host "APK ubicado en: splits\universal.apk" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Para instalar en tu dispositivo:" -ForegroundColor Cyan
            Write-Host "1. Transfiere 'splits\universal.apk' a tu dispositivo Android" -ForegroundColor White
            Write-Host "2. En tu dispositivo, activa 'Fuentes desconocidas' en Configuración > Seguridad" -ForegroundColor White
            Write-Host "3. Abre el archivo APK en tu dispositivo y sigue las instrucciones" -ForegroundColor White
        } else {
            Write-Host "ERROR: No se encontró el APK en splits\universal.apk" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ERROR: La conversión falló" -ForegroundColor Red
    exit 1
}


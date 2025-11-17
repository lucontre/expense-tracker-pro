# Script para construir la app móvil con EAS Build
# Este script copia solo los archivos de mobile/ a un directorio temporal
# y ejecuta el build desde ahí para evitar problemas con el monorepo

$tempDir = "$env:TEMP\expense-tracker-mobile-build"
$mobileDir = "$PSScriptRoot"

Write-Host "Preparando directorio temporal para el build..." -ForegroundColor Cyan

# Limpiar directorio temporal si existe
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}

# Crear directorio temporal
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Copiando archivos de mobile/..." -ForegroundColor Cyan

# Copiar todos los archivos de mobile/ excepto node_modules
Get-ChildItem -Path $mobileDir -Recurse | Where-Object {
    $_.FullName -notmatch "node_modules" -and
    $_.FullName -notmatch "\.expo" -and
    $_.FullName -notmatch "\.git" -and
    $_.FullName -notmatch "dist" -and
    $_.FullName -notmatch "build"
} | Copy-Item -Destination {
    $_.FullName.Replace($mobileDir, $tempDir)
} -Force

# Determinar el directorio del proyecto dentro del temporal
$projectDir = if (Test-Path (Join-Path $tempDir 'package.json')) {
    $tempDir
} elseif (Test-Path (Join-Path $tempDir 'mobile/package.json')) {
    Join-Path $tempDir 'mobile'
} else {
    Write-Host "Error: No se encontró package.json en el directorio temporal" -ForegroundColor Red
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "Directorio del proyecto: $projectDir" -ForegroundColor Yellow

# Asegurar que los scripts de build hooks se copien y tengan permisos de ejecución
$buildHooks = @("eas-build-pre-install.sh", "eas-build-pre-build.sh")
foreach ($hook in $buildHooks) {
    if (Test-Path "$mobileDir\$hook") {
        Copy-Item "$mobileDir\$hook" "$projectDir\$hook" -Force
        Write-Host "Copiado $hook al directorio temporal." -ForegroundColor Yellow
    }
}

# Asegurar que .npmrc se copie si existe
if (Test-Path "$mobileDir\.npmrc") {
    Copy-Item "$mobileDir\.npmrc" "$projectDir\.npmrc" -Force
    Write-Host "Copiado .npmrc desde mobile/." -ForegroundColor Yellow
}

# Copiar gradle.properties si existe (para configurar Java 17)
if (Test-Path "$mobileDir\android\gradle.properties") {
    # Crear directorio android/ en el directorio temporal si no existe
    $androidTempDir = Join-Path $projectDir 'android'
    if (-not (Test-Path $androidTempDir)) {
        New-Item -ItemType Directory -Path $androidTempDir -Force | Out-Null
    }
    Copy-Item "$mobileDir\android\gradle.properties" "$androidTempDir\gradle.properties" -Force
    Write-Host "Copiado android/gradle.properties al directorio temporal." -ForegroundColor Yellow
}

# Copiar package-lock.json si existe en mobile/
if (Test-Path "$mobileDir\package-lock.json") {
    Copy-Item "$mobileDir\package-lock.json" "$projectDir\package-lock.json" -Force
    Write-Host "Copiado package-lock.json desde mobile/." -ForegroundColor Yellow
} else {
    Write-Host "Generando package-lock.json específico para mobile/..." -ForegroundColor Cyan
    Set-Location $projectDir
    npm install --package-lock-only --legacy-peer-deps
    
    if (-not (Test-Path "package-lock.json")) {
        Write-Host "Error: No se pudo generar package-lock.json" -ForegroundColor Red
        Set-Location $mobileDir
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        exit 1
    }
    
    Write-Host "package-lock.json generado exitosamente." -ForegroundColor Green
    Set-Location $mobileDir
}

# Crear .npmrc en el directorio temporal para usar legacy-peer-deps en npm ci
Set-Location $projectDir
Write-Host "Creando archivo .npmrc con legacy-peer-deps=true..." -ForegroundColor Cyan
"legacy-peer-deps=true" | Out-File -FilePath "$projectDir\.npmrc" -Encoding UTF8 -Force

Write-Host "Archivos copiados exitosamente." -ForegroundColor Green

Write-Host "Ejecutando EAS Build desde directorio temporal..." -ForegroundColor Cyan
Write-Host "Directorio: $projectDir" -ForegroundColor Gray

# Ejecutar EAS Build
# Usar preview para generar APK (instalable directamente)
# Usar production para generar AAB (para Google Play)
$env:EAS_NO_VCS = "1"
$env:EAS_PROJECT_ROOT = $projectDir
$env:GIT_DIR = Join-Path $projectDir '.git'
$buildProfile = if ($args[0]) { $args[0] } else { "preview" }
eas build --platform android --profile $buildProfile

# Volver al directorio original
Set-Location $mobileDir

# Limpiar variables de entorno temporales
$env:EAS_PROJECT_ROOT = $null
$env:GIT_DIR = $null

Write-Host "Build completado. Limpiando directorio temporal..." -ForegroundColor Cyan
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Proceso completado." -ForegroundColor Green


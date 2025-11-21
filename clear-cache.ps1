# Скрипт для очистки кэша electron-builder
$cachePath = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"

if (Test-Path $cachePath) {
    Write-Host "Очистка кэша winCodeSign..."
    Remove-Item -Recurse -Force $cachePath -ErrorAction SilentlyContinue
    Write-Host "Кэш очищен!"
} else {
    Write-Host "Кэш не найден"
}


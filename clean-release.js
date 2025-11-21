import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для закрытия процессов Electron
function killElectronProcesses() {
  const platform = os.platform();
  try {
    if (platform === 'win32') {
      console.log('🛑 Закрываем процессы Electron...');
      execSync('taskkill /F /IM electron.exe /T 2>nul || exit 0', { stdio: 'ignore' });
      execSync('taskkill /F /IM DevDuel.exe /T 2>nul || exit 0', { stdio: 'ignore' });
    } else if (platform === 'darwin') {
      execSync('pkill -f electron || true', { stdio: 'ignore' });
    } else {
      execSync('pkill -f electron || true', { stdio: 'ignore' });
    }
  } catch (error) {
    // Игнорируем ошибки, если процессов нет
  }
}

// Функция для удаления директории с retry
function removeDir(dirPath, retries = 3) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (let i = 0; i < retries; i++) {
    try {
      if (os.platform() === 'win32') {
        // Используем PowerShell для более надежного удаления
        execSync(`powershell -Command "if (Test-Path '${dirPath}') { Remove-Item -Recurse -Force '${dirPath}' -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
        // Проверяем, удалилась ли папка
        if (!fs.existsSync(dirPath)) {
          return;
        }
        // Если не удалилась, пробуем через cmd
        execSync(`rmdir /s /q "${dirPath}" 2>nul || exit 0`, { stdio: 'ignore' });
        // Небольшая задержка через timeout
        if (i < retries - 1) {
          execSync('timeout /t 1 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 2 >nul', { stdio: 'ignore' });
        }
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
        // Небольшая задержка
        if (i < retries - 1) {
          execSync('sleep 0.5 || true', { stdio: 'ignore' });
        }
      }
      
      if (!fs.existsSync(dirPath)) {
        return;
      }
    } catch (error) {
      if (i === retries - 1) {
        console.warn(`⚠️ Не удалось удалить ${dirPath}, но продолжаем сборку...`);
      }
    }
  }
}

// Очищаем папку release
const releaseDir = path.join(__dirname, 'release');
console.log('🧹 Очищаем папку release...');

// Закрываем процессы Electron перед очисткой
killElectronProcesses();

// Очищаем кэш winCodeSign для Windows (избегаем проблем с символическими ссылками)
if (os.platform() === 'win32') {
  const winCodeSignCache = path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache', 'winCodeSign');
  console.log('🧹 Очищаем кэш winCodeSign...');
  removeDir(winCodeSignCache);
}

const winUnpacked = path.join(releaseDir, 'win-unpacked');
const linuxUnpacked = path.join(releaseDir, 'linux-unpacked');
const macUnpacked = path.join(releaseDir, 'mac');
const appImage = path.join(releaseDir, '__appImage-x64');

// Удаляем unpacked директории
removeDir(winUnpacked);
removeDir(linuxUnpacked);
removeDir(macUnpacked);
removeDir(appImage);

console.log('✅ Очистка завершена!');


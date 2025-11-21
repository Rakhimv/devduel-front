import { execSync } from 'child_process';
import os from 'os';
import path from 'path';

const platform = os.platform();
let cachePath = '';

if (platform === 'win32') {
  cachePath = path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache');
} else if (platform === 'darwin') {
  cachePath = path.join(os.homedir(), 'Library', 'Caches', 'electron-builder');
} else {
  cachePath = path.join(os.homedir(), '.cache', 'electron-builder');
}

console.log('🧹 Очистка кэша electron-builder...');
console.log('Путь к кэшу:', cachePath);

try {
  if (platform === 'win32') {
    execSync(`rmdir /s /q "${cachePath}"`, { stdio: 'inherit' });
  } else {
    execSync(`rm -rf "${cachePath}"`, { stdio: 'inherit' });
  }
  console.log('✅ Кэш очищен!');
} catch (error) {
  console.log('⚠️ Не удалось очистить кэш автоматически. Попробуйте удалить вручную:', cachePath);
  console.log('Или запустите PowerShell от имени администратора и выполните:');
  console.log(`Remove-Item -Recurse -Force "${cachePath}"`);
}


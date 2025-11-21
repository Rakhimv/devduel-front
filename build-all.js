import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platform = os.platform();

console.log('🚀 Начинаем сборку для всех платформ...\n');

// Очищаем папку release перед сборкой
console.log('🧹 Очищаем папку release...');
try {
  execSync('node clean-release.js', { stdio: 'inherit', cwd: __dirname });
} catch (error) {
  console.warn('⚠️ Не удалось очистить release, продолжаем...');
}

const releaseDir = path.join(__dirname, 'release');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

console.log('📦 Сборка Windows...');
try {
  execSync('npm run dist:win', { stdio: 'inherit' });
  console.log('✅ Windows собран\n');
} catch (error) {
  console.error('❌ Ошибка сборки Windows:', error.message);
}

console.log('📦 Сборка macOS...');
if (platform === 'darwin') {
  try {
    execSync('npm run dist:mac', { stdio: 'inherit' });
    console.log('✅ macOS собран\n');
  } catch (error) {
    console.error('❌ Ошибка сборки macOS:', error.message);
  }
} else {
  console.log('⏭️  Пропущено: сборка macOS возможна только на macOS\n');
}

console.log('📦 Сборка Linux...');
if (platform === 'linux') {
  try {
    execSync('npm run dist:linux', { stdio: 'inherit' });
    console.log('✅ Linux собран\n');
  } catch (error) {
    console.error('❌ Ошибка сборки Linux:', error.message);
  }
} else {
  console.log('⏭️  Пропущено: сборка Linux рекомендуется на Linux системе\n');
  console.log('💡 Попробуем собрать Linux версию на Windows (может быть ограничено)...');
  try {
    execSync('npm run dist:linux', { stdio: 'inherit' });
    console.log('✅ Linux собран\n');
  } catch (error) {
    console.error('❌ Ошибка сборки Linux:', error.message);
  }
}

console.log('✨ Сборка завершена! Файлы находятся в папке release/');


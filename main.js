// main.mjs
import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, 'dist', 'index.html');

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    show: false,
    fullscreen: true, // ← ФУЛЛСКРИН ПРИ ЗАПУСКЕ
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: getIconPath(), // ← АВТОВЫБОР ИКОНКИ ПО ОС
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    kiosk: false, // можно true, если хочешь заблокировать выход
  });

  win.loadFile(indexPath).then(() => {
    // Редирект на /app (только в Electron)
    win.webContents.executeJavaScript(`
      if (window.location.hash !== '#/app') {
        window.location.hash = '#/app';
      }
    `);
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // Отладка (убери в продакшене)
  // win.webContents.openDevTools({ mode: 'detach' });
}

function getIconPath() {
  const platform = process.platform;
  const iconDir = path.join(__dirname, 'build');

  if (platform === 'win32') {
    return path.join(iconDir, 'favicon.ico');
  } else if (platform === 'darwin') {
    return path.join(iconDir, 'icon.icns');
  } else {
    return path.join(iconDir, 'icon.png');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
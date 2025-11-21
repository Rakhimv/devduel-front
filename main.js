import { app, BrowserWindow, screen } from 'electron';
import electronUpdater from 'electron-updater';
import path from 'path';
import { fileURLToPath } from 'url';

const { autoUpdater } = electronUpdater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, 'dist', 'index.html');
const splashPath = path.join(__dirname, 'splash.html');

let splashWindow = null;
let mainWindow = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 500,
    frame: false,
    transparent: false,
    backgroundColor: '#0A0A0A',
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(splashPath);
  splashWindow.center();
  splashWindow.setResizable(false);
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    backgroundColor: '#0A0A0A',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: getIconPath(),
    frame: true,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
  });

  mainWindow.loadFile(indexPath).then(() => {
    mainWindow.webContents.executeJavaScript(`
      if (window.location.hash !== '#/app') {
        window.location.hash = '#/app';
      }
    `);
  });

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
    mainWindow.setFullScreenable(true);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function checkForUpdates() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping update check in development');
    return;
  }

  try {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: 'https://devduel.ru/updates'
    });

    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', () => {
      console.log('Update available');
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded, will install on restart');
      autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', (error) => {
      console.log('Auto-updater error:', error);
    });
  } catch (error) {
    console.log('Failed to setup auto-updater:', error);
  }
}

function getIconPath() {
  const platform = process.platform;
  // В собранном приложении build находится в resources (extraResources)
  // В dev режиме - в корне проекта
  const iconDir = app.isPackaged 
    ? path.join(process.resourcesPath, 'build')
    : path.join(__dirname, 'build');

  if (platform === 'win32') {
    return path.join(iconDir, 'favicon.ico');
  } else if (platform === 'darwin') {
    return path.join(iconDir, 'icon.icns');
  } else {
    return path.join(iconDir, 'icon.png');
  }
}

app.whenReady().then(() => {
  createSplashWindow();
  setTimeout(() => {
    createWindow();
    checkForUpdates();
  }, 1500);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSplashWindow();
    setTimeout(() => {
      createWindow();
    }, 1500);
  }
});
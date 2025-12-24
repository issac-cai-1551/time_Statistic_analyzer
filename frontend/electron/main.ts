import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

// The built directory structure
//
// ├─┬─ dist
// │ ├─ index.html
// │ ├─ ...
// │ └─ ...
// ├─┬─ dist-electron
// │ ├── main.js
// │ └── ...

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
let floatWin: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

function getIconPath() {
  // Windows prefers .ico, others prefer .png. SVG is not well supported.
  const preferredIcons = ['icon.ico', 'icon.png', 'vite.svg']
  for (const iconName of preferredIcons) {
    const iconPath = path.join(process.env.VITE_PUBLIC, iconName)
    if (fs.existsSync(iconPath)) {
      return iconPath
    }
  }
  return path.join(process.env.VITE_PUBLIC, 'vite.svg')
}

function createFloatWindow() {
  if (floatWin) return

  floatWin = new BrowserWindow({
    width: 120,
    height: 120,
    // type: 'toolbar', // Removed to avoid potential input issues on Windows
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    floatWin.loadURL(VITE_DEV_SERVER_URL + '#/float')
    // Open devtools for debugging the float window
    floatWin.webContents.openDevTools({ mode: 'detach' })
  } else {
    floatWin.loadFile(path.join(process.env.DIST, 'index.html'), { hash: 'float' })
  }

  floatWin.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      floatWin?.hide()
    }
  })
}

function createTray() {
  const iconPath = getIconPath()
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show App', 
      click: () => {
        win?.show()
      } 
    },
    { 
      label: 'Quit', 
      click: () => {
        isQuitting = true
        app.quit()
      } 
    }
  ])
  
  tray.setToolTip('Time Statistic Analyzer')
  tray.setContextMenu(contextMenu)
  
  tray.on('double-click', () => {
    win?.show()
  })
}

function createWindow() {
  const iconPath = getIconPath()
  win = new BrowserWindow({
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this demo, usually true is better
    },
  })

  // Handle window close event
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      win?.hide()
      return false
    }
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // Do nothing, keep app running in tray
  if (process.platform === 'darwin') {
    // On macOS, we might want to quit if no windows are open, or keep it in dock.
    // But for tray app, we usually keep it running.
  }
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else {
    win?.show()
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()
  createFloatWindow()
  floatWin?.hide() // Start hidden

  ipcMain.handle('toggle-mini-mode', () => {
    // This is now "switch to float mode"
    if (win?.isVisible()) {
      win.hide()
      floatWin?.show()
      return true
    } else {
      floatWin?.hide()
      win?.show()
      return false
    }
  })

  ipcMain.handle('switch-to-main', () => {
    floatWin?.hide()
    win?.show()
    return false
  })

  // Broadcast timer changes to all windows
  ipcMain.on('timer-change', () => {
    BrowserWindow.getAllWindows().forEach(w => {
      w.webContents.send('timer-update')
    })
  })
})

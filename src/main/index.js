const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron')
const { clipVideo, getVideoInfo } = require('./ffmpeg')
const { getSettings, setSettings } = require('./settings')
const path = require('path')
const fs = require('fs')
const { autoUpdater } = require('electron-updater')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: '#0f0f0f',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      sandbox: false
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
})

app.whenReady().then(() => {
  if (!isDev) {
    autoUpdater.checkForUpdates()
  }
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Mise à jour disponible',
    message: 'Une mise à jour est prête. Redémarrer maintenant ?',
    buttons: ['Oui', 'Plus tard'],
    defaultId: 0,
  }).then(({ response }) => {
    if (response === 0) autoUpdater.quitAndInstall()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('dialog:openVideo', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'm4v'] }],
  })
  if (canceled) return null
  return filePaths[0]
})

ipcMain.handle('ffmpeg:info', async (_event, filePath) => {
  return getVideoInfo(filePath)
})

ipcMain.handle('ffmpeg:clip', async (event, { inputPath, startTime, endTime }) => {
  const { outputDir } = getSettings()
  try {
    const outputPath = await clipVideo(inputPath, startTime, endTime, outputDir, (progress) => {
      event.sender.send('clip-progress', progress)
    })
    return { success: true, outputPath }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('settings:get', () => getSettings())

ipcMain.handle('settings:set', (_event, updates) => setSettings(updates))

ipcMain.handle('settings:open-dir-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (canceled) return null
  return filePaths[0]
})

ipcMain.handle('clips:list', () => {
  const { outputDir, maxClips } = getSettings()
  const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'm4v']
  try {
    if (!fs.existsSync(outputDir)) return []
    return fs.readdirSync(outputDir)
      .filter(f => videoExts.includes(path.extname(f).slice(1).toLowerCase()))
      .map(f => {
        const fullPath = path.join(outputDir, f)
        const stat = fs.statSync(fullPath)
        return { name: f, path: fullPath, size: stat.size, mtime: stat.mtimeMs }
      })
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, maxClips)
  } catch {
    return []
  }
})

ipcMain.handle('clips:open-folder', () => {
  const { outputDir } = getSettings()
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  shell.openPath(outputDir)
})

ipcMain.handle('clips:reveal-file', (_e, filePath) => {
  shell.showItemInFolder(filePath)
})

ipcMain.handle('app:version', () => app.getVersion())

ipcMain.handle('window:close', (e) => {
  BrowserWindow.fromWebContents(e.sender).close()
})

ipcMain.handle('window:toggle-maximize', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  win.isMaximized() ? win.unmaximize() : win.maximize()
})

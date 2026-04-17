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

function resolveDir(outputDir, pathArr) {
  if (!pathArr || pathArr.length === 0) return outputDir
  return path.join(outputDir, ...pathArr)
}

ipcMain.handle('clips:list', (_e, pathArr) => {
  const { outputDir } = getSettings()
  const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'm4v']
  const dir = resolveDir(outputDir, pathArr)
  try {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir)
      .filter(f => videoExts.includes(path.extname(f).slice(1).toLowerCase()))
      .map(f => {
        const fullPath = path.join(dir, f)
        const stat = fs.statSync(fullPath)
        return { name: f, path: fullPath, size: stat.size, mtime: stat.mtimeMs }
      })
      .sort((a, b) => b.mtime - a.mtime)
  } catch {
    return []
  }
})

function countClipsRecursive(dir, videoExts) {
  let count = 0
  try {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f)
      try {
        if (fs.statSync(full).isDirectory()) {
          count += countClipsRecursive(full, videoExts)
        } else if (videoExts.includes(path.extname(f).slice(1).toLowerCase())) {
          count++
        }
      } catch {}
    }
  } catch {}
  return count
}

ipcMain.handle('clips:list-folders', (_e, pathArr) => {
  const { outputDir } = getSettings()
  const dir = resolveDir(outputDir, pathArr)
  const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'm4v']
  try {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir)
      .filter(f => {
        try { return fs.statSync(path.join(dir, f)).isDirectory() } catch { return false }
      })
      .map(f => {
        const folderPath = path.join(dir, f)
        return { name: f, path: folderPath, clipCount: countClipsRecursive(folderPath, videoExts) }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
})

ipcMain.handle('clips:create-folder', (_e, { pathArr, name }) => {
  const { outputDir } = getSettings()
  const folderPath = path.join(resolveDir(outputDir, pathArr), name)
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true })
  return folderPath
})

ipcMain.handle('clips:move-clip', (_e, { clipPath, targetPathArr }) => {
  const { outputDir } = getSettings()
  const fileName = path.basename(clipPath)
  const destDir = resolveDir(outputDir, targetPathArr)
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
  const destPath = path.join(destDir, fileName)
  fs.renameSync(clipPath, destPath)
  return destPath
})

ipcMain.handle('clips:delete', (_e, filePath) => {
  fs.unlinkSync(filePath)
})

ipcMain.handle('clips:delete-folder', (_e, { folderPath, action, parentPathArr }) => {
  const { outputDir } = getSettings()
  const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'm4v']

  if (action === 'rmdir' || action === 'delete-all') {
    fs.rmSync(folderPath, { recursive: true, force: true })
    return
  }

  const destDir = action === 'move-to-root'
    ? outputDir
    : resolveDir(outputDir, parentPathArr)

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })

  function moveClipsFrom(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f)
      try {
        if (fs.statSync(full).isDirectory()) {
          moveClipsFrom(full)
        } else if (videoExts.includes(path.extname(f).slice(1).toLowerCase())) {
          let dest = path.join(destDir, f)
          if (fs.existsSync(dest)) {
            const ext = path.extname(f)
            dest = path.join(destDir, `${path.basename(f, ext)}_moved${ext}`)
          }
          fs.renameSync(full, dest)
        }
      } catch {}
    }
  }

  moveClipsFrom(folderPath)
  fs.rmSync(folderPath, { recursive: true, force: true })
})

ipcMain.handle('clips:rename-folder', (_e, { folderPath, newName }) => {
  const dir = path.dirname(folderPath)
  const newPath = path.join(dir, newName)
  fs.renameSync(folderPath, newPath)
  return newPath
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

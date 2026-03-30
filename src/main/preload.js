const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  openVideo: () => ipcRenderer.invoke('dialog:openVideo'),
  clipVideo: (args) => ipcRenderer.invoke('ffmpeg:clip', args),
  getVideoInfo: (filePath) => ipcRenderer.invoke('ffmpeg:info', filePath),
  getPathForFile: (file) => webUtils.getPathForFile(file),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (updates) => ipcRenderer.invoke('settings:set', updates),
  openDirDialog: () => ipcRenderer.invoke('settings:open-dir-dialog'),

  listClips: () => ipcRenderer.invoke('clips:list'),
  openClipsFolder: () => ipcRenderer.invoke('clips:open-folder'),
  revealClipFile: (filePath) => ipcRenderer.invoke('clips:reveal-file', filePath),

  onClipProgress: (cb) => {
    const handler = (_e, data) => cb(data)
    ipcRenderer.on('clip-progress', handler)
    return () => ipcRenderer.removeListener('clip-progress', handler)
  },
})

const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  openVideo: () => ipcRenderer.invoke('dialog:openVideo'),
  clipVideo: (args) => ipcRenderer.invoke('ffmpeg:clip', args),
  getVideoInfo: (filePath) => ipcRenderer.invoke('ffmpeg:info', filePath),
  getPathForFile: (file) => webUtils.getPathForFile(file),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (updates) => ipcRenderer.invoke('settings:set', updates),
  openDirDialog: () => ipcRenderer.invoke('settings:open-dir-dialog'),

  listClips: (pathArr) => ipcRenderer.invoke('clips:list', pathArr),
  listFolders: (pathArr) => ipcRenderer.invoke('clips:list-folders', pathArr),
  createFolder: (args) => ipcRenderer.invoke('clips:create-folder', args),
  moveClip: (args) => ipcRenderer.invoke('clips:move-clip', args),
  deleteClip: (filePath) => ipcRenderer.invoke('clips:delete', filePath),
  deleteFolder: (args) => ipcRenderer.invoke('clips:delete-folder', args),
  renameFolder: (args) => ipcRenderer.invoke('clips:rename-folder', args),
  openClipsFolder: () => ipcRenderer.invoke('clips:open-folder'),
  revealClipFile: (filePath) => ipcRenderer.invoke('clips:reveal-file', filePath),
  getVersion: () => ipcRenderer.invoke('app:version'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),

  onClipProgress: (cb) => {
    const handler = (_e, data) => cb(data)
    ipcRenderer.on('clip-progress', handler)
    return () => ipcRenderer.removeListener('clip-progress', handler)
  },
})

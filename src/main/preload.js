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
  copyClip: (filePath) => ipcRenderer.invoke('clips:copy', filePath),
  checkAudioBatch: (paths) => ipcRenderer.invoke('clips:check-audio-batch', paths),
  listFolders: (pathArr) => ipcRenderer.invoke('clips:list-folders', pathArr),
  createFolder: (args) => ipcRenderer.invoke('clips:create-folder', args),
  moveClip: (args) => ipcRenderer.invoke('clips:move-clip', args),
  deleteClip: (filePath) => ipcRenderer.invoke('clips:delete', filePath),
  deleteFolder: (args) => ipcRenderer.invoke('clips:delete-folder', args),
  renameFolder: (args) => ipcRenderer.invoke('clips:rename-folder', args),
  openClipsFolder: () => ipcRenderer.invoke('clips:open-folder'),
  revealClipFile: (filePath) => ipcRenderer.invoke('clips:reveal-file', filePath),
  getVersion: () => ipcRenderer.invoke('app:version'),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),

  onClipProgress: (cb) => {
    const handler = (_e, data) => cb(data)
    ipcRenderer.on('clip-progress', handler)
    return () => ipcRenderer.removeListener('clip-progress', handler)
  },

  stripAudio: (filePath) => ipcRenderer.invoke('ffmpeg:strip-audio', filePath),
  restoreAudio: (filePath) => ipcRenderer.invoke('ffmpeg:restore-audio', filePath),
  onAudioProcessProgress: (cb) => {
    const handler = (_e, data) => cb(data)
    ipcRenderer.on('audio-process-progress', handler)
    return () => ipcRenderer.removeListener('audio-process-progress', handler)
  },
})

import { useState, useRef, useCallback, useEffect } from 'react'
import VideoPlayer from './components/VideoPlayer'
import Clipper from './components/Clipper'
import SettingsPanel from './components/SettingsPanel'
import ClipsList from './components/ClipsList'
import Logo from './components/Logo'

export default function App() {
  const [version, setVersion] = useState('')
  const [videoPath, setVideoPath] = useState(null)

  useEffect(() => {
    window.electron.getVersion().then(setVersion)
  }, [])
  const [videoSrc, setVideoSrc] = useState(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [startOffset, setStartOffset] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [clipsRefreshKey, setClipsRefreshKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fileSize, setFileSize] = useState(null)
  const videoRef = useRef(null)
  const hasGoodDuration = useRef(false)

  const loadVideo = useCallback(async (filePath) => {
    hasGoodDuration.current = false
    setLoading(true)
    setVideoPath(filePath)
    setVideoSrc(encodeURI(`file://${filePath.replace(/\\/g, '/')}`))
    setStartOffset(0)

    const [info] = await Promise.all([
      window.electron.getVideoInfo(filePath),
      new Promise(resolve => setTimeout(resolve, 1200)),
    ])
    if (info.startTime > 1) setStartOffset(info.startTime)
    if (info.duration) {
      hasGoodDuration.current = true
      setDuration(info.duration)
    }
    if (info.fileSize) setFileSize(info.fileSize)
    setLoading(false)
  }, [])

  const handleClose = () => {
    setVideoPath(null)
    setVideoSrc(null)
    setDuration(0)
    setCurrentTime(0)
    setStartOffset(0)
    setFileSize(null)
    hasGoodDuration.current = false
  }

  const handleOpenFile = async () => {
    const filePath = await window.electron.openVideo()
    if (!filePath) return
    loadVideo(filePath)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    const supported = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'm4v']
    if (!supported.includes(ext)) return
    loadVideo(window.electron.getPathForFile(file))
  }, [loadVideo])

  const handleDragOver = (e) => e.preventDefault()

  const seekTo = (time) => {
    if (videoRef.current) videoRef.current.currentTime = time
  }

  return (
    <div className="app" onDrop={handleDrop} onDragOver={handleDragOver}>
      <header className="header">
        <span className="logo"><Logo size={22} /><span>my-clipper</span></span>
        <div className="header-actions">
          {videoSrc && <button className="btn-open" onClick={handleClose}>Close</button>}
          <button className="btn-open" onClick={handleOpenFile}>Open video</button>
          {videoSrc && fileSize && (
            <div className="stats-wrap">
              <button className="btn-icon" title="Stats">ℹ</button>
              <div className="stats-tooltip">
                <div className="stats-row"><span>File</span><span>{videoPath.split(/[\\/]/).pop()}</span></div>
                <div className="stats-row"><span>Size</span><span>{fileSize >= 1024 ** 3 ? `${(fileSize / 1024 ** 3).toFixed(2)} GB` : fileSize >= 1024 ** 2 ? `${(fileSize / 1024 ** 2).toFixed(1)} MB` : `${(fileSize / 1024).toFixed(0)} KB`}</span></div>
                <div className="stats-row"><span>Duration</span><span>{Math.floor(duration / 3600) > 0 ? `${Math.floor(duration / 3600)}h ` : ''}{Math.floor((duration % 3600) / 60)}m {Math.floor(duration % 60)}s</span></div>
              </div>
            </div>
          )}
          <button className="btn-icon" onClick={() => setSettingsOpen(true)} title="Settings">⚙</button>
          <button className="btn-icon" onClick={() => window.electron.toggleMaximize()} title="Maximize">⛶</button>
          <button className="btn-icon btn-close-app" onClick={() => window.electron.closeWindow()} title="Quit">✕</button>
        </div>
      </header>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span>Loading…</span>
        </div>
      )}

      {!videoSrc ? (
        <div className="home-page">
          <div className="drop-zone" onClick={handleOpenFile}>
            <div className="drop-zone-inner">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 10l4.553-2.07A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
              <p>Drop a video here</p>
              <span>or click to browse</span>
            </div>
          </div>
          <ClipsList onLoad={loadVideo} refreshKey={clipsRefreshKey} />
        </div>
      ) : (
        <div className="workspace">
          <VideoPlayer
            src={videoSrc}
            videoRef={videoRef}
            onDurationChange={(d) => { if (!hasGoodDuration.current) setDuration(d) }}
            onTimeUpdate={setCurrentTime}
          />
          <Clipper
            duration={duration}
            currentTime={currentTime}
            videoPath={videoPath}
            startOffset={startOffset}
            seekTo={seekTo}
            onClipDone={() => setClipsRefreshKey((k) => k + 1)}
          />
        </div>
      )}

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} version={version} />}
    </div>
  )
}

import { useState, useEffect } from 'react'

function formatSize(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function formatDate(ms) {
  return new Date(ms).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function ClipThumb({ filePath }) {
  const src = encodeURI(`file://${filePath.replace(/\\/g, '/')}`)
  return (
    <video
      className="clip-thumb"
      src={src}
      muted
      preload="metadata"
      onLoadedMetadata={(e) => { e.target.currentTime = 2 }}
    />
  )
}

export default function ClipsList({ onLoad, refreshKey }) {
  const [clips, setClips] = useState([])

  useEffect(() => {
    window.electron.listClips().then(setClips)
  }, [refreshKey])

  if (clips.length === 0) return null

  return (
    <div className="clips-section">
      <div className="clips-header">
        <span>Recent clips</span>
        <button className="btn-text" onClick={() => window.electron.openClipsFolder()}>
          Open folder ↗
        </button>
      </div>
      <div className="clips-grid">
        {clips.map((clip) => (
          <div key={clip.path} className="clip-item" onClick={() => onLoad(clip.path)}>
            <ClipThumb filePath={clip.path} />
            <div className="clip-info">
              <span className="clip-name">{clip.name}</span>
              <span className="clip-meta">{formatSize(clip.size)} · {formatDate(clip.mtime)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

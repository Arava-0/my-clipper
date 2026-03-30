import { useState, useEffect, useRef } from 'react'

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
  const ref = useRef(null)
  const drag = useRef({ active: false, startY: 0, startScroll: 0 })

  useEffect(() => {
    window.electron.listClips().then(setClips)
  }, [refreshKey])

  const onMouseDown = (e) => {
    if (e.button !== 0) return
    drag.current = { active: true, startY: e.clientY, startScroll: ref.current.scrollTop }
    ref.current.style.cursor = 'grabbing'
    e.preventDefault()
  }

  const onMouseMove = (e) => {
    if (!drag.current.active) return
    ref.current.scrollTop = drag.current.startScroll - (e.clientY - drag.current.startY)
  }

  const onMouseUp = () => {
    drag.current.active = false
    if (ref.current) ref.current.style.cursor = ''
  }

  if (clips.length === 0) return null

  return (
    <div
      className="clips-section"
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="clips-header">
        <span>Recent clips</span>
        <button className="btn-text" onClick={() => window.electron.openClipsFolder()}>
          Open folder ↗
        </button>
      </div>
      <div className="clips-grid">
        {clips.map((clip) => (
          <div key={clip.path} className="clip-item" onMouseUp={(e) => {
            if (Math.abs(e.clientY - drag.current.startY) < 5) onLoad(clip.path)
          }}>
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

import { useState, useEffect } from 'react'

function formatTime(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00:00.000'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = (s % 60).toFixed(3)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(6, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(6, '0')}`
}

function formatSize(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

export default function Clipper({ duration, currentTime, videoPath, startOffset, seekTo, onClipDone }) {
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [status, setStatus] = useState(null)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    setStartTime(0)
    setEndTime(0)
    setStatus(null)
    setProgress(null)
  }, [videoPath])

  const setStart = () => setStartTime(currentTime)
  const setEnd = () => setEndTime(currentTime)

  const handleClip = async () => {
    if (startTime >= endTime) {
      setStatus({ error: 'Start must be before end.' })
      return
    }
    setStatus('clipping')
    setProgress(null)

    const off = window.electron.onClipProgress((data) => setProgress(data))

    const result = await window.electron.clipVideo({
      inputPath: videoPath,
      startTime: startTime + startOffset,
      endTime: endTime + startOffset,
    })

    off()
    setProgress(null)

    if (result.success) {
      setStatus({ ok: true, path: result.outputPath })
      onClipDone?.()
    } else {
      setStatus({ error: result.error })
    }
  }

  const rangePercent = duration > 0
    ? { left: `${(startTime / duration) * 100}%`, width: `${((endTime - startTime) / duration) * 100}%` }
    : { left: '0%', width: '0%' }

  const playheadPercent = duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'

  return (
    <div className="clipper">
      {/* Timeline */}
      <div className="timeline-wrap">
        <div className="timeline" onClick={(e) => {
          if (!duration) return
          const rect = e.currentTarget.getBoundingClientRect()
          seekTo((e.clientX - rect.left) / rect.width * duration)
        }}>
          <div className="timeline-range" style={rangePercent} />
          <div className="playhead" style={{ left: playheadPercent }} />
        </div>
        <div className="timeline-labels">
          <span>0:00</span>
          <span className="playhead-time" style={{ left: playheadPercent }}>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="point-group">
          <button className="btn-point" onClick={setStart}>Set Start</button>
          <input
            className="time-input"
            type="number"
            min="0"
            max={duration}
            step="0.001"
            value={startTime.toFixed(3)}
            onChange={(e) => setStartTime(Math.max(0, Math.min(duration, parseFloat(e.target.value) || 0)))}
          />
          <span className="time-display">{formatTime(startTime)}</span>
        </div>

        <button className="btn-clip" onClick={handleClip} disabled={status === 'clipping'}>
          {status === 'clipping' ? 'Clipping...' : '✂ Clip'}
        </button>

        <div className="point-group right">
          <span className="time-display">{formatTime(endTime)}</span>
          <input
            className="time-input"
            type="number"
            min="0"
            max={duration}
            step="0.001"
            value={endTime.toFixed(3)}
            onChange={(e) => setEndTime(Math.max(0, Math.min(duration, parseFloat(e.target.value) || 0)))}
          />
          <button className="btn-point" onClick={setEnd}>Set End</button>
        </div>
      </div>

      {/* Progress */}
      {status === 'clipping' && (
        <div className="clip-progress">
          <div className="clip-progress-bar">
            <div className="clip-progress-fill" style={{ width: `${progress?.percent ?? 0}%` }} />
          </div>
          <span className="clip-progress-info">
            {progress
              ? `${progress.percent}% · ${formatSize(progress.size)} · ${progress.speed}`
              : 'Starting…'}
          </span>
        </div>
      )}

      {/* Status */}
      {status && status !== 'clipping' && (
        <div className={`status ${status.ok ? 'status-ok' : 'status-err'}`}>
          {status.ok ? (
            <>
              <span>Saved: {status.path}</span>
              <button className="btn-reveal" onClick={() => window.electron.revealClipFile(status.path)}>
                Voir dans le dossier
              </button>
            </>
          ) : `Error: ${status.error}`}
        </div>
      )}
    </div>
  )
}

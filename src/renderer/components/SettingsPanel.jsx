import { useState, useEffect } from 'react'

export default function SettingsPanel({ onClose }) {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    window.electron.getSettings().then(setSettings)
  }, [])

  const handleChangeDir = async () => {
    const dir = await window.electron.openDirDialog()
    if (!dir) return
    const updated = await window.electron.setSettings({ outputDir: dir })
    setSettings(updated)
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span>Settings</span>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        {settings && (
          <div className="settings-body">
            <span className="settings-label">Output folder</span>
            <div className="settings-dir-row">
              <span className="settings-dir-path" title={settings.outputDir}>
                {settings.outputDir}
              </span>
              <button className="btn-open" onClick={handleChangeDir}>Change</button>
            </div>
            <button className="btn-text" onClick={() => window.electron.openClipsFolder()}>
              Open in Explorer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

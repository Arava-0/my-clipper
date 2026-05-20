import { useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment } from 'react'

const IconArrowUp = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
)
const IconFolder = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 012-2h4.17a2 2 0 011.42.59l1.83 1.82A2 2 0 0013.83 8H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
  </svg>
)
const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconTrash = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/>
  </svg>
)
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconHome = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M3 12v9h18v-9"/>
  </svg>
)
const IconFolderPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 012-2h4.17a2 2 0 011.42.59l1.83 1.82A2 2 0 0013.83 8H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
    <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
)
const IconExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const IconVolumeOff = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
)
const IconVolumeOn = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
  </svg>
)

function formatSize(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function formatDate(ms) {
  return new Date(ms).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function ClipCard({ clip, isSelected, processingPercent, copyState, onContextMenu, onMouseUp, onDragStart, onDragEnd }) {
  const src = encodeURI(`file://${clip.path.replace(/\\/g, '/')}`)
  const videoRef = useRef(null)

  return (
    <div
      className={`clip-item${isSelected ? ' clip-selected' : ''}`}
      onContextMenu={onContextMenu}
      onMouseUp={onMouseUp}
    >
      <div
        className="clip-drag-handle"
        title="Glisser vers un dossier"
        draggable
        onMouseDown={e => e.stopPropagation()}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        ⠿
      </div>
      {isSelected && <div className="clip-check">✓</div>}
      <video
        ref={videoRef}
        className="clip-thumb"
        src={src}
        muted
        preload="metadata"
        onLoadedMetadata={(e) => { e.target.currentTime = 2 }}
        onMouseEnter={() => videoRef.current?.play()}
        onMouseLeave={() => {
          if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 2 }
        }}
      />
      <div className="clip-processing-bar">
        <div className="clip-processing-fill" style={{ width: processingPercent !== null ? `${processingPercent}%` : '0%', opacity: processingPercent !== null ? 1 : 0 }} />
      </div>
      <div className="clip-info">
        <span className="clip-name">{clip.name}</span>
        <span className="clip-meta">
          <span>{formatSize(clip.size)} · {formatDate(clip.mtime)}</span>
          {copyState === 'copying' && <span className="clip-audio-checking" title="Copie en cours..." />}
          {copyState === 'done' && <span className="clip-copy-done" title="Copié !"><IconCheck /></span>}
          {!copyState && clip.hasAudio === null && <span className="clip-audio-checking" />}
          {clip.hasAudio === false && <span className="clip-no-audio-icon"><IconVolumeOff size={14} /></span>}
          {clip.hasAudio === 'muted' && <span className="clip-no-audio-icon" style={{ color: '#f4a261' }}><IconVolumeOff size={14} /></span>}
        </span>
      </div>
    </div>
  )
}

function ContextMenu({ x, y, folders, onMoveToParent, onMoveToFolder, onReveal, onCopy, onDelete, onMuteAudio, onRestoreAudio, onClose }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ top: y, left: x })

  useEffect(() => {
    const h = () => onClose()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  useLayoutEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const top = y + rect.height > window.innerHeight - 8 ? y - rect.height : y
    const left = x + rect.width > window.innerWidth - 8 ? x - rect.width : x
    setPos({ top, left })
  }, [x, y])

  return (
    <div ref={ref} className="context-menu" style={{ top: pos.top, left: pos.left }} onMouseDown={e => e.stopPropagation()}>
      {(onMoveToParent || folders.length > 0) && (
        <>
          <div className="context-menu-section">Déplacer vers</div>
          {onMoveToParent && (
            <button className="context-menu-item" onClick={onMoveToParent.fn}>
              <span className="context-menu-icon"><IconArrowUp /></span> {onMoveToParent.label}
            </button>
          )}
          {folders.map(f => (
            <button key={f.name} className="context-menu-item" onClick={() => onMoveToFolder(f.name)}>
              <span className="context-menu-icon"><IconFolder /></span> {f.name}
            </button>
          ))}
          {!onMoveToParent && folders.length === 0 && (
            <span className="context-menu-empty">Aucun dossier</span>
          )}
          <div className="context-menu-divider" />
        </>
      )}
      <button className="context-menu-item" onClick={onReveal}>
        <span className="context-menu-icon"><IconEye /></span> Voir dans le dossier
      </button>
      <button className="context-menu-item" onClick={onCopy}>
        <span className="context-menu-icon"><IconCopy /></span> Copier le clip
      </button>
      {onMuteAudio && (
        <button className="context-menu-item" onClick={onMuteAudio}>
          <span className="context-menu-icon"><IconVolumeOff /></span> Désactiver l'audio
        </button>
      )}
      {onRestoreAudio && (
        <button className="context-menu-item" onClick={onRestoreAudio}>
          <span className="context-menu-icon"><IconVolumeOn /></span> Activer l'audio
        </button>
      )}
      <div className="context-menu-divider" />
      <button className="context-menu-item context-menu-danger" onClick={onDelete}>
        <span className="context-menu-icon"><IconTrash /></span> Supprimer le clip
      </button>
    </div>
  )
}

function FolderContextMenu({ x, y, onRename, onDelete, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const h = () => onClose()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  return (
    <div ref={ref} className="context-menu" style={{ top: y, left: x }} onMouseDown={e => e.stopPropagation()}>
      <button className="context-menu-item" onClick={onRename}>
        <span className="context-menu-icon"><IconEdit /></span> Renommer
      </button>
      <div className="context-menu-divider" />
      <button className="context-menu-item context-menu-danger" onClick={onDelete}>
        <span className="context-menu-icon"><IconTrash /></span> Supprimer le dossier
      </button>
    </div>
  )
}

function ConfirmModal({ clip, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onMouseDown={onCancel}>
      <div className="confirm-modal" onMouseDown={e => e.stopPropagation()}>
        <p className="confirm-title">Supprimer ce clip ?</p>
        <p className="confirm-name">{clip.name}</p>
        <div className="confirm-actions">
          <button className="btn-open" onClick={onCancel}>Annuler</button>
          <button className="btn-danger" onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDeleteSelectionModal({ count, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onMouseDown={onCancel}>
      <div className="confirm-modal" onMouseDown={e => e.stopPropagation()}>
        <p className="confirm-title">Supprimer {count} clip{count > 1 ? 's' : ''} ?</p>
        <p className="confirm-name">Cette action est irréversible.</p>
        <div className="confirm-actions">
          <button className="btn-open" onClick={onCancel}>Annuler</button>
          <button className="btn-danger" onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  )
}

function DeleteFolderModal({ folder, currentPath, onAction, onCancel }) {
  const isAtRoot = currentPath.length === 0
  const parentName = !isAtRoot ? currentPath[currentPath.length - 1] : null

  if (folder.clipCount === 0) {
    return (
      <div className="confirm-overlay" onMouseDown={onCancel}>
        <div className="confirm-modal" onMouseDown={e => e.stopPropagation()}>
          <p className="confirm-title">Supprimer le dossier ?</p>
          <p className="confirm-name"><IconFolder size={15} /> {folder.name}</p>
          <div className="confirm-actions">
            <button className="btn-open" onClick={onCancel}>Annuler</button>
            <button className="btn-danger" onClick={() => onAction('rmdir')}>Supprimer</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="confirm-overlay" onMouseDown={onCancel}>
      <div className="confirm-modal delete-folder-modal" onMouseDown={e => e.stopPropagation()}>
        <p className="confirm-title">Supprimer le dossier ?</p>
        <p className="confirm-name"><IconFolder size={15} /> {folder.name}</p>
        <p className="delete-folder-subtitle">
          Ce dossier contient <strong>{folder.clipCount} clip{folder.clipCount > 1 ? 's' : ''}</strong>.
          Que faire des clips ?
        </p>
        <div className="delete-folder-options">
          {!isAtRoot && (
            <button className="delete-folder-option" onClick={() => onAction('move-to-parent')}>
              <span className="delete-folder-option-icon"><IconArrowUp size={15} /></span>
              <span className="delete-folder-option-text">
                <strong>Déplacer vers "{parentName}"</strong>
                <em>Les clips seront déplacés dans le dossier parent</em>
              </span>
            </button>
          )}
          <button className="delete-folder-option" onClick={() => onAction('move-to-root')}>
            <span className="delete-folder-option-icon"><IconHome size={15} /></span>
            <span className="delete-folder-option-text">
              <strong>{isAtRoot ? 'Déplacer vers la racine' : 'Déplacer vers la racine du projet'}</strong>
              <em>Les clips seront déplacés à la racine des clips</em>
            </span>
          </button>
          <button className="delete-folder-option delete-folder-option-danger" onClick={() => onAction('delete-all')}>
            <span className="delete-folder-option-icon"><IconTrash size={15} /></span>
            <span className="delete-folder-option-text">
              <strong>Supprimer tous les clips</strong>
              <em>Les clips seront définitivement supprimés</em>
            </span>
          </button>
        </div>
        <button className="btn-text" onClick={onCancel} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
          Annuler
        </button>
      </div>
    </div>
  )
}

export default function ClipsList({ onLoad, refreshKey, settings }) {
  const maxClips = settings?.maxClips ?? 20
  const deleteConfirmation = settings?.deleteConfirmation ?? true

  const [clips, setClips] = useState([])
  const [folders, setFolders] = useState([])
  const [currentPath, setCurrentPath] = useState([])
  const [visibleCount, setVisibleCount] = useState(maxClips)
  const [selectedPaths, setSelectedPaths] = useState(new Set())
  const [selectionMoveOpen, setSelectionMoveOpen] = useState(false)
  const [confirmDeleteSelection, setConfirmDeleteSelection] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [folderContextMenu, setFolderContextMenu] = useState(null)
  const [deletingFolder, setDeletingFolder] = useState(null)
  const [renamingFolder, setRenamingFolder] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [dragOverTarget, setDragOverTarget] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [newFolderMode, setNewFolderMode] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [loading, setLoading] = useState(true)
  const [audioProcessing, setAudioProcessing] = useState(null)
  const [clipCopying, setClipCopying] = useState(null)
  const ref = useRef(null)
  const drag = useRef({ active: false, startY: 0, startScroll: 0 })
  const draggingClip = useRef(null)
  const fetchedAudioPaths = useRef(new Set())

  const loadData = useCallback(async (pathArr) => {
    fetchedAudioPaths.current = new Set()
    setLoading(true)
    const [c, f] = await Promise.all([
      window.electron.listClips(pathArr),
      window.electron.listFolders(pathArr),
    ])
    setClips(c)
    setFolders(f)
    setSelectedPaths(new Set())
    setLoading(false)
  }, [])

  useEffect(() => { loadData(currentPath) }, [refreshKey, currentPath, loadData])
  useEffect(() => { setVisibleCount(maxClips) }, [maxClips])

  useEffect(() => {
    if (loading) return
    const toFetch = clips.slice(0, visibleCount)
      .filter(c => c.hasAudio === null && !fetchedAudioPaths.current.has(c.path))
    if (toFetch.length === 0) return
    toFetch.forEach(c => fetchedAudioPaths.current.add(c.path))
    window.electron.checkAudioBatch(toFetch.map(c => c.path)).then(results => {
      setClips(prev => {
        const map = new Map(results.map(r => [r.path, r.hasAudio]))
        return prev.map(c => map.has(c.path) ? { ...c, hasAudio: map.get(c.path) } : c)
      })
    })
  }, [visibleCount, clips, loading])

  useEffect(() => {
    if (!selectionMoveOpen) return
    const h = () => setSelectionMoveOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [selectionMoveOpen])

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

  const handleClipDragStart = (e, clip) => {
    draggingClip.current = clip
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', clip.path)
  }
  const handleClipDragEnd = () => {
    draggingClip.current = null
    setDragOverTarget(null)
  }

  const performMove = async (targetPathArr) => {
    if (!draggingClip.current) return
    const movedPath = draggingClip.current.path
    await window.electron.moveClip({ clipPath: movedPath, targetPathArr })
    draggingClip.current = null
    setDragOverTarget(null)
    setClips(prev => prev.filter(c => c.path !== movedPath))
  }

  const dragOver = (e, target) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget(target)
  }
  const dragLeave = () => setDragOverTarget(null)

  const handleClipClick = (e, clip) => {
    if (Math.abs(e.clientY - drag.current.startY) >= 5) return
    if (e.ctrlKey || e.metaKey) {
      setSelectedPaths(prev => {
        const next = new Set(prev)
        next.has(clip.path) ? next.delete(clip.path) : next.add(clip.path)
        return next
      })
    } else {
      setSelectedPaths(new Set())
      onLoad(clip.path)
    }
  }

  const handleRightClick = (e, clip) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, clip })
  }

  const handleContextMoveToParent = async () => {
    const movedPath = contextMenu.clip.path
    await window.electron.moveClip({ clipPath: movedPath, targetPathArr: currentPath.slice(0, -1) })
    setContextMenu(null)
    setClips(prev => prev.filter(c => c.path !== movedPath))
  }

  const handleContextMoveToFolder = async (folderName) => {
    const movedPath = contextMenu.clip.path
    await window.electron.moveClip({ clipPath: movedPath, targetPathArr: [...currentPath, folderName] })
    setContextMenu(null)
    setClips(prev => prev.filter(c => c.path !== movedPath))
  }

  const handleCopyClip = async () => {
    const clip = contextMenu.clip
    setContextMenu(null)
    setClipCopying({ path: clip.path, done: false })
    await window.electron.copyClip(clip.path)
    setClipCopying({ path: clip.path, done: true })
    setTimeout(() => setClipCopying(null), 1500)
  }

const handleMuteAudio = async () => {
    const clip = contextMenu.clip
    setContextMenu(null)
    setAudioProcessing({ path: clip.path, percent: 0 })
    const off = window.electron.onAudioProcessProgress(({ percent }) => {
      setAudioProcessing({ path: clip.path, percent })
    })
    await window.electron.stripAudio(clip.path)
    off()
    setAudioProcessing(null)
    setClips(prev => prev.map(c => c.path === clip.path ? { ...c, hasAudio: 'muted' } : c))
  }

  const handleRestoreAudio = async () => {
    const clip = contextMenu.clip
    setContextMenu(null)
    setAudioProcessing({ path: clip.path, percent: 0 })
    const off = window.electron.onAudioProcessProgress(({ percent }) => {
      setAudioProcessing({ path: clip.path, percent })
    })
    await window.electron.restoreAudio(clip.path)
    off()
    setAudioProcessing(null)
    setClips(prev => prev.map(c => c.path === clip.path ? { ...c, hasAudio: true } : c))
  }

const handleDeleteRequest = () => {
    const clip = contextMenu.clip
    setContextMenu(null)
    if (deleteConfirmation) {
      setConfirmDelete(clip)
    } else {
      window.electron.deleteClip(clip.path).then(() => setClips(prev => prev.filter(c => c.path !== clip.path)))
    }
  }

  const doDeleteClip = async () => {
    const deletedPath = confirmDelete.path
    await window.electron.deleteClip(deletedPath)
    setConfirmDelete(null)
    setClips(prev => prev.filter(c => c.path !== deletedPath))
  }

  const handleFolderRightClick = (e, folder) => {
    e.preventDefault()
    e.stopPropagation()
    setFolderContextMenu({ x: e.clientX, y: e.clientY, folder })
  }

  const openRenameFolder = () => {
    const folder = folderContextMenu.folder
    setFolderContextMenu(null)
    setRenamingFolder(folder)
    setRenameValue(folder.name)
  }

  const handleRenameSubmit = async (e) => {
    e?.preventDefault()
    const name = renameValue.trim()
    if (!name || name === renamingFolder.name) {
      setRenamingFolder(null)
      return
    }
    await window.electron.renameFolder({ folderPath: renamingFolder.path, newName: name })
    setRenamingFolder(null)
    loadData(currentPath)
  }

  const openDeleteFolderModal = () => {
    const folder = folderContextMenu.folder
    setFolderContextMenu(null)
    if (folder.clipCount === 0 && !deleteConfirmation) {
      window.electron.deleteFolder({ folderPath: folder.path, action: 'rmdir', parentPathArr: currentPath })
        .then(() => setFolders(prev => prev.filter(f => f.path !== folder.path)))
      return
    }
    setDeletingFolder(folder)
  }

  const handleFolderDeleteAction = async (action) => {
    const folder = deletingFolder
    setDeletingFolder(null)
    await window.electron.deleteFolder({ folderPath: folder.path, action, parentPathArr: currentPath })
    if (action === 'delete-all' || action === 'rmdir') {
      setFolders(prev => prev.filter(f => f.path !== folder.path))
    } else {
      loadData(currentPath)
    }
  }

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    const name = newFolderName.trim()
    if (!name) return
    await window.electron.createFolder({ pathArr: currentPath, name })
    setNewFolderName('')
    setNewFolderMode(false)
    loadData(currentPath)
  }

  const handleSelectionMoveToFolder = async (folderName) => {
    const moved = new Set(selectedPaths)
    await Promise.all([...moved].map(p =>
      window.electron.moveClip({ clipPath: p, targetPathArr: [...currentPath, folderName] })
    ))
    setSelectionMoveOpen(false)
    setSelectedPaths(new Set())
    setClips(prev => prev.filter(c => !moved.has(c.path)))
  }

  const handleSelectionMoveToParent = async () => {
    const moved = new Set(selectedPaths)
    await Promise.all([...moved].map(p =>
      window.electron.moveClip({ clipPath: p, targetPathArr: currentPath.slice(0, -1) })
    ))
    setSelectionMoveOpen(false)
    setSelectedPaths(new Set())
    setClips(prev => prev.filter(c => !moved.has(c.path)))
  }

  const doDeleteSelection = async () => {
    const deleted = new Set(selectedPaths)
    await Promise.all([...deleted].map(p => window.electron.deleteClip(p)))
    setConfirmDeleteSelection(false)
    setSelectedPaths(new Set())
    setClips(prev => prev.filter(c => !deleted.has(c.path)))
  }

  const visibleClips = clips.slice(0, visibleCount)
  const hasMore = clips.length > visibleCount
  const parentLabel = currentPath.length === 1 ? 'Racine' : currentPath[currentPath.length - 2]

  if (loading) return (
    <div className="clips-loading">
      <div className="clips-spinner" />
      <span className="clips-loading-text">Chargement des clips...</span>
    </div>
  )
  if (clips.length === 0 && folders.length === 0 && currentPath.length === 0) return null

  return (
    <div
      className="clips-section"
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDragOver={(e) => { if (draggingClip.current) e.preventDefault() }}
    >
      <div className="clips-header">
        <div className="clips-breadcrumb">
          <button
            className={`clips-breadcrumb-item${currentPath.length === 0 ? ' active' : ' breadcrumb-droppable'}${dragOverTarget === '__root__' ? ' breadcrumb-drag-over' : ''}`}
            onClick={() => setCurrentPath([])}
            onDragOver={currentPath.length > 0 ? (e) => dragOver(e, '__root__') : undefined}
            onDrop={currentPath.length > 0 ? () => performMove([]) : undefined}
            onDragLeave={dragLeave}
          >
            Recent clips
          </button>
          {currentPath.map((seg, i) => (
            <Fragment key={i}>
              <span className="clips-breadcrumb-sep">›</span>
              <button
                className={`clips-breadcrumb-item${i === currentPath.length - 1 ? ' active' : ' breadcrumb-droppable'}${dragOverTarget === `__bc_${i}` ? ' breadcrumb-drag-over' : ''}`}
                onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                onDragOver={i < currentPath.length - 1 ? (e) => dragOver(e, `__bc_${i}`) : undefined}
                onDrop={i < currentPath.length - 1 ? () => performMove(currentPath.slice(0, i + 1)) : undefined}
                onDragLeave={dragLeave}
              >
                {seg}
              </button>
            </Fragment>
          ))}
        </div>
        <div className="clips-header-actions">
          {newFolderMode ? (
            <form className="new-folder-form" onSubmit={handleCreateFolder}>
              <input
                className="new-folder-input"
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Nom du dossier"
                onKeyDown={e => { if (e.key === 'Escape') { setNewFolderMode(false); setNewFolderName('') } }}
              />
              <button type="submit" className="btn-text">OK</button>
            </form>
          ) : (
            <button className="btn-text" onClick={() => setNewFolderMode(true)}><IconFolderPlus /> Dossier</button>
          )}
          <button className="btn-text" onClick={() => window.electron.openClipsFolder()}>
            <IconExternalLink /> Ouvrir
          </button>
        </div>
      </div>

      {currentPath.length > 0 && (
        <div
          className={`parent-drop-zone${dragOverTarget === '__parent__' ? ' parent-drop-zone-active' : ''}`}
          onDragOver={(e) => dragOver(e, '__parent__')}
          onDrop={(e) => { e.preventDefault(); performMove(currentPath.slice(0, -1)) }}
          onDragLeave={dragLeave}
        >
          <span className="parent-drop-label">↑ Déplacer vers : <strong>{parentLabel}</strong></span>
        </div>
      )}

      <div className="clips-grid">
        {folders.map(f => (
          <div
            key={`folder:${f.name}`}
            className={`folder-card${dragOverTarget === f.name ? ' folder-drag-over' : ''}`}
            onClick={() => {
              if (renamingFolder?.name === f.name) return
              setCurrentPath([...currentPath, f.name])
            }}
            onContextMenu={(e) => handleFolderRightClick(e, f)}
            onDragOver={(e) => dragOver(e, f.name)}
            onDrop={(e) => { e.preventDefault(); performMove([...currentPath, f.name]) }}
            onDragLeave={dragLeave}
          >
            <div className="folder-card-preview">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 7a2 2 0 012-2h4.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0013.828 8H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
              </svg>
            </div>
            <div className="clip-info">
              {renamingFolder?.name === f.name ? (
                <form
                  className="rename-folder-form"
                  onSubmit={handleRenameSubmit}
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    className="rename-folder-input"
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') setRenamingFolder(null) }}
                    onBlur={() => setRenamingFolder(null)}
                  />
                </form>
              ) : (
                <span className="folder-card-name">{f.name}</span>
              )}
              <span className="clip-meta">{f.clipCount} clip{f.clipCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}

        {visibleClips.map((clip) => (
          <ClipCard
            key={clip.path}
            clip={clip}
            isSelected={selectedPaths.has(clip.path)}
            processingPercent={audioProcessing?.path === clip.path ? audioProcessing.percent : null}
            copyState={clipCopying?.path === clip.path ? (clipCopying.done ? 'done' : 'copying') : null}
            onContextMenu={e => handleRightClick(e, clip)}
            onMouseUp={(e) => handleClipClick(e, clip)}
            onDragStart={e => handleClipDragStart(e, clip)}
            onDragEnd={handleClipDragEnd}
          />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-wrap">
          <button className="btn-load-more" onClick={() => setVisibleCount(v => v + maxClips)}>
            Voir plus ({clips.length - visibleCount} restants)
          </button>
        </div>
      )}

      {selectedPaths.size > 0 && (
        <div className="selection-bar">
          <span className="selection-count">
            {selectedPaths.size} clip{selectedPaths.size > 1 ? 's' : ''} sélectionné{selectedPaths.size > 1 ? 's' : ''}
          </span>
          <div className="selection-actions">
            <div className="selection-move-wrap">
              <button className="btn-open selection-btn" onClick={() => setSelectionMoveOpen(v => !v)}>
                Déplacer vers ▾
              </button>
              {selectionMoveOpen && (
                <div className="selection-move-dropdown" onMouseDown={e => e.stopPropagation()}>
                  {currentPath.length > 0 && (
                    <button className="context-menu-item" onClick={handleSelectionMoveToParent}>
                      <span className="context-menu-icon">↑</span> {parentLabel}
                    </button>
                  )}
                  {folders.map(f => (
                    <button key={f.name} className="context-menu-item" onClick={() => handleSelectionMoveToFolder(f.name)}>
                      <span className="context-menu-icon">📁</span> {f.name}
                    </button>
                  ))}
                  {currentPath.length === 0 && folders.length === 0 && (
                    <span className="context-menu-empty">Aucun dossier</span>
                  )}
                </div>
              )}
            </div>
            <button
              className="btn-danger selection-btn"
              onClick={() => deleteConfirmation ? setConfirmDeleteSelection(true) : doDeleteSelection()}
            >
              Supprimer
            </button>
            <button className="btn-text" onClick={() => setSelectedPaths(new Set())}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          folders={folders}
          onMoveToParent={currentPath.length > 0 ? { label: parentLabel, fn: handleContextMoveToParent } : null}
          onMoveToFolder={handleContextMoveToFolder}
          onReveal={() => { window.electron.revealClipFile(contextMenu.clip.path); setContextMenu(null) }}
          onCopy={handleCopyClip}
          onDelete={handleDeleteRequest}
          onMuteAudio={contextMenu.clip.hasAudio === true && audioProcessing?.path !== contextMenu.clip.path ? handleMuteAudio : null}
          onRestoreAudio={contextMenu.clip.hasAudio === 'muted' && audioProcessing?.path !== contextMenu.clip.path ? handleRestoreAudio : null}
          onClose={() => setContextMenu(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          clip={confirmDelete}
          onConfirm={doDeleteClip}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmDeleteSelection && (
        <ConfirmDeleteSelectionModal
          count={selectedPaths.size}
          onConfirm={doDeleteSelection}
          onCancel={() => setConfirmDeleteSelection(false)}
        />
      )}

      {folderContextMenu && (
        <FolderContextMenu
          x={folderContextMenu.x}
          y={folderContextMenu.y}
          onRename={openRenameFolder}
          onDelete={openDeleteFolderModal}
          onClose={() => setFolderContextMenu(null)}
        />
      )}

      {deletingFolder && (
        <DeleteFolderModal
          folder={deletingFolder}
          currentPath={currentPath}
          onAction={handleFolderDeleteAction}
          onCancel={() => setDeletingFolder(null)}
        />
      )}
    </div>
  )
}

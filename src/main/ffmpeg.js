const { execFile, spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

function getFfmpegPath() {
  try {
    const p = require('ffmpeg-static')
    return p.replace('app.asar', 'app.asar.unpacked')
  } catch {
    return 'ffmpeg'
  }
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = (seconds % 60).toFixed(3)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(6, '0')}`
}

function buildOutputPath(inputPath, startTime, endTime, outputDir) {
  const dir = outputDir || path.dirname(inputPath)
  const ext = path.extname(inputPath)
  const base = path.basename(inputPath, ext)
  const startStr = formatTime(startTime).replace(/:/g, '-').replace('.', 's')
  const endStr = formatTime(endTime).replace(/:/g, '-').replace('.', 's')
  return path.join(dir, `${base}_clip_${startStr}_${endStr}${ext}`)
}

function buildCopyPath(inputPath) {
  const dir = path.dirname(inputPath)
  const ext = path.extname(inputPath)
  const base = path.basename(inputPath, ext)
  let i = 2
  let out
  do { out = path.join(dir, `${base} (${i})${ext}`); i++ } while (fs.existsSync(out))
  return out
}

function getVideoInfo(inputPath) {
  return new Promise((resolve) => {
    const ffmpegPath = getFfmpegPath()
    let fileSize = null
    try { fileSize = fs.statSync(inputPath).size } catch {}
    execFile(ffmpegPath, ['-hide_banner', '-i', inputPath], (_error, _stdout, stderr) => {
      const match = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+),\s*start:\s*([\d.-]+)/)
      if (match) {
        const duration = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3])
        const startTime = parseFloat(match[4])
        resolve({ duration, startTime, fileSize })
      } else {
        resolve({ duration: null, startTime: 0, fileSize })
      }
    })
  })
}

function clipVideo(inputPath, startTime, endTime, outputDir, onProgress, muteAudio = false) {
  return new Promise((resolve, reject) => {
    const ffmpegPath = getFfmpegPath()

    if (outputDir && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = buildOutputPath(inputPath, startTime, endTime, outputDir)
    const clipDuration = endTime - startTime

    const args = [
      '-y',
      '-ss', String(startTime),
      '-to', String(endTime),
      '-i', inputPath,
      ...(muteAudio ? ['-c:v', 'copy', '-an'] : ['-c', 'copy']),
      '-progress', 'pipe:1',
      '-nostats',
      outputPath,
    ]

    const proc = spawn(ffmpegPath, args)
    let stderr = ''

    proc.stdout.on('data', (data) => {
      const kvs = {}
      for (const line of data.toString().split('\n')) {
        const eq = line.indexOf('=')
        if (eq > 0) kvs[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
      }
      if (kvs.out_time_ms && onProgress) {
        const elapsed = Math.max(0, parseInt(kvs.out_time_ms)) / 1e6
        const percent = clipDuration > 0 ? Math.min(100, Math.round((elapsed / clipDuration) * 100)) : 0
        onProgress({ percent, size: parseInt(kvs.total_size) || 0, speed: kvs.speed || '' })
      }
    })

    proc.stderr.on('data', (data) => { stderr += data.toString() })

    proc.on('close', (code) => {
      if (code === 0) resolve(outputPath)
      else reject(new Error(stderr || `FFmpeg exited with code ${code}`))
    })

    proc.on('error', reject)
  })
}

function getDuration(filePath) {
  return new Promise((resolve) => {
    execFile(getFfmpegPath(), ['-hide_banner', '-i', filePath], (_err, _stdout, stderr) => {
      const m = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/)
      resolve(m ? parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]) : 0)
    })
  })
}

function spawnWithProgress(args, tmpPath, inputPath, duration, onProgress) {
  return new Promise((resolve, reject) => {
    const proc = spawn(getFfmpegPath(), args)
    let stderr = ''

    proc.stdout.on('data', (data) => {
      const kvs = {}
      for (const line of data.toString().split('\n')) {
        const eq = line.indexOf('=')
        if (eq > 0) kvs[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
      }
      if (kvs.out_time_ms && onProgress && duration > 0) {
        const elapsed = Math.max(0, parseInt(kvs.out_time_ms)) / 1e6
        onProgress(Math.min(100, Math.round((elapsed / duration) * 100)))
      }
    })

    proc.stderr.on('data', (data) => { stderr += data.toString() })

    proc.on('close', (code) => {
      if (code === 0) {
        try { fs.unlinkSync(inputPath); fs.renameSync(tmpPath, inputPath); resolve(inputPath) }
        catch (e) { reject(e) }
      } else {
        try { fs.unlinkSync(tmpPath) } catch {}
        reject(new Error(stderr || `FFmpeg exited with code ${code}`))
      }
    })
    proc.on('error', reject)
  })
}

async function muteAudioInPlace(inputPath, onProgress) {
  const duration = await getDuration(inputPath)
  const tmpPath = path.join(path.dirname(inputPath), '__tmp__' + path.basename(inputPath))
  const args = [
    '-y',
    '-i', inputPath,
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-map', '0:v', '-map', '1:a', '-map', '0:a',
    '-c:v', 'copy', '-c:a:0', 'aac', '-b:a:0', '64k', '-c:a:1', 'copy',
    '-shortest',
    '-disposition:a:0', 'default', '-disposition:a:1', '0',
    '-progress', 'pipe:1', '-nostats',
    tmpPath,
  ]
  return spawnWithProgress(args, tmpPath, inputPath, duration, onProgress)
}

async function restoreAudioOnFile(inputPath, onProgress) {
  const duration = await getDuration(inputPath)
  const tmpPath = path.join(path.dirname(inputPath), '__tmp__' + path.basename(inputPath))
  const args = [
    '-y',
    '-i', inputPath,
    '-map', '0:v', '-map', '0:a:1',
    '-c', 'copy',
    '-disposition:a:0', 'default',
    '-progress', 'pipe:1', '-nostats',
    tmpPath,
  ]
  return spawnWithProgress(args, tmpPath, inputPath, duration, onProgress)
}

function checkHasAudio(filePath) {
  return new Promise((resolve) => {
    const ffmpegPath = getFfmpegPath()
    execFile(ffmpegPath, ['-hide_banner', '-i', filePath], (_err, _stdout, stderr) => {
      const audioLines = stderr.split('\n').filter(l => /Stream #\d+:\d+[^:]*: Audio:/.test(l))
      if (audioLines.length === 0) return resolve(false)
      if (audioLines.length >= 2) return resolve('muted')
      resolve(true)
    })
  })
}

module.exports = { clipVideo, getVideoInfo, muteAudioInPlace, restoreAudioOnFile, checkHasAudio }

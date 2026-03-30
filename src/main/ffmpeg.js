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

function getVideoInfo(inputPath) {
  return new Promise((resolve) => {
    const ffmpegPath = getFfmpegPath()
    execFile(ffmpegPath, ['-hide_banner', '-i', inputPath], (_error, _stdout, stderr) => {
      const match = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+),\s*start:\s*([\d.-]+)/)
      if (match) {
        const duration = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3])
        const startTime = parseFloat(match[4])
        resolve({ duration, startTime })
      } else {
        resolve({ duration: null, startTime: 0 })
      }
    })
  })
}

function clipVideo(inputPath, startTime, endTime, outputDir, onProgress) {
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
      '-c', 'copy',
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

module.exports = { clipVideo, getVideoInfo }

const { app } = require('electron')
const fs = require('fs')
const path = require('path')

const settingsPath = path.join(app.getPath('userData'), 'settings.json')

function getDefaults() {
  return {
    outputDir: path.join(app.getPath('videos'), 'my-clipper'),
    maxClips: 20,
  }
}

function getSettings() {
  try {
    return { ...getDefaults(), ...JSON.parse(fs.readFileSync(settingsPath, 'utf8')) }
  } catch {
    return getDefaults()
  }
}

function setSettings(updates) {
  const updated = { ...getSettings(), ...updates }
  fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2))
  return updated
}

module.exports = { getSettings, setSettings }

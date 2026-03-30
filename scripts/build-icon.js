const { Resvg } = require('@resvg/resvg-js')
const pngToIco = require('png-to-ico').default
const fs = require('fs')
const path = require('path')
const os = require('os')

const svgPath = path.join(__dirname, '../build/icon.svg')
const icoPath = path.join(__dirname, '../build/icon.ico')

const svg = fs.readFileSync(svgPath, 'utf-8')

const sizes = [16, 32, 48, 256]
const tmpFiles = sizes.map(size => {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
  const png = Buffer.from(resvg.render().asPng())
  const tmpPath = path.join(os.tmpdir(), `icon-${size}.png`)
  fs.writeFileSync(tmpPath, png)
  return tmpPath
})

pngToIco(tmpFiles).then(ico => {
  fs.writeFileSync(icoPath, ico)
  tmpFiles.forEach(f => fs.unlinkSync(f))
  console.log('Icon generated:', icoPath)
})

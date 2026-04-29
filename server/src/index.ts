import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { parseGender } from './messages.js'
import { buildSupportSvg } from './svg.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.resolve(__dirname, '../../client/dist')
const clientDistReady = fs.existsSync(path.join(clientDist, 'index.html'))

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json({ limit: '32kb' }))

app.post('/api/support-image', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name : ''
  const gender = parseGender(req.body?.gender)
  const seed =
    typeof req.body?.seed === 'number' && Number.isFinite(req.body.seed)
      ? Math.floor(req.body.seed)
      : Math.floor(Math.random() * 1e9)

  if (name.length > 80) {
    res.status(400).json({ error: 'Имя слишком длинное' })
    return
  }

  try {
    const svg = buildSupportSvg(name, seed, gender)
    const png = await sharp(Buffer.from(svg, 'utf-8')).png().toBuffer()

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'no-store')
    res.send(png)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Не удалось создать изображение' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

if (clientDistReady) {
  app.use(express.static(clientDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next()
      return
    }
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next()
    })
  })
}

app.listen(PORT, () => {
  console.log(`Support server http://localhost:${PORT}`)
  if (!clientDistReady) {
    console.log('(Сборка client/dist не найдена — только API; для UI запустите Vite в client/)')
  }
})

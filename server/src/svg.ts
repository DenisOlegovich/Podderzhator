import { type Gender, pickMessage } from './messages.js'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const PALETTES = [
  { a: '#667eea', b: '#764ba2' },
  { a: '#f093fb', b: '#f5576c' },
  { a: '#4facfe', b: '#00f2fe' },
  { a: '#43e97b', b: '#38f9d7' },
  { a: '#fa709a', b: '#fee140' },
  { a: '#a8edea', b: '#fed6e3' },
] as const

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  const chunkLong = (word: string): string[] => {
    const out: string[] = []
    for (let i = 0; i < word.length; i += maxCharsPerLine) {
      out.push(word.slice(i, i + maxCharsPerLine))
    }
    return out
  }

  for (const w of words) {
    const parts = w.length > maxCharsPerLine ? chunkLong(w) : [w]
    for (const part of parts) {
      const candidate = current ? `${current} ${part}` : part
      if (candidate.length <= maxCharsPerLine) {
        current = candidate
      } else {
        if (current) lines.push(current)
        current = part
      }
    }
  }
  if (current) lines.push(current)
  return lines
}

export function buildSupportSvg(
  name: string,
  seed: number,
  gender: Gender,
): string {
  const trimmed = name.trim() || 'друг'
  const palette = PALETTES[Math.abs(seed) % PALETTES.length]!
  const message = pickMessage(seed + trimmed.length * 31, gender)
  const safeName = escapeXml(trimmed)
  const lines = wrapText(message, 28)
  const lineHeight = 34
  const startY = 300 + (4 - lines.length) * (lineHeight / 2)

  const tspans = lines
    .map((line, i) => {
      const y = startY + i * lineHeight
      return `<tspan x="400" y="${y}">${escapeXml(line)}</tspan>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${palette.a};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${palette.b};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect x="40" y="40" width="720" height="420" rx="24" fill="rgba(255,255,255,0.92)" filter="url(#shadow)"/>
  <text x="400" y="120" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        font-size="22" fill="#64748b" font-weight="500">Для тебя, ${safeName}</text>
  <text x="400" y="200" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        font-size="36" font-weight="700" fill="#1e293b">Тебе важно знать</text>
  <text text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        font-size="22" fill="#334155" font-weight="400">
    ${tspans}
  </text>
  <text x="400" y="440" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="14" fill="#94a3b8">Поддержатор · с теплом</text>
</svg>`
}

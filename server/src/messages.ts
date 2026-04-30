import { phraseAt, SUPPORT_PHRASE_COUNT } from './support-phrases.js'

export type Gender = 'male' | 'female'

/** 777 фраз с учётом пола (мужская / женская грамматика). Смещение даёт другую «линию» при смене пола при том же seed. */
export function pickMessage(seed: number, gender: Gender): string {
  const skew = gender === 'female' ? 193 : 0
  const i = Math.abs(seed + skew) % SUPPORT_PHRASE_COUNT
  return phraseAt(i, gender)
}

export function parseGender(value: unknown): Gender {
  if (value === 'female') return 'female'
  return 'male'
}

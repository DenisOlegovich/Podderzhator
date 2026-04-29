import { SUPPORT_PHRASES } from './support-phrases.js'

export type Gender = 'male' | 'female'

/** 120 фраз; пол смещает индекс, чтобы при одном seed текст отличался. */
export function pickMessage(seed: number, gender: Gender): string {
  const offset = gender === 'female' ? 59 : 0
  const i = Math.abs(seed + offset) % SUPPORT_PHRASES.length
  return SUPPORT_PHRASES[i]!
}

export function parseGender(value: unknown): Gender {
  if (value === 'female') return 'female'
  return 'male'
}

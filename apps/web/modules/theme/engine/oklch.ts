export type OklchColor = {
  l: number
  c: number
  h: number
}

const OKLCH_RE = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?\s*\)$/i

export function parseOklch(input: string): OklchColor | null {
  const match = input.trim().match(OKLCH_RE)
  if (!match) return null

  const [, lRaw, cRaw, hRaw] = match
  if (!lRaw || !cRaw || !hRaw) return null

  const l = lRaw.endsWith("%") ? Number(lRaw.slice(0, -1)) / 100 : Number(lRaw)
  const c = Number(cRaw)
  const h = Number(hRaw)

  if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h))
    return null
  if (l < 0 || l > 1 || c < 0 || c > 0.4 || h < 0 || h > 360) return null

  return { l, c, h }
}

export function isValidOklch(input: string): boolean {
  return parseOklch(input) !== null
}

export function normalizeOklch(input: string): string {
  const color = parseOklch(input)
  if (!color) return input.trim()
  return formatOklch(color)
}

export function formatOklch(color: OklchColor): string {
  return `oklch(${round(color.l, 4)} ${round(color.c, 4)} ${roundHue(color.h)})`
}

export function clampOklch(color: OklchColor): OklchColor {
  return {
    l: clamp(color.l, 0, 1),
    c: clamp(color.c, 0, 0.4),
    h: ((color.h % 360) + 360) % 360,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function roundHue(value: number) {
  return Math.round(value * 100) / 100
}

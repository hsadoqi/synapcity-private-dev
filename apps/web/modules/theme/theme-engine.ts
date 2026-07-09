import { THEME_PALETTE_STEPS, type ThemePaletteStep } from "./types"

export interface OklchColor {
  /** CSS OKLCH lightness in 0..1 form. */
  l: number
  c: number
  h: number
}

export interface RgbColor {
  r: number
  g: number
  b: number
}

const DEFAULT_OKLCH: OklchColor = { l: 0.62, c: 0.16, h: 255 }

/**
 * Tailwind-ish lightness curve: very pale 50, useful 500/600 center,
 * compressed dark tail for 900/950. This is intentionally deterministic;
 * the seed hue/chroma define identity, not app light/dark mode.
 */
const LIGHTNESS_BY_STEP: Record<ThemePaletteStep, number> = {
  50: 0.985,
  100: 0.965,
  200: 0.925,
  300: 0.855,
  400: 0.74,
  500: 0.63,
  600: 0.55,
  700: 0.47,
  800: 0.39,
  900: 0.31,
  950: 0.22,
}

/** Low chroma at the ends, strongest color identity around 500/600. */
const CHROMA_MULTIPLIER_BY_STEP: Record<ThemePaletteStep, number> = {
  50: 0.1,
  100: 0.18,
  200: 0.32,
  300: 0.5,
  400: 0.75,
  500: 1,
  600: 1.03,
  700: 0.9,
  800: 0.75,
  900: 0.58,
  950: 0.42,
}

/** Subtle hue travel makes the generated shades feel less mechanically flat. */
const HUE_DRIFT_BY_STEP: Record<ThemePaletteStep, number> = {
  50: 7,
  100: 5,
  200: 3,
  300: 1.5,
  400: 0.5,
  500: 0,
  600: -1,
  700: -2,
  800: -3,
  900: -4,
  950: -5,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHue(hue: number) {
  return ((hue % 360) + 360) % 360
}

function round(value: number, digits = 3) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function roundByte(value: number) {
  return Math.round(clamp(value, 0, 1) * 255)
}

function linearToSrgb(value: number) {
  return value >= 0.0031308 ? 1.055 * value ** (1 / 2.4) - 0.055 : 12.92 * value
}

function srgbToLinear(value: number) {
  return value >= 0.04045 ? ((value + 0.055) / 1.055) ** 2.4 : value / 12.92
}

function numberToHex(value: number) {
  return roundByte(value).toString(16).padStart(2, "0")
}

/**
 * Accepts `oklch(0.62 0.16 255)` and `oklch(62% 0.16 255)`.
 * Alpha is ignored because theme seeds should describe opaque palette colors.
 */
export function parseOklch(value: string): OklchColor | null {
  const match = value
    .trim()
    .match(
      /^oklch\(\s*([+-]?(?:\d+\.?\d*|\.\d+)%?)\s+([+-]?(?:\d+\.?\d*|\.\d+))\s+([+-]?(?:\d+\.?\d*|\.\d+))(?:\s*\/\s*[^)]+)?\s*\)$/i
    )

  if (!match) {
    return null
  }

  const rawLightness = match[1] ?? "0.62"
  const l = rawLightness.endsWith("%")
    ? Number(rawLightness.slice(0, -1)) / 100
    : Number(rawLightness)
  const c = Number(match[2] ?? 0.16)
  const h = Number(match[3] ?? 255)

  if (![l, c, h].every(Number.isFinite)) {
    return null
  }

  return {
    l: clamp(l, 0, 1),
    c: clamp(c, 0, 0.4),
    h: normalizeHue(h),
  }
}

export function isValidOklch(value: string) {
  return parseOklch(value) !== null
}

export function normalizeOklch(value: string) {
  const color = parseOklch(value) ?? DEFAULT_OKLCH
  return oklchToCss(color)
}

export function oklchToCss({ l, c, h }: OklchColor) {
  return `oklch(${round(l, 3)} ${round(c, 3)} ${round(normalizeHue(h), 2)})`
}

export function hexToRgb(value: string): RgbColor | null {
  const match = value.trim().match(/^#?([a-f\d]{6})$/i)

  if (!match) {
    return null
  }

  const hex = match[1] ?? "000000"
  return {
    r: Number.parseInt(hex.slice(0, 2), 16) / 255,
    g: Number.parseInt(hex.slice(2, 4), 16) / 255,
    b: Number.parseInt(hex.slice(4, 6), 16) / 255,
  }
}

export function rgbToHex({ r, g, b }: RgbColor) {
  return `#${numberToHex(r)}${numberToHex(g)}${numberToHex(b)}`
}

export function rgbToOklch({ r, g, b }: RgbColor): OklchColor {
  const linearR = srgbToLinear(r)
  const linearG = srgbToLinear(g)
  const linearB = srgbToLinear(b)

  const l = Math.cbrt(
    0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB
  )
  const m = Math.cbrt(
    0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB
  )
  const s = Math.cbrt(
    0.0883024619 * linearR + 0.2817188376 * linearG + 0.6299787005 * linearB
  )

  const oklabL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const labB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.sqrt(a ** 2 + labB ** 2)
  const h = normalizeHue((Math.atan2(labB, a) * 180) / Math.PI)

  return { l: clamp(oklabL, 0, 1), c: clamp(c, 0, 0.4), h }
}

export function oklchToRgb({ l, c, h }: OklchColor): RgbColor {
  const hueRadians = (normalizeHue(h) * Math.PI) / 180
  const a = c * Math.cos(hueRadians)
  const labB = c * Math.sin(hueRadians)

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * labB
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * labB
  const sPrime = l - 0.0894841775 * a - 1.291485548 * labB

  const lCube = lPrime ** 3
  const mCube = mPrime ** 3
  const sCube = sPrime ** 3

  return {
    r: clamp(
      linearToSrgb(
        4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube
      ),
      0,
      1
    ),
    g: clamp(
      linearToSrgb(
        -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube
      ),
      0,
      1
    ),
    b: clamp(
      linearToSrgb(
        -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube
      ),
      0,
      1
    ),
  }
}

export function hexToOklch(value: string) {
  const rgb = hexToRgb(value)
  return rgb ? oklchToCss(rgbToOklch(rgb)) : null
}

export function oklchToHex(value: string) {
  const color = parseOklch(value)
  return color ? rgbToHex(oklchToRgb(color)) : "#000000"
}

function hueChromaBias(hue: number) {
  const h = normalizeHue(hue)

  // Reds/yellows read louder, blues/purples can tolerate a little more chroma.
  if (h >= 20 && h <= 110) return 0.86
  if (h >= 190 && h <= 285) return 1.06
  return 1
}

function maxChromaForLightness(lightness: number) {
  // Prevent washed-out 50s and muddy/neon 950s. Approximation, not a gamut solver.
  return clamp(0.34 * Math.sin(Math.PI * lightness) ** 0.72, 0.012, 0.34)
}

function deriveScaleColor(
  seed: OklchColor,
  step: ThemePaletteStep
): OklchColor {
  const seedInfluence = clamp((seed.l - 0.63) * 0.08, -0.025, 0.025)
  const l = clamp(LIGHTNESS_BY_STEP[step] + seedInfluence, 0.02, 0.995)
  const drift = HUE_DRIFT_BY_STEP[step]
  const h = normalizeHue(seed.h + drift)
  const c = clamp(
    seed.c * hueChromaBias(seed.h) * CHROMA_MULTIPLIER_BY_STEP[step],
    0.006,
    maxChromaForLightness(l)
  )

  return { l, c, h }
}

export function generatePalette(seed: string, prefix: "primary" | "accent") {
  const parsedSeed = parseOklch(seed) ?? DEFAULT_OKLCH

  return THEME_PALETTE_STEPS.reduce<Record<string, string>>((vars, step) => {
    vars[`--${prefix}-${step}`] = oklchToCss(deriveScaleColor(parsedSeed, step))
    return vars
  }, {})
}

export function buildThemeVariables(primaryOklch: string, accentOklch: string) {
  return {
    ...generatePalette(primaryOklch, "primary"),
    ...generatePalette(accentOklch, "accent"),
  }
}

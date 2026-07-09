import { PALETTE_STEPS } from "../constants"
import type { PaletteScale, PaletteStep } from "../types"
import { clampOklch, formatOklch, parseOklch, type OklchColor } from "./oklch"

const LIGHTNESS_BY_STEP: Record<PaletteStep, number> = {
  50: 0.985,
  100: 0.965,
  200: 0.92,
  300: 0.85,
  400: 0.74,
  500: 0.64,
  600: 0.55,
  700: 0.47,
  800: 0.38,
  900: 0.29,
  950: 0.2,
}

const CHROMA_CURVE_BY_STEP: Record<PaletteStep, number> = {
  50: 0.18,
  100: 0.28,
  200: 0.45,
  300: 0.68,
  400: 0.9,
  500: 1,
  600: 1.02,
  700: 0.96,
  800: 0.82,
  900: 0.62,
  950: 0.45,
}

export function generatePalette(seed: string): PaletteScale {
  const parsed = parseOklch(seed)
  const base = parsed ?? { l: 0.62, c: 0.11, h: 70 }

  return PALETTE_STEPS.reduce((scale, step) => {
    scale[step] = formatOklch(buildStep(base, step))
    return scale
  }, {} as PaletteScale)
}

function buildStep(seed: OklchColor, step: PaletteStep): OklchColor {
  const lightness = LIGHTNESS_BY_STEP[step]
  const chroma = Math.min(
    seed.c * CHROMA_CURVE_BY_STEP[step],
    maxChromaForLightness(lightness)
  )

  return clampOklch({
    l: lightness,
    c: chroma,
    h: seed.h,
  })
}

function maxChromaForLightness(lightness: number) {
  if (lightness > 0.94) return 0.055
  if (lightness > 0.88) return 0.085
  if (lightness < 0.24) return 0.11
  if (lightness < 0.34) return 0.14
  return 0.22
}

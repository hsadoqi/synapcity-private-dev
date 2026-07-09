const PALETTE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

function parseOklch(value: string): { l: number; c: number; h: number } {
  const match = value.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)/i)

  if (!match) {
    return { l: 0.62, c: 0.16, h: 255 }
  }

  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: Number(match[3]),
  }
}

export function generatePalette(seed: string, prefix: "primary" | "accent") {
  const { l, c, h } = parseOklch(seed)
  const scales = [0.96, 0.92, 0.86, 0.78, 0.7, 0.62, 0.54, 0.46, 0.36, 0.26, 0.18]

  return PALETTE_STOPS.reduce<Record<string, string>>((accumulator, stop, index) => {
    const lightness = Math.max(0.1, Math.min(0.98, scales[index] ?? l))
    accumulator[`--${prefix}-${stop}`] = `oklch(${lightness.toFixed(3)} ${Math.max(0.01, c).toFixed(3)} ${h})`
    return accumulator
  }, {})
}

export function buildThemeVariables(primaryOklch: string, accentOklch: string) {
  return {
    ...generatePalette(primaryOklch, "primary"),
    ...generatePalette(accentOklch, "accent"),
  }
}

import type { ThemeRecord } from "./types"
import { DEFAULT_THEME_FONTS } from "./font-registry"

export const THEME_STORAGE_KEYS = {
  themes: "synapcity.themes.v1",
  assignments: "synapcity.themeAssignments.v1",
} as const

export const PALETTE_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const

export const DEFAULT_THEME_RECORD: ThemeRecord = {
  id: "theme-warm-ledger",
  name: "Warm Ledger",
  description: "Neutral-first Synapcity default with warm technical accents.",
  version: 1,
  seeds: {
    primary: "oklch(0.58 0.12 72)",
    accent: "oklch(0.62 0.14 48)",
  },
  mode: "system",
  radius: {
    base: 0.75,
  },
  typography: {
    scale: 1,
  },
  fonts: DEFAULT_THEME_FONTS,
  createdAt: "2026-07-09T00:00:00.000Z",
  updatedAt: "2026-07-09T00:00:00.000Z",
}

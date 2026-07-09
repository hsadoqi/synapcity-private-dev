export const THEME_PALETTE_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const

export type ThemePaletteStep = (typeof THEME_PALETTE_STEPS)[number]

export type ThemeScopeType =
  | "root"
  | "dashboard"
  | "document"
  | "panel"
  | "widget"

export interface ThemeRecord {
  id: string
  name: string
  /** Identity seed only. Runtime derives --primary-50...950 from this. */
  primaryOklch: string
  /** Identity seed only. Runtime derives --accent-50...950 from this. */
  accentOklch: string
  mode?: "light" | "dark" | "system"
  version: number
  createdAt: string
  updatedAt: string
}

export interface ThemeAssignment {
  id: string
  scopeType: ThemeScopeType
  /** Entity/scope id, not the saved theme id. Example: app, dashboard-1, document-1. */
  scopeId: string
  /** Persisted ThemeRecord.id. */
  themeId: string
  createdAt: string
  updatedAt: string
}

export const DEFAULT_THEME_RECORD: ThemeRecord = {
  id: "theme-default",
  name: "Synapcity Indigo",
  primaryOklch: "oklch(0.62 0.16 255)",
  accentOklch: "oklch(0.68 0.14 330)",
  mode: "system",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

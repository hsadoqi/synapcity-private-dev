export interface ThemeRecord {
  id: string
  name: string
  primaryOklch: string
  accentOklch: string
  mode?: "light" | "dark" | "system"
  version: number
  createdAt: string
  updatedAt: string
}

export interface ThemeAssignment {
  id: string
  scopeType: "root" | "dashboard" | "document" | "panel" | "widget"
  scopeId: string
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

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


export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface OKLCHColor {
  l: number
  c: number
  h: number
}

export type ShadeName = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export interface ColorShade {
  name: ShadeName
  hex: string
  oklch: OKLCHColor
}

export type FontField = "headingFont" | "bodyFont"
export interface FontOption {
  label: string
  value: string
  fontFamily: string
}

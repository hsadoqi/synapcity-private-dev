export type ThemeScope = "global" | "document" | "dashboard" | "widget"

export type ThemeMode = "light" | "dark" | "system"

export type ThemeFontId = "inter" | "space-grotesk" | "system"

export type ThemeFonts = {
  body?: ThemeFontId
  heading?: ThemeFontId
}

export type ThemeRecord = {
  id: string
  name: string
  description?: string
  version: 1
  seeds: {
    primary: string
    accent?: string
  }
  radius?: {
    base?: number
  }
  typography?: {
    scale?: number
  }
  fonts?: ThemeFonts
  createdAt: string
  updatedAt: string
}

export type ThemeDraft = Omit<ThemeRecord, "createdAt" | "updatedAt">

export type ResolvedThemeSeeds = {
  primary: string
  accent: string
  accentSource: "authored" | "neutral-default"
}

export type ThemeAssignment = {
  scope: ThemeScope
  scopeId: string
  themeId: string
  updatedAt: string
}

export type ThemeResolution =
  | { status: "unassigned"; theme: null }
  | { status: "assigned"; theme: ThemeRecord }
  | { status: "missing-theme"; theme: null; themeId: string }

export type ThemeCssVars = Record<`--${string}`, string>

export type PaletteStep =
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

export type PaletteScale = Record<PaletteStep, string>

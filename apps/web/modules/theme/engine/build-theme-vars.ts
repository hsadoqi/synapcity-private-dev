import type * as React from "react"

import { DEFAULT_THEME_RECORD } from "../constants"
import { DEFAULT_THEME_FONTS, resolveThemeFontValue } from "../font-registry"
import type { ThemeCssVars, ThemeDraft, ThemeRecord } from "../types"
import { generatePalette } from "./generate-palette"
import { resolveThemeSeeds } from "./resolve-theme-seeds"

function toRem(value: number | undefined, fallback: number) {
  const next = value ?? fallback
  return `${next}rem`
}

export function buildThemeVars(theme: ThemeRecord | ThemeDraft): ThemeCssVars {
  const seeds = resolveThemeSeeds(theme.seeds)
  const primary = generatePalette(seeds.primary)
  const accent = generatePalette(seeds.accent)
  const radiusBase = DEFAULT_THEME_RECORD.radius?.base ?? 0.75
  const typeScale =
    theme.typography?.scale ?? DEFAULT_THEME_RECORD.typography?.scale ?? 1

  return {
    "--primary-50": primary[50],
    "--primary-100": primary[100],
    "--primary-200": primary[200],
    "--primary-300": primary[300],
    "--primary-400": primary[400],
    "--primary-500": primary[500],
    "--primary-600": primary[600],
    "--primary-700": primary[700],
    "--primary-800": primary[800],
    "--primary-900": primary[900],
    "--primary-950": primary[950],

    "--accent-50": accent[50],
    "--accent-100": accent[100],
    "--accent-200": accent[200],
    "--accent-300": accent[300],
    "--accent-400": accent[400],
    "--accent-500": accent[500],
    "--accent-600": accent[600],
    "--accent-700": accent[700],
    "--accent-800": accent[800],
    "--accent-900": accent[900],
    "--accent-950": accent[950],
    "--radius": toRem(theme.radius?.base, radiusBase),
    "--type-scale": String(typeScale),
    "--font-sans": resolveThemeFontValue(
      theme.fonts?.body,
      DEFAULT_THEME_FONTS.body
    ),
    "--font-heading": resolveThemeFontValue(
      theme.fonts?.heading,
      DEFAULT_THEME_FONTS.heading
    ),
  }
}

export function varsToReactStyle(vars: ThemeCssVars): React.CSSProperties {
  return vars as React.CSSProperties
}

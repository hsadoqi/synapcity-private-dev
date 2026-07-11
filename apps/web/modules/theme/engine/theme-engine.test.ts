import { describe, expect, it } from "vitest"

import { DEFAULT_NEUTRAL_ACCENT } from "../constants"
import type { ThemeRecord } from "../types"
import { buildThemeVars } from "./build-theme-vars"
import { generatePalette } from "./generate-palette"
import { resolveThemeSeeds } from "./resolve-theme-seeds"

const BASE_THEME: ThemeRecord = {
  id: "theme-test",
  name: "Test",
  version: 1,
  seeds: { primary: "oklch(0.58 0.12 72)" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("theme engine", () => {
  it("generates deterministic palettes", () => {
    expect(generatePalette(BASE_THEME.seeds.primary)).toEqual(
      generatePalette(BASE_THEME.seeds.primary)
    )
  })

  it("resolves missing authored accent without mutating authored seeds", () => {
    const authored = { ...BASE_THEME.seeds }
    const resolved = resolveThemeSeeds(authored)

    expect(resolved).toEqual({
      primary: authored.primary,
      accent: DEFAULT_NEUTRAL_ACCENT,
      accentSource: "neutral-default",
    })
    expect(authored).not.toHaveProperty("accent")
  })

  it("preserves authored intent when accent equals the neutral default", () => {
    expect(
      resolveThemeSeeds({
        primary: BASE_THEME.seeds.primary,
        accent: DEFAULT_NEUTRAL_ACCENT,
      })
    ).toMatchObject({
      accent: DEFAULT_NEUTRAL_ACCENT,
      accentSource: "authored",
    })
  })

  it("compiles complete neutral accent variables for a primary-only theme", () => {
    const variables = buildThemeVars(BASE_THEME)
    const neutralAccent = generatePalette(DEFAULT_NEUTRAL_ACCENT)

    expect(variables["--accent-50"]).toBe(neutralAccent[50])
    expect(variables["--accent-950"]).toBe(neutralAccent[950])
    expect(BASE_THEME.seeds).not.toHaveProperty("accent")
  })

  it("uses an authored accent instead of the neutral fallback", () => {
    const accent = "oklch(0.64 0.16 245)"
    const variables = buildThemeVars({
      ...BASE_THEME,
      seeds: { ...BASE_THEME.seeds, accent },
    })

    expect(variables["--accent-500"]).toBe(generatePalette(accent)[500])
  })
})

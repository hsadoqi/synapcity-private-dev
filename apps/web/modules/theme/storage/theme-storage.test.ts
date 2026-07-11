import { beforeEach, describe, expect, it } from "vitest"

import { THEME_STORAGE_KEYS } from "../constants"
import type { ThemeRecord } from "../types"
import { loadThemes, saveTheme } from "./theme-storage"

const LEGACY_BASE = {
  id: "theme-legacy",
  name: "Legacy",
  version: 1,
  mode: "dark",
  seeds: { primary: "oklch(0.58 0.12 72)" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("theme storage migration", () => {
  beforeEach(() => window.localStorage.clear())

  it("loads a primary-only legacy theme without materializing accent or mode", () => {
    window.localStorage.setItem(
      THEME_STORAGE_KEYS.themes,
      JSON.stringify([LEGACY_BASE])
    )

    const loaded = loadThemes().find((theme) => theme.id === LEGACY_BASE.id)

    expect(loaded?.seeds).toEqual({ primary: LEGACY_BASE.seeds.primary })
    expect(loaded).not.toHaveProperty("mode")
  })

  it("preserves an existing authored accent during migration", () => {
    const accent = "oklch(0.64 0.16 245)"
    window.localStorage.setItem(
      THEME_STORAGE_KEYS.themes,
      JSON.stringify([
        { ...LEGACY_BASE, seeds: { ...LEGACY_BASE.seeds, accent } },
      ])
    )

    expect(
      loadThemes().find((theme) => theme.id === LEGACY_BASE.id)?.seeds.accent
    ).toBe(accent)
  })

  it("round-trips a primary-only authored theme without gaining accent", () => {
    const theme = LEGACY_BASE as unknown as ThemeRecord

    saveTheme(theme)

    const persisted = JSON.parse(
      window.localStorage.getItem(THEME_STORAGE_KEYS.themes) ?? "[]"
    ) as ThemeRecord[]
    expect(persisted.find((item) => item.id === theme.id)?.seeds).toEqual({
      primary: theme.seeds.primary,
    })
  })
})

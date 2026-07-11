import { describe, expect, it } from "vitest"

import type { ThemeAssignment, ThemeRecord } from "../../types"
import {
  buildThemeDuplicate,
  getThemeLibraryRows,
  getThemePaletteSignature,
} from "./theme-library-model"

const THEMES: ThemeRecord[] = [
  {
    id: "theme-graphite",
    name: "Graphite",
    description: "Quiet neutral system",
    version: 1,
    seeds: {
      primary: "oklch(0.58 0.08 260)",
      accent: "oklch(0.72 0.12 84)",
    },
    radius: { base: 0.5 },
    typography: { scale: 1.02 },
    fonts: { body: "inter", heading: "space-grotesk" },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "theme-paper",
    name: "Paper Mono",
    description: "Writing surface",
    version: 1,
    seeds: {
      primary: "oklch(0.64 0.07 96)",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
]

const ASSIGNMENTS: ThemeAssignment[] = [
  {
    scope: "global",
    scopeId: "root",
    themeId: "theme-graphite",
    updatedAt: "2026-01-04T00:00:00.000Z",
  },
  {
    scope: "document",
    scopeId: "doc-one",
    themeId: "theme-graphite",
    updatedAt: "2026-01-04T00:00:00.000Z",
  },
]

const GRAPHITE = THEMES[0]!
const PAPER = THEMES[1]!

describe("theme library model", () => {
  it("filters by usage and searches name and description", () => {
    expect(
      getThemeLibraryRows({
        themes: THEMES,
        assignments: ASSIGNMENTS,
        filter: "in-use",
        query: "",
        sort: "updated",
      }).map((row) => row.theme.id)
    ).toEqual(["theme-graphite"])

    expect(
      getThemeLibraryRows({
        themes: THEMES,
        assignments: ASSIGNMENTS,
        filter: "unused",
        query: "writing",
        sort: "updated",
      }).map((row) => row.theme.id)
    ).toEqual(["theme-paper"])
  })

  it("uses product language for root and scoped usage", () => {
    const rows = getThemeLibraryRows({
      themes: THEMES,
      assignments: ASSIGNMENTS,
      filter: "all",
      query: "",
      sort: "name",
    })

    expect(rows.map((row) => row.usage.label)).toEqual([
      "Root + 1 scope",
      "Not in use",
    ])
  })

  it("preserves authored accent intent in the palette signature", () => {
    expect(getThemePaletteSignature(GRAPHITE)).toMatchObject({
      swatches: [
        { role: "primary", value: GRAPHITE.seeds.primary },
        { role: "accent", value: GRAPHITE.seeds.accent },
      ],
      accessibleLabel: "Primary oklch(0.58 0.08 260), accent oklch(0.72 0.12 84)",
    })

    expect(getThemePaletteSignature(PAPER)).toMatchObject({
      swatches: [{ role: "primary", value: PAPER.seeds.primary }],
      accessibleLabel: "Primary oklch(0.64 0.07 96), no authored accent",
    })
  })

  it("duplicates authored fields without copying assignments or inventing accent", () => {
    const copy = buildThemeDuplicate(PAPER, {
      id: "theme-paper-copy",
      now: "2026-01-05T00:00:00.000Z",
    })

    expect(copy).toMatchObject({
      id: "theme-paper-copy",
      name: "Paper Mono copy",
      seeds: {
        primary: PAPER.seeds.primary,
      },
      createdAt: "2026-01-05T00:00:00.000Z",
      updatedAt: "2026-01-05T00:00:00.000Z",
    })
    expect("accent" in copy.seeds).toBe(false)
  })
})

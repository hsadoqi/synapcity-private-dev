import { describe, expect, it } from "vitest"

import type { ThemeAssignment, ThemeRecord } from "../types"
import { resolveThemeAssignment } from "./resolve-theme-assignment"

const theme: ThemeRecord = {
  id: "theme-one",
  name: "One",
  version: 1,
  seeds: { primary: "oklch(0.58 0.12 72)" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const assignment: ThemeAssignment = {
  scope: "document",
  scopeId: "doc-one",
  themeId: theme.id,
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("resolveThemeAssignment", () => {
  it("returns assigned for a valid assignment", () => {
    expect(
      resolveThemeAssignment({
        themes: [theme],
        assignments: [assignment],
        scope: "document",
        scopeId: "doc-one",
      })
    ).toEqual({ status: "assigned", theme })
  })

  it("returns unassigned when the scope has no assignment", () => {
    expect(
      resolveThemeAssignment({
        themes: [theme],
        assignments: [],
        scope: "document",
        scopeId: "doc-one",
      })
    ).toEqual({ status: "unassigned", theme: null })
  })

  it("returns missing-theme without fabricating a fallback", () => {
    expect(
      resolveThemeAssignment({
        themes: [theme],
        assignments: [{ ...assignment, themeId: "missing" }],
        scope: "document",
        scopeId: "doc-one",
      })
    ).toEqual({ status: "missing-theme", theme: null, themeId: "missing" })
  })
})

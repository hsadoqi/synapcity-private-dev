import { describe, expect, it } from "vitest"

import type { ThemeAssignment, ThemeRecord } from "../types"
import { createThemeStore } from "./theme-store"

const THEME: ThemeRecord = {
  id: "theme-one",
  name: "One",
  version: 1,
  seeds: { primary: "oklch(0.58 0.12 72)" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const ASSIGNMENT: ThemeAssignment = {
  scope: "document",
  scopeId: "doc-one",
  themeId: THEME.id,
  updatedAt: "2026-01-01T00:00:00.000Z",
}

function createMemoryStorage(initialAssignments = [ASSIGNMENT]) {
  let themes = [THEME]
  let assignments = initialAssignments

  return {
    loadThemes: () => themes,
    loadAssignments: () => assignments,
    saveTheme: (theme: ThemeRecord) => {
      const exists = themes.some((item) => item.id === theme.id)
      themes = exists
        ? themes.map((item) => (item.id === theme.id ? theme : item))
        : [...themes, theme]
      return themes
    },
    deleteTheme: (themeId: string) => {
      themes = themes.filter((theme) => theme.id !== themeId)
      return themes
    },
    persistAssignments: (next: ThemeAssignment[]) => {
      assignments = next
    },
    setAssignment: (input: Omit<ThemeAssignment, "updatedAt">) => {
      assignments = [
        ...assignments.filter(
          (item) => item.scope !== input.scope || item.scopeId !== input.scopeId
        ),
        { ...input, updatedAt: "2026-01-02T00:00:00.000Z" },
      ]
      return assignments
    },
    removeAssignment: (input: Pick<ThemeAssignment, "scope" | "scopeId">) => {
      assignments = assignments.filter(
        (item) => item.scope !== input.scope || item.scopeId !== input.scopeId
      )
      return assignments
    },
    inspect: () => ({ themes, assignments }),
  }
}

describe("theme store transition safety", () => {
  it("saves the same theme ID without mutating assignments", () => {
    const storage = createMemoryStorage()
    const store = createThemeStore({ storage })

    store.saveTheme({ ...THEME, name: "Updated" })

    expect(storage.inspect().themes[0]).toMatchObject({
      id: THEME.id,
      name: "Updated",
    })
    expect(JSON.stringify(storage.inspect().assignments)).toBe(
      JSON.stringify([ASSIGNMENT])
    )
  })

  it("saving an unassigned theme does not create an assignment", () => {
    const storage = createMemoryStorage([])
    const store = createThemeStore({ storage })

    store.saveTheme({ ...THEME, name: "Updated" })

    expect(storage.inspect().assignments).toEqual([])
  })

  it("saving as new leaves source-theme assignments byte-for-byte unchanged", () => {
    const storage = createMemoryStorage()
    const store = createThemeStore({ storage })
    const before = JSON.stringify(storage.inspect().assignments)

    store.saveTheme({
      ...THEME,
      id: "theme-copy",
      name: "Copy",
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    })

    expect(storage.inspect().themes.map((theme) => theme.id)).toEqual([
      THEME.id,
      "theme-copy",
    ])
    expect(JSON.stringify(storage.inspect().assignments)).toBe(before)
  })

  it("rejects assignment to a missing persisted theme ID", () => {
    const storage = createMemoryStorage()
    const store = createThemeStore({ storage })

    expect(() =>
      store.setAssignment({
        scope: "document",
        scopeId: "doc-two",
        themeId: "missing-theme",
      })
    ).toThrow("Cannot assign missing theme")
  })

  it("refuses to delete an in-use theme without an explicit resolution", () => {
    const storage = createMemoryStorage()
    const store = createThemeStore({ storage })

    expect(() => store.deleteTheme(THEME.id)).toThrow("Theme is assigned")
    expect(storage.inspect()).toEqual({
      themes: [THEME],
      assignments: [ASSIGNMENT],
    })
  })
})

import { describe, expect, it } from "vitest"

import { DEFAULT_NEUTRAL_ACCENT } from "../constants"
import type { ThemeRecord } from "../types"
import { createThemeBuilderSession } from "./theme-builder-session"

const baseline: ThemeRecord = {
  id: "theme-session",
  name: "Baseline",
  description: "Persisted",
  version: 1,
  seeds: { primary: "oklch(0.58 0.12 72)" },
  radius: { base: 0.75 },
  typography: { scale: 1 },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("theme builder session", () => {
  it("edits a draft without mutating the persisted baseline", () => {
    const session = createThemeBuilderSession(baseline)

    session.updateDraft({
      seeds: { ...session.getState().draft.seeds, primary: "oklch(0.7 0.1 80)" },
    })

    expect(session.getState().draft.seeds.primary).not.toBe(
      baseline.seeds.primary
    )
    expect(baseline.seeds.primary).toBe("oklch(0.58 0.12 72)")
    expect(session.getState().isDirty).toBe(true)
  })

  it("distinguishes absent accent from an explicitly authored neutral accent", () => {
    const session = createThemeBuilderSession(baseline)

    session.updateDraft({
      seeds: {
        ...session.getState().draft.seeds,
        accent: DEFAULT_NEUTRAL_ACCENT,
      },
    })

    expect(session.getState().isDirty).toBe(true)
    expect(session.getState().draft.seeds).toHaveProperty("accent")
  })

  it("resetting accent removes the authored field", () => {
    const session = createThemeBuilderSession({
      ...baseline,
      seeds: { ...baseline.seeds, accent: "oklch(0.64 0.16 245)" },
    })

    session.resetAccent()

    expect(session.getState().draft.seeds).not.toHaveProperty("accent")
  })

  it("reverts persisted fields while preserving preview preferences", () => {
    const session = createThemeBuilderSession(baseline, {
      scenario: "dashboard",
      viewport: "tablet",
      appearance: "dark",
      section: "typography",
    })
    session.updateDraft({
      name: "Changed",
      description: "Changed",
      seeds: {
        primary: "oklch(0.7 0.1 80)",
        accent: "oklch(0.64 0.16 245)",
      },
      radius: { base: 1.25 },
      typography: { scale: 1.1 },
    })

    session.revert()

    expect(session.getState().draft).toMatchObject({
      name: baseline.name,
      description: baseline.description,
      seeds: baseline.seeds,
      radius: baseline.radius,
      typography: baseline.typography,
    })
    expect(session.getState().preview).toEqual({
      scenario: "dashboard",
      viewport: "tablet",
      appearance: "dark",
      section: "typography",
    })
    expect(session.getState().isDirty).toBe(false)
  })

  it("saves to the same theme ID without changing preview preferences", () => {
    const saved: ThemeRecord[] = []
    const session = createThemeBuilderSession(baseline)
    session.updateDraft({ name: "Saved" })

    session.save((theme) => saved.push(theme))

    expect(saved[0]).toMatchObject({ id: baseline.id, name: "Saved" })
    expect(session.getState().isDirty).toBe(false)
  })
})

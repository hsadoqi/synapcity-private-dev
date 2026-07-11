import { describe, expect, it } from "vitest"

import { DEFAULT_NEUTRAL_ACCENT } from "../../constants"
import type { ThemeRecord } from "../../types"
import {
  areThemeDraftsEqual,
  buildThemeRecordFromDraft,
  createNewThemeDraft,
  getResolvedAccentLabel,
  themeRecordToDraft,
  validateThemeDraft,
} from "./theme-builder-model"

const THEME: ThemeRecord = {
  id: "theme-builder",
  name: "Builder",
  description: "Persisted",
  version: 1,
  seeds: {
    primary: "oklch(0.58 0.12 72)",
    accent: "oklch(0.64 0.16 245)",
  },
  radius: { base: 0.75 },
  typography: { scale: 1 },
  fonts: { body: "inter", heading: "space-grotesk" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("theme builder model", () => {
  it("initializes a new theme draft without authored accent", () => {
    const draft = createNewThemeDraft()

    expect(draft.name).toBe("Untitled theme")
    expect(draft.seeds.primary).toBeTruthy()
    expect("accent" in draft.seeds).toBe(false)
    expect(getResolvedAccentLabel(draft)).toMatchObject({
      status: "Using neutral default",
      seed: DEFAULT_NEUTRAL_ACCENT,
    })
  })

  it("loads a saved theme with exact authored accent presence", () => {
    expect(themeRecordToDraft(THEME).seeds).toEqual(THEME.seeds)
    expect(themeRecordToDraft({ ...THEME, seeds: { primary: THEME.seeds.primary } }).seeds).toEqual({
      primary: THEME.seeds.primary,
    })
  })

  it("keeps a neutral-equivalent authored accent distinct from absence", () => {
    const absent = createNewThemeDraft()
    const authored = {
      ...absent,
      seeds: { ...absent.seeds, accent: DEFAULT_NEUTRAL_ACCENT },
    }

    expect(areThemeDraftsEqual(absent, authored)).toBe(false)
    expect(getResolvedAccentLabel(authored).status).toBe("Customized")
  })

  it("persists authored fields without materializing fallback accent", () => {
    const draft = createNewThemeDraft()
    const record = buildThemeRecordFromDraft({
      draft,
      id: "theme-new",
      now: "2026-01-02T00:00:00.000Z",
    })

    expect(record.id).toBe("theme-new")
    expect(record.seeds).toEqual({ primary: draft.seeds.primary })
    expect(validateThemeDraft(draft).valid).toBe(true)
  })

  it("preserves authored accent when saving as a new record", () => {
    const draft = themeRecordToDraft(THEME)
    const copy = buildThemeRecordFromDraft({
      draft,
      id: "theme-copy",
      now: "2026-01-02T00:00:00.000Z",
    })

    expect(copy).toMatchObject({
      id: "theme-copy",
      name: THEME.name,
      seeds: THEME.seeds,
    })
  })

  it("includes name and description in dirty comparison", () => {
    const draft = themeRecordToDraft(THEME)

    expect(areThemeDraftsEqual(draft, { ...draft, name: "Changed" })).toBe(false)
    expect(
      areThemeDraftsEqual(draft, { ...draft, description: "Changed" })
    ).toBe(false)
  })
})

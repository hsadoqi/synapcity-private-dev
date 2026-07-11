import { DEFAULT_NEUTRAL_ACCENT, DEFAULT_THEME_RECORD } from "../../constants"
import { DEFAULT_THEME_FONTS, isThemeFontId } from "../../font-registry"
import { isValidOklch, normalizeOklch } from "../../engine/oklch"
import type { ThemeDraft, ThemeFontId, ThemeRecord } from "../../types"

export type ThemeBuilderSection =
  | "colors"
  | "typography"
  | "shape"
  | "accessibility"
  | "advanced"

export type ThemePreviewScenario =
  | "document"
  | "dashboard"
  | "editor"
  | "components"

export type ThemePreviewViewport = "fit" | "desktop" | "tablet" | "mobile"
export type ThemePreviewAppearance = "light" | "dark" | "system"

export type ThemeBuilderPreviewState = {
  scenario: ThemePreviewScenario
  viewport: ThemePreviewViewport
  appearance: ThemePreviewAppearance
  section: ThemeBuilderSection
}

export type ThemeDraftValidation = {
  valid: boolean
  errors: {
    name?: string
    primary?: string
    accent?: string
    radius?: string
    typography?: string
  }
}

export const DEFAULT_THEME_PREVIEW_STATE: ThemeBuilderPreviewState = {
  scenario: "document",
  viewport: "fit",
  appearance: "system",
  section: "colors",
}

export function createNewThemeDraft(): ThemeDraft {
  return {
    id: "new-theme-draft",
    name: "Untitled theme",
    description: undefined,
    version: 1,
    seeds: {
      primary: DEFAULT_THEME_RECORD.seeds.primary,
    },
    radius: {
      base: DEFAULT_THEME_RECORD.radius?.base ?? 0.75,
    },
    typography: {
      scale: DEFAULT_THEME_RECORD.typography?.scale ?? 1,
    },
    fonts: DEFAULT_THEME_FONTS,
  }
}

export function cloneThemeDraft(draft: ThemeDraft): ThemeDraft {
  return {
    ...draft,
    seeds: { ...draft.seeds },
    radius: draft.radius ? { ...draft.radius } : undefined,
    typography: draft.typography ? { ...draft.typography } : undefined,
    fonts: draft.fonts ? { ...draft.fonts } : undefined,
  }
}

export function themeRecordToDraft(theme: ThemeRecord): ThemeDraft {
  return cloneThemeDraft({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    version: theme.version,
    seeds:
      theme.seeds.accent === undefined
        ? { primary: theme.seeds.primary }
        : { primary: theme.seeds.primary, accent: theme.seeds.accent },
    radius: theme.radius,
    typography: theme.typography,
    fonts: theme.fonts,
  })
}

export function normalizeThemeDraftForPersistence(
  draft: ThemeDraft
): ThemeDraft {
  const seeds =
    draft.seeds.accent === undefined
      ? { primary: normalizeOklch(draft.seeds.primary) }
      : {
          primary: normalizeOklch(draft.seeds.primary),
          accent: normalizeOklch(draft.seeds.accent),
        }

  const bodyFont = isThemeFontId(draft.fonts?.body)
    ? draft.fonts.body
    : DEFAULT_THEME_FONTS.body
  const headingFont = isThemeFontId(draft.fonts?.heading)
    ? draft.fonts.heading
    : DEFAULT_THEME_FONTS.heading

  return {
    ...draft,
    name: draft.name.trim(),
    description: draft.description?.trim() || undefined,
    seeds,
    radius: {
      base: clampNumber(draft.radius?.base, 0, 2, 0.75),
    },
    typography: {
      scale: clampNumber(draft.typography?.scale, 0.85, 1.25, 1),
    },
    fonts: {
      body: bodyFont,
      heading: headingFont,
    } satisfies Record<"body" | "heading", ThemeFontId>,
  }
}

export function validateThemeDraft(draft: ThemeDraft): ThemeDraftValidation {
  const errors: ThemeDraftValidation["errors"] = {}

  if (!draft.name.trim()) {
    errors.name = "Theme name is required."
  }

  if (!isValidOklch(draft.seeds.primary)) {
    errors.primary = "Enter OKLCH like oklch(0.58 0.12 72)."
  }

  if (draft.seeds.accent !== undefined && !isValidOklch(draft.seeds.accent)) {
    errors.accent = "Enter OKLCH like oklch(0.62 0.14 48)."
  }

  const radius = draft.radius?.base
  if (radius !== undefined && (!Number.isFinite(radius) || radius < 0 || radius > 2)) {
    errors.radius = "Radius must be between 0 and 2 rem."
  }

  const scale = draft.typography?.scale
  if (scale !== undefined && (!Number.isFinite(scale) || scale < 0.85 || scale > 1.25)) {
    errors.typography = "Type scale must be between 0.85 and 1.25."
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function areThemeDraftsEqual(left: ThemeDraft, right: ThemeDraft) {
  return (
    JSON.stringify(normalizeComparableDraft(left)) ===
    JSON.stringify(normalizeComparableDraft(right))
  )
}

export function buildThemeRecordFromDraft(input: {
  draft: ThemeDraft
  id: string
  createdAt?: string
  now: string
}): ThemeRecord {
  const normalized = normalizeThemeDraftForPersistence(input.draft)

  return {
    ...normalized,
    id: input.id,
    version: 1,
    createdAt: input.createdAt ?? input.now,
    updatedAt: input.now,
  }
}

export function getResolvedAccentLabel(draft: ThemeDraft) {
  return draft.seeds.accent === undefined
    ? {
        status: "Using neutral default",
        scaleLabel: "Default neutral accent",
        seed: DEFAULT_NEUTRAL_ACCENT,
      }
    : {
        status: "Customized",
        scaleLabel: "Authored accent",
        seed: draft.seeds.accent,
      }
}

function normalizeComparableDraft(draft: ThemeDraft): ThemeDraft {
  return normalizeThemeDraftForPersistence(draft)
}

function clampNumber(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

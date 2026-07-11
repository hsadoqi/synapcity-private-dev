import type { ThemeDraft, ThemeRecord } from "../types"

export type ThemePreviewPreferences = {
  scenario: "document" | "dashboard" | "editor" | "components"
  viewport: "fit" | "desktop" | "tablet" | "mobile"
  appearance: "light" | "dark" | "system"
  section: "colors" | "typography" | "shape" | "accessibility" | "advanced"
}

type ThemeBuilderState = {
  baseline: ThemeRecord
  draft: ThemeDraft
  isDirty: boolean
  saveStatus: "saved" | "unsaved" | "saving" | "error"
  preview: ThemePreviewPreferences
}

const DEFAULT_PREVIEW: ThemePreviewPreferences = {
  scenario: "document",
  viewport: "fit",
  appearance: "system",
  section: "colors",
}

export function createThemeBuilderSession(
  persistedTheme: ThemeRecord,
  preview: ThemePreviewPreferences = DEFAULT_PREVIEW
) {
  let baseline = cloneTheme(persistedTheme)
  let draft = toDraft(baseline)
  let saveStatus: ThemeBuilderState["saveStatus"] = "saved"
  const previewState = { ...preview }

  function getState(): ThemeBuilderState {
    const isDirty = !draftsEqual(toDraft(baseline), draft)
    return {
      baseline: cloneTheme(baseline),
      draft: cloneDraft(draft),
      isDirty,
      saveStatus: isDirty && saveStatus === "saved" ? "unsaved" : saveStatus,
      preview: { ...previewState },
    }
  }

  return {
    getState,
    updateDraft(patch: Partial<ThemeDraft>) {
      draft = cloneDraft({ ...draft, ...patch })
      saveStatus = "unsaved"
    },
    updatePreview(patch: Partial<ThemePreviewPreferences>) {
      Object.assign(previewState, patch)
    },
    resetAccent() {
      draft = { ...draft, seeds: { primary: draft.seeds.primary } }
      saveStatus = "unsaved"
    },
    revert() {
      draft = toDraft(baseline)
      saveStatus = "saved"
    },
    save(persist: (theme: ThemeRecord) => void) {
      saveStatus = "saving"
      const saved: ThemeRecord = {
        ...cloneDraft(draft),
        id: baseline.id,
        version: baseline.version,
        createdAt: baseline.createdAt,
        updatedAt: new Date().toISOString(),
      }
      persist(saved)
      baseline = cloneTheme(saved)
      draft = toDraft(saved)
      saveStatus = "saved"
      return cloneTheme(saved)
    },
  }
}

function toDraft(theme: ThemeRecord): ThemeDraft {
  return cloneDraft({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    version: theme.version,
    seeds: theme.seeds,
    radius: theme.radius,
    typography: theme.typography,
    fonts: theme.fonts,
  })
}

function cloneTheme(theme: ThemeRecord): ThemeRecord {
  return {
    ...theme,
    seeds: { ...theme.seeds },
    radius: theme.radius ? { ...theme.radius } : undefined,
    typography: theme.typography ? { ...theme.typography } : undefined,
    fonts: theme.fonts ? { ...theme.fonts } : undefined,
  }
}

function cloneDraft(draft: ThemeDraft): ThemeDraft {
  return {
    ...draft,
    seeds: { ...draft.seeds },
    radius: draft.radius ? { ...draft.radius } : undefined,
    typography: draft.typography ? { ...draft.typography } : undefined,
    fonts: draft.fonts ? { ...draft.fonts } : undefined,
  }
}

function draftsEqual(left: ThemeDraft, right: ThemeDraft) {
  return JSON.stringify(left) === JSON.stringify(right)
}

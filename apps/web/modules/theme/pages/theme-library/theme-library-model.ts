import type { ThemeAssignment, ThemeRecord } from "../../types"

export type ThemeLibraryFilter = "all" | "in-use" | "unused"
export type ThemeLibrarySort = "updated" | "name"

export type ThemePaletteSignature = {
  swatches: Array<{
    role: "primary" | "accent"
    value: string
  }>
  accessibleLabel: string
}

export type ThemeUsageSummary = {
  count: number
  label: string
  isInUse: boolean
}

export type ThemeLibraryRowModel = {
  theme: ThemeRecord
  palette: ThemePaletteSignature
  usage: ThemeUsageSummary
  updatedLabel: string
}

export function getThemePaletteSignature(
  theme: ThemeRecord
): ThemePaletteSignature {
  const swatches: ThemePaletteSignature["swatches"] = [
    { role: "primary", value: theme.seeds.primary },
  ]

  if (theme.seeds.accent !== undefined) {
    swatches.push({ role: "accent", value: theme.seeds.accent })
  }

  return {
    swatches,
    accessibleLabel:
      theme.seeds.accent === undefined
        ? `Primary ${theme.seeds.primary}, no authored accent`
        : `Primary ${theme.seeds.primary}, accent ${theme.seeds.accent}`,
  }
}

export function getThemeUsageSummary(
  theme: ThemeRecord,
  assignments: ThemeAssignment[]
): ThemeUsageSummary {
  const themeAssignments = assignments.filter(
    (assignment) => assignment.themeId === theme.id
  )
  const hasRoot = themeAssignments.some(
    (assignment) =>
      assignment.scope === "global" && assignment.scopeId === "root"
  )
  const scopedCount = themeAssignments.length - (hasRoot ? 1 : 0)

  if (!themeAssignments.length) {
    return { count: 0, label: "Not in use", isInUse: false }
  }

  if (hasRoot && scopedCount > 0) {
    return {
      count: themeAssignments.length,
      label: `Root + ${scopedCount} ${scopedCount === 1 ? "scope" : "scopes"}`,
      isInUse: true,
    }
  }

  if (hasRoot) {
    return { count: 1, label: "Root", isInUse: true }
  }

  return {
    count: themeAssignments.length,
    label: `${themeAssignments.length} ${
      themeAssignments.length === 1 ? "scope" : "scopes"
    }`,
    isInUse: true,
  }
}

export function formatThemeUpdatedLabel(updatedAt: string) {
  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) return "Unknown"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function getThemeLibraryRows(input: {
  themes: ThemeRecord[]
  assignments: ThemeAssignment[]
  filter: ThemeLibraryFilter
  query: string
  sort: ThemeLibrarySort
}): ThemeLibraryRowModel[] {
  const normalizedQuery = input.query.trim().toLocaleLowerCase()

  return input.themes
    .map((theme) => ({
      theme,
      palette: getThemePaletteSignature(theme),
      usage: getThemeUsageSummary(theme, input.assignments),
      updatedLabel: formatThemeUpdatedLabel(theme.updatedAt),
    }))
    .filter((row) => {
      if (input.filter === "in-use" && !row.usage.isInUse) return false
      if (input.filter === "unused" && row.usage.isInUse) return false

      if (!normalizedQuery) return true

      return `${row.theme.name} ${row.theme.description ?? ""}`
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    })
    .sort((left, right) => {
      if (input.sort === "name") {
        return left.theme.name.localeCompare(right.theme.name)
      }

      return (
        new Date(right.theme.updatedAt).getTime() -
        new Date(left.theme.updatedAt).getTime()
      )
    })
}

export function buildThemeDuplicate(
  source: ThemeRecord,
  options: {
    id: string
    now: string
  }
): ThemeRecord {
  const seeds =
    source.seeds.accent === undefined
      ? { primary: source.seeds.primary }
      : { primary: source.seeds.primary, accent: source.seeds.accent }

  return {
    ...source,
    id: options.id,
    name: `${source.name} copy`,
    seeds,
    createdAt: options.now,
    updatedAt: options.now,
  }
}

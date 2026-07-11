import type {
  ThemeAssignment,
  ThemeRecord,
  ThemeResolution,
  ThemeScope,
} from "../types"

export function resolveThemeAssignment(input: {
  themes: ThemeRecord[]
  assignments: ThemeAssignment[]
  scope: ThemeScope
  scopeId: string
}): ThemeResolution {
  const assignment = input.assignments.find(
    (item) => item.scope === input.scope && item.scopeId === input.scopeId
  )

  if (!assignment) {
    return { status: "unassigned", theme: null }
  }

  const theme = input.themes.find((item) => item.id === assignment.themeId)

  if (!theme) {
    return { status: "missing-theme", theme: null, themeId: assignment.themeId }
  }

  return { status: "assigned", theme }
}

"use client"

import { useThemeAssignment } from "../hooks/use-theme-assignment"
import type { ThemeRecord, ThemeScope } from "../types"

type ThemeAssignmentPanelProps = {
  themes: ThemeRecord[]
  scope: ThemeScope
  scopeId: string
}

export function ThemeAssignmentPanel({
  themes,
  scope,
  scopeId,
}: ThemeAssignmentPanelProps) {
  const { assignment, setAssignment, removeAssignment } = useThemeAssignment(
    scope,
    scopeId
  )

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-foreground">Assignment</h2>
        <p className="text-xs text-muted-foreground">
          Assign a saved theme to this scope, or remove the assignment to
          inherit.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={assignment?.themeId ?? ""}
          onChange={(event) => {
            if (event.target.value) setAssignment(event.target.value)
          }}
        >
          <option value="">Inherited / no explicit theme</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="h-10 rounded-md border px-3 text-sm hover:bg-muted"
          onClick={removeAssignment}
        >
          Remove assignment
        </button>
      </div>
    </section>
  )
}

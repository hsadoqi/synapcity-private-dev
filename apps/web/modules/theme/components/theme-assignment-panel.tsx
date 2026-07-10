"use client"

import { useThemeAssignment } from "../hooks/use-theme-assignment"
import type { ThemeRecord, ThemeScope } from "../types"

type ThemeAssignmentPanelProps = {
  themes: ThemeRecord[]
  scope: ThemeScope
  scopeId: string
  selectedThemeId?: string
}

export function ThemeAssignmentPanel({
  themes,
  scope,
  scopeId,
  selectedThemeId,
}: ThemeAssignmentPanelProps) {
  const { assignment, setAssignment, removeAssignment } = useThemeAssignment(
    scope,
    scopeId
  )
  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId)
  const assignedTheme = themes.find((theme) => theme.id === assignment?.themeId)
  const scopeLabel = scope === "global" ? "Root app theme" : "Scoped override"

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="mb-4 space-y-1">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Apply theme
        </p>
        <h2 className="text-sm font-medium text-foreground">{scopeLabel}</h2>
        <p className="text-xs leading-5 text-muted-foreground">
          Apply a saved theme record to {scope === "global" ? "the app root" : "this scope"}.
          Removing the assignment lets CSS inheritance take over.
        </p>
      </div>

      <div className="space-y-3">
        <select
          className="h-9 w-full rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

        <div className="flex flex-wrap gap-2">
          {selectedTheme ? (
            <button
              type="button"
              className="h-8 rounded-md border bg-foreground px-2.5 text-xs font-medium text-background hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={assignment?.themeId === selectedTheme.id}
              onClick={() => setAssignment(selectedTheme.id)}
            >
              Apply selected
            </button>
          ) : null}

          <button
            type="button"
            className="h-8 rounded-md border px-2.5 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!assignment}
            onClick={removeAssignment}
          >
            Inherit instead
          </button>
        </div>

        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
          {assignment ? (
            <>
              Applied saved theme:{" "}
              <span className="font-medium text-foreground">
                {assignedTheme?.name ?? assignment.themeId}
              </span>
            </>
          ) : (
            "No explicit assignment. This scope inherits from its parent."
          )}
        </div>
      </div>
    </section>
  )
}

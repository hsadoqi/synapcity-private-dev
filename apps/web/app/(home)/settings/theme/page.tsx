"use client"

import * as React from "react"

import {
  ThemeScopeProvider,
  DEFAULT_THEME_RECORD,
  loadThemeAssignments,
  loadThemes,
  saveTheme,
  saveThemeAssignment,
  type ThemeAssignment,
  type ThemeRecord,
} from "@/modules/theme"

const paletteSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

export default function ThemeSettingsPage() {
  const [themes, setThemes] = React.useState<ThemeRecord[]>(() => loadThemes())
  const [assignments, setAssignments] = React.useState<ThemeAssignment[]>(() =>
    loadThemeAssignments()
  )
  const [selectedThemeId, setSelectedThemeId] = React.useState(
    themes[0]?.id ?? DEFAULT_THEME_RECORD.id
  )
  const [name, setName] = React.useState("New theme")
  const [primaryOklch, setPrimaryOklch] = React.useState(
    DEFAULT_THEME_RECORD.primaryOklch
  )
  const [accentOklch, setAccentOklch] = React.useState(
    DEFAULT_THEME_RECORD.accentOklch
  )

  const activeTheme =
    themes.find((theme) => theme.id === selectedThemeId) ??
    themes[0] ??
    DEFAULT_THEME_RECORD

  const handleSaveTheme = () => {
    const nextTheme: ThemeRecord = {
      id: `theme-${Date.now()}`,
      name,
      primaryOklch,
      accentOklch,
      mode: "system",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const nextThemes = saveTheme(nextTheme)
    setThemes(nextThemes)
    setSelectedThemeId(nextTheme.id)
    setAssignments(
      saveThemeAssignment({
        id: `assignment-${Date.now()}`,
        scopeType: "root",
        scopeId: "app",
        themeId: nextTheme.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Theme</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Theme management
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save theme presets, preview runtime palette generation, and keep a
          lightweight assignment record.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_360px]">
        <ThemeScopeProvider
          scopeType="root"
          scopeId="theme-preview"
          theme={activeTheme}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-sm text-muted-foreground">
                Primary palette
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {paletteSteps.map((step) => (
                  <div
                    key={step}
                    className="h-10 w-10 rounded-full border border-border"
                    style={{ backgroundColor: `var(--primary-${step})` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-sm text-muted-foreground">
                Accent palette
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {paletteSteps.map((step) => (
                  <div
                    key={step}
                    className="h-10 w-10 rounded-full border border-border"
                    style={{ backgroundColor: `var(--accent-${step})` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </ThemeScopeProvider>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Theme preset</span>
            <select
              value={selectedThemeId}
              onChange={(event) => setSelectedThemeId(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Primary OKLCH</span>
            <input
              value={primaryOklch}
              onChange={(event) => setPrimaryOklch(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Accent OKLCH</span>
            <input
              value={accentOklch}
              onChange={(event) => setAccentOklch(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>

          <button
            type="button"
            onClick={handleSaveTheme}
            className="w-full rounded-full border border-border px-3 py-2 text-sm transition hover:border-primary"
          >
            Create theme preset
          </button>

          <div className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Assignments</div>
            <div className="mt-2">{assignments.length} saved assignment(s)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

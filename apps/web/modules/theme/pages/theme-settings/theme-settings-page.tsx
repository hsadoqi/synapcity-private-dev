"use client"

import * as React from "react"

import { DEFAULT_THEME_RECORD } from "../../constants"
import { useThemes } from "../../hooks/use-themes"
import { ThemeAssignmentPanel } from "../../components/theme-assignment-panel"
import { ThemeEditor } from "../../components/theme-editor"
import { PaletteScalePreview } from "../../components/palette-scale-preview"

export function ThemeSettingsPage() {
  const { themes } = useThemes()
  const [selectedThemeId, setSelectedThemeId] = React.useState(
    DEFAULT_THEME_RECORD.id
  )

  const selectedTheme =
    themes.find((theme) => theme.id === selectedThemeId) ?? themes[0]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:py-8">
      <header className="grid gap-4 border-b pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Synapcity themes
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Theme editor
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Edit saved theme records, inspect generated OKLCH scales, and apply
            explicit root or scoped overrides. Unassigned scopes inherit through
            the CSS cascade.
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Root app theme:{" "}
          <span className="font-medium text-foreground">explicit assignment</span>
        </div>
      </header>

      {!selectedTheme ? (
        <section className="rounded-lg border border-dashed bg-card p-8 text-center">
          <h2 className="text-sm font-medium text-foreground">
            No saved themes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a saved theme before applying root or scoped overrides.
          </p>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <ThemeEditor
              key={selectedTheme.id}
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedThemeId}
            />
          </div>

          <aside className="min-w-0 space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-lg border bg-card p-4">
              <div className="mb-4 space-y-1">
                <h2 className="text-sm font-medium text-foreground">
                  Palette output
                </h2>
                <p className="text-xs leading-5 text-muted-foreground">
                  Generated variables from the selected saved theme.
                </p>
              </div>
              <div className="space-y-5">
                <PaletteScalePreview
                  label="Primary generated scale"
                  description="Main UI seed. Use this to judge the theme's center of gravity."
                  seed={selectedTheme.seeds.primary}
                  variablePrefix="--primary"
                  readOnly
                />
                <PaletteScalePreview
                  label="Accent generated scale"
                  description="Secondary emphasis only. It should support the primary scale."
                  seed={selectedTheme.seeds.accent}
                  variablePrefix="--accent"
                  readOnly
                  compact
                />
              </div>
            </section>

            <ThemeAssignmentPanel
              themes={themes}
              scope="global"
              scopeId="root"
              selectedThemeId={selectedTheme.id}
            />
          </aside>
        </div>
      )}
    </main>
  )
}

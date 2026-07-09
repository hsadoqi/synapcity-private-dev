"use client"

import * as React from "react"

import { DEFAULT_THEME_RECORD } from "../../constants"
import { useThemes } from "../../hooks/use-themes"
import { ThemeAssignmentPanel } from "../../components/theme-assignment-panel"
import { ThemeEditor } from "../../components/theme-editor"

export function ThemeSettingsPage() {
  const { themes } = useThemes()
  const [selectedThemeId, setSelectedThemeId] = React.useState(
    DEFAULT_THEME_RECORD.id
  )

  const selectedTheme =
    themes.find((theme) => theme.id === selectedThemeId) ?? themes[0]

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Synapcity themes
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Theme scales
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Build Tailwind-ish OKLCH palette scales from primary and accent seeds.
          Scoped assignments are explicit; unassigned scopes inherit through the
          CSS cascade.
        </p>
      </header>

      <ThemeAssignmentPanel themes={themes} scope="global" scopeId="root" />
      <ThemeEditor
        key={selectedTheme?.id ?? "theme-editor-empty"}
        selectedTheme={selectedTheme}
        onSelectTheme={setSelectedThemeId}
      />
    </main>
  )
}

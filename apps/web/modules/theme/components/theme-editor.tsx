"use client"

import * as React from "react"

import { DEFAULT_THEME_RECORD } from "../constants"
import { isValidOklch, normalizeOklch } from "../engine/oklch"
import { DEFAULT_THEME_FONTS, getThemeFontOptions } from "../font-registry"
import { useThemes } from "../hooks/use-themes"
import type { ThemeFontId, ThemeRecord } from "../types"
import { PaletteScalePreview } from "./palette-scale-preview"

type ThemeEditorProps = {
  selectedTheme?: ThemeRecord
  onSelectTheme: (themeId: string) => void
}

export function ThemeEditor({
  selectedTheme,
  onSelectTheme,
}: ThemeEditorProps) {
  const { themes, saveTheme } = useThemes()
  const theme = selectedTheme ?? themes[0] ?? DEFAULT_THEME_RECORD
  const [draft, setDraft] = React.useState<ThemeRecord>(theme)

  const primaryIsValid = isValidOklch(draft.seeds.primary)
  const accentIsValid = isValidOklch(draft.seeds.accent)
  const radiusBase =
    draft.radius?.base ?? DEFAULT_THEME_RECORD.radius?.base ?? 0.75
  const typeScale =
    draft.typography?.scale ?? DEFAULT_THEME_RECORD.typography?.scale ?? 1
  const bodyFont = draft.fonts?.body ?? DEFAULT_THEME_FONTS.body
  const headingFont = draft.fonts?.heading ?? DEFAULT_THEME_FONTS.heading
  const bodyFontOptions = getThemeFontOptions("body")
  const headingFontOptions = getThemeFontOptions("heading")
  const radiusIsValid =
    Number.isFinite(radiusBase) && radiusBase >= 0 && radiusBase <= 2
  const typeScaleIsValid =
    Number.isFinite(typeScale) && typeScale >= 0.85 && typeScale <= 1.25
  const radiusInputValue = Number.isFinite(radiusBase) ? radiusBase : ""
  const typeScaleInputValue = Number.isFinite(typeScale) ? typeScale : ""
  const canSave =
    draft.name.trim().length > 0 &&
    primaryIsValid &&
    accentIsValid &&
    radiusIsValid &&
    typeScaleIsValid

  function updateDraft(patch: Partial<ThemeRecord>) {
    setDraft((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }))
  }

  function saveCurrentTheme() {
    if (!canSave) return
    const next = {
      ...draft,
      name: draft.name.trim(),
      seeds: {
        primary: normalizeOklch(draft.seeds.primary),
        accent: normalizeOklch(draft.seeds.accent),
      },
      updatedAt: new Date().toISOString(),
    }
    saveTheme(next)
    onSelectTheme(next.id)
  }

  function saveAsNewTheme() {
    if (!canSave) return
    const now = new Date().toISOString()
    const next: ThemeRecord = {
      ...draft,
      id: `theme-${crypto.randomUUID()}`,
      name: `${draft.name.trim()} Copy`,
      seeds: {
        primary: normalizeOklch(draft.seeds.primary),
        accent: normalizeOklch(draft.seeds.accent),
      },
      createdAt: now,
      updatedAt: now,
    }
    saveTheme(next)
    onSelectTheme(next.id)
  }

  return (
    <section className="space-y-6 rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={theme.id}
          onChange={(event) => onSelectTheme(event.target.value)}
        >
          {themes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="h-10 rounded-md border px-3 text-sm hover:bg-muted disabled:opacity-50"
          disabled={!canSave}
          onClick={saveCurrentTheme}
        >
          Save
        </button>

        <button
          type="button"
          className="h-10 rounded-md border px-3 text-sm hover:bg-muted disabled:opacity-50"
          disabled={!canSave}
          onClick={saveAsNewTheme}
        >
          Save as new
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Theme name
          </span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={draft.name}
            onChange={(event) => updateDraft({ name: event.target.value })}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Radius base rem
          </span>
          <input
            type="number"
            min="0"
            max="2"
            step="0.05"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={radiusInputValue}
            placeholder="0.75"
            onChange={(event) =>
              updateDraft({
                radius: { base: Number.parseFloat(event.target.value) },
              })
            }
          />
          {!radiusIsValid ? (
            <p className="text-xs text-destructive">
              Use a number from 0 to 2.
            </p>
          ) : null}
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Type scale
          </span>
          <input
            type="number"
            min="0.85"
            max="1.25"
            step="0.01"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={typeScaleInputValue}
            placeholder="1"
            onChange={(event) =>
              updateDraft({
                typography: {
                  ...draft.typography,
                  scale: Number.parseFloat(event.target.value),
                },
              })
            }
          />
          {!typeScaleIsValid ? (
            <p className="text-xs text-destructive">
              Use a number from 0.85 to 1.25.
            </p>
          ) : null}
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Body font
          </span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={bodyFont}
            onChange={(event) =>
              updateDraft({
                fonts: {
                  ...draft.fonts,
                  body: event.target.value as ThemeFontId,
                },
              })
            }
          >
            {bodyFontOptions.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Heading font
          </span>
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={headingFont}
            onChange={(event) =>
              updateDraft({
                fonts: {
                  ...draft.fonts,
                  heading: event.target.value as ThemeFontId,
                },
              })
            }
          >
            {headingFontOptions.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Primary seed
          </span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 font-mono text-sm"
            value={draft.seeds.primary}
            onChange={(event) =>
              updateDraft({
                seeds: { ...draft.seeds, primary: event.target.value },
              })
            }
          />
          {!primaryIsValid ? (
            <p className="text-xs text-destructive">Use valid OKLCH.</p>
          ) : null}
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Accent seed
          </span>
          <input
            className="h-10 w-full rounded-md border bg-background px-3 font-mono text-sm"
            value={draft.seeds.accent}
            onChange={(event) =>
              updateDraft({
                seeds: { ...draft.seeds, accent: event.target.value },
              })
            }
          />
          {!accentIsValid ? (
            <p className="text-xs text-destructive">Use valid OKLCH.</p>
          ) : null}
        </label>
      </div>

      <div className="space-y-6">
        <PaletteScalePreview
          label="Primary scale"
          seed={draft.seeds.primary}
          onSeedChange={(primary) =>
            updateDraft({ seeds: { ...draft.seeds, primary } })
          }
        />
        <PaletteScalePreview
          label="Accent scale"
          seed={draft.seeds.accent}
          onSeedChange={(accent) =>
            updateDraft({ seeds: { ...draft.seeds, accent } })
          }
        />
      </div>
    </section>
  )
}

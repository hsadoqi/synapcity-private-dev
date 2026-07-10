"use client"

import * as React from "react"

import { DEFAULT_THEME_RECORD } from "../constants"
import { isValidOklch, normalizeOklch } from "../engine/oklch"
import { DEFAULT_THEME_FONTS, getThemeFontOptions } from "../font-registry"
import { useThemes } from "../hooks/use-themes"
import type { ThemeFontId, ThemeRecord } from "../types"
import { ColorPicker } from "./color-picker"
import { PaletteScalePreview } from "./palette-scale-preview"

type ThemeEditorProps = {
  selectedTheme: ThemeRecord
  onSelectTheme: (themeId: string) => void
}

const RADIUS_MIN = 0
const RADIUS_MAX = 2
const RADIUS_STEP = 0.05
const TYPE_SCALE_MIN = 0.85
const TYPE_SCALE_MAX = 1.25
const TYPE_SCALE_STEP = 0.01

export function ThemeEditor({
  selectedTheme,
  onSelectTheme,
}: ThemeEditorProps) {
  const { themes, saveTheme, deleteTheme } = useThemes()
  const [draft, setDraft] = React.useState<ThemeRecord>(selectedTheme)

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
    Number.isFinite(radiusBase) &&
    radiusBase >= RADIUS_MIN &&
    radiusBase <= RADIUS_MAX
  const typeScaleIsValid =
    Number.isFinite(typeScale) &&
    typeScale >= TYPE_SCALE_MIN &&
    typeScale <= TYPE_SCALE_MAX
  const canSave =
    draft.name.trim().length > 0 &&
    primaryIsValid &&
    accentIsValid &&
    radiusIsValid &&
    typeScaleIsValid
  const isDefaultTheme = selectedTheme.id === DEFAULT_THEME_RECORD.id
  const isDirty = isThemeDirty(selectedTheme, draft)

  function updateDraft(patch: Partial<ThemeRecord>) {
    setDraft((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }))
  }

  function setRadius(nextValue: number) {
    updateDraft({
      radius: {
        ...draft.radius,
        base: clamp(roundToStep(nextValue, RADIUS_STEP), RADIUS_MIN, RADIUS_MAX),
      },
    })
  }

  function setTypeScale(nextValue: number) {
    updateDraft({
      typography: {
        ...draft.typography,
        scale: clamp(
          roundToStep(nextValue, TYPE_SCALE_STEP),
          TYPE_SCALE_MIN,
          TYPE_SCALE_MAX
        ),
      },
    })
  }

  function saveCurrentTheme() {
    if (!canSave) return
    const next = normalizeThemeDraft(draft)
    saveTheme(next)
    onSelectTheme(next.id)
  }

  function saveAsNewTheme() {
    if (!canSave) return
    const now = new Date().toISOString()
    const next: ThemeRecord = {
      ...normalizeThemeDraft(draft),
      id: `theme-${crypto.randomUUID()}`,
      name: `${draft.name.trim()} Copy`,
      createdAt: now,
      updatedAt: now,
    }
    saveTheme(next)
    onSelectTheme(next.id)
  }

  function deleteSelectedTheme() {
    if (isDefaultTheme) return
    const fallbackTheme =
      themes.find((theme) => theme.id !== selectedTheme.id) ??
      DEFAULT_THEME_RECORD
    deleteTheme(selectedTheme.id)
    onSelectTheme(fallbackTheme.id)
  }

  return (
    <section className="rounded-lg border bg-card">
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {selectedTheme.name}
            </h2>
            <span
              className={
                isDirty
                  ? "rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300"
                  : "rounded-full border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              }
            >
              {isDirty ? "Unsaved changes" : "Saved"}
            </span>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Editing saved theme record{" "}
            <span className="font-mono text-xs text-foreground">
              {selectedTheme.id}
            </span>
            . Apply it separately when the palette looks right.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_auto_auto_auto] lg:min-w-[520px]">
          <select
            className="h-9 rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedTheme.id}
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
            className="h-9 rounded-md border bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSave || !isDirty}
            onClick={saveCurrentTheme}
          >
            Save
          </button>

          <button
            type="button"
            className="h-9 rounded-md border px-3 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSave}
            onClick={saveAsNewTheme}
          >
            Save as new
          </button>

          <button
            type="button"
            className="h-9 rounded-md border px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDefaultTheme}
            title={
              isDefaultTheme
                ? "The default theme cannot be deleted."
                : "Delete saved theme"
            }
            onClick={deleteSelectedTheme}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(300px,34%)]">
        <div className="min-w-0 divide-y">
          <EditorSection
            eyebrow="Theme identity"
            title="Name and description"
            description="This labels the saved record. It does not create or apply a new theme by itself."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Theme name
                </span>
                <input
                  className="h-9 w-full rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={draft.name}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Description
                </span>
                <textarea
                  className="min-h-20 w-full resize-y rounded-md border bg-background px-2.5 py-2 text-sm leading-5 outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={draft.description ?? ""}
                  onChange={(event) =>
                    updateDraft({ description: event.target.value })
                  }
                />
              </label>
            </div>
          </EditorSection>

          <EditorSection
            eyebrow="Primary seed"
            title="Main generated scale"
            description="Primary is the theme's main color seed. It should carry the interface before accent is needed."
          >
            <SeedInput
              label="Primary OKLCH"
              value={draft.seeds.primary}
              isValid={primaryIsValid}
              onChange={(primary) =>
                updateDraft({ seeds: { ...draft.seeds, primary } })
              }
            />
            <div className="mt-5">
              <PaletteScalePreview
                label="Generated scale"
                description="Tailwind-like steps from 50 through 950."
                seed={draft.seeds.primary}
                variablePrefix="--primary"
                onSeedChange={(primary) =>
                  updateDraft({ seeds: { ...draft.seeds, primary } })
                }
              />
            </div>
          </EditorSection>

          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 outline-none hover:bg-muted/30 focus-visible:ring-1 focus-visible:ring-ring">
              <span className="min-w-0">
                <span className="block text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  Optional accent
                </span>
                <span className="mt-1 block text-sm font-medium text-foreground">
                  Secondary emphasis scale
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Accent supports subtle emphasis. It should not overpower the
                  primary seed.
                </span>
              </span>
              <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground group-open:bg-muted">
                Edit
              </span>
            </summary>
            <div className="border-t p-5">
              <SeedInput
                label="Accent OKLCH"
                value={draft.seeds.accent}
                isValid={accentIsValid}
                onChange={(accent) =>
                  updateDraft({ seeds: { ...draft.seeds, accent } })
                }
              />
              <div className="mt-5">
                <PaletteScalePreview
                  label="Generated accent scale"
                  description="Use this for small emphasis moments and status-adjacent UI."
                  seed={draft.seeds.accent}
                  variablePrefix="--accent"
                  onSeedChange={(accent) =>
                    updateDraft({ seeds: { ...draft.seeds, accent } })
                  }
                  compact
                />
              </div>
            </div>
          </details>

          <EditorSection
            eyebrow="Shape"
            title="Radius"
            description="Adjust the base radius used by theme-aware surfaces."
          >
            <StepperControl
              label="Radius"
              value={radiusBase}
              min={RADIUS_MIN}
              max={RADIUS_MAX}
              step={RADIUS_STEP}
              suffix="rem"
              onChange={setRadius}
            />
            {!radiusIsValid ? (
              <p className="mt-2 text-xs text-destructive">
                Radius must stay between 0 and 2rem.
              </p>
            ) : null}
          </EditorSection>

          <EditorSection
            eyebrow="Typography"
            title="Type scale and fonts"
            description="Keep scale changes restrained so dense builder views remain readable."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <StepperControl
                label="Type scale"
                value={typeScale}
                min={TYPE_SCALE_MIN}
                max={TYPE_SCALE_MAX}
                step={TYPE_SCALE_STEP}
                onChange={setTypeScale}
              />
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Heading font
                </span>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              <label className="space-y-1.5 md:col-start-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Body font
                </span>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            </div>
            {!typeScaleIsValid ? (
              <p className="mt-2 text-xs text-destructive">
                Type scale must stay between 0.85 and 1.25.
              </p>
            ) : null}
          </EditorSection>
        </div>

        <aside className="border-t bg-muted/20 p-5 lg:border-t-0 lg:border-l">
          <div className="space-y-5 lg:sticky lg:top-6">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Live preview
              </p>
              <h3 className="mt-1 text-sm font-medium text-foreground">
                Shape and type
              </h3>
            </div>

            <div className="space-y-3">
              <div
                className="border bg-card p-4"
                style={{ borderRadius: `${radiusBase}rem` }}
              >
                <p
                  className="font-semibold tracking-tight text-foreground"
                  style={{ fontSize: `${1.125 * typeScale}rem` }}
                >
                  Builder surface
                </p>
                <p
                  className="mt-2 max-w-sm text-muted-foreground"
                  style={{ fontSize: `${0.875 * typeScale}rem` }}
                >
                  The palette output stays central. Shape and typography tune
                  the surrounding interface.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[0.35, 0.75, 1.1].map((multiplier) => (
                    <span
                      key={multiplier}
                      className="border bg-background px-3 py-1 text-xs text-muted-foreground"
                      style={{
                        borderRadius: `${Math.max(radiusBase * multiplier, 0.125)}rem`,
                      }}
                    >
                      {multiplier === 0.35
                        ? "Small"
                        : multiplier === 0.75
                          ? "Medium"
                          : "Large"}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-md border bg-background p-3">
                <p
                  className="font-semibold text-foreground"
                  style={{ fontSize: `${1.25 * typeScale}rem` }}
                >
                  Heading sample
                </p>
                <p
                  className="mt-1 leading-6 text-muted-foreground"
                  style={{ fontSize: `${0.875 * typeScale}rem` }}
                >
                  Body text remains compact, legible, and predictable.
                </p>
                <p
                  className="mt-2 text-muted-foreground"
                  style={{ fontSize: `${0.75 * typeScale}rem` }}
                >
                  Small label sample
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function EditorSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="p-5">
      <div className="mb-4 max-w-2xl space-y-1">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function SeedInput({
  label,
  value,
  isValid,
  onChange,
}: {
  label: string
  value: string
  isValid: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)] md:items-end">
      <ColorPicker color={value} onChange={onChange} />
      <label className="min-w-0 space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <input
          aria-invalid={!isValid}
          className="h-9 w-full rounded-md border bg-background px-2.5 font-mono text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/25"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {!isValid ? (
          <p className="text-xs text-destructive">
            Enter OKLCH like oklch(0.62 0.14 48).
          </p>
        ) : null}
      </label>
    </div>
  )
}

function StepperControl({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}) {
  const formattedValue = Number.isFinite(value) ? value.toFixed(2) : "0.00"

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="inline-grid h-9 grid-cols-[2.25rem_minmax(5rem,1fr)_2.25rem] overflow-hidden rounded-md border bg-background">
        <button
          type="button"
          className="border-r text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={value <= min}
          onClick={() => onChange(value - step)}
        >
          -
        </button>
        <output className="flex min-w-0 items-center justify-center px-3 font-mono text-xs">
          {formattedValue}
          {suffix ? <span className="ml-1 text-muted-foreground">{suffix}</span> : null}
        </output>
        <button
          type="button"
          className="border-l text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          disabled={value >= max}
          onClick={() => onChange(value + step)}
        >
          +
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Range {min.toFixed(2)}-{max.toFixed(2)}
        {suffix ? suffix : ""}
      </p>
    </div>
  )
}

function normalizeThemeDraft(theme: ThemeRecord): ThemeRecord {
  return {
    ...theme,
    name: theme.name.trim(),
    seeds: {
      primary: normalizeOklch(theme.seeds.primary),
      accent: normalizeOklch(theme.seeds.accent),
    },
    updatedAt: new Date().toISOString(),
  }
}

function isThemeDirty(source: ThemeRecord, draft: ThemeRecord) {
  return (
    source.name !== draft.name ||
    (source.description ?? "") !== (draft.description ?? "") ||
    source.seeds.primary !== draft.seeds.primary ||
    source.seeds.accent !== draft.seeds.accent ||
    (source.radius?.base ?? DEFAULT_THEME_RECORD.radius?.base) !==
      (draft.radius?.base ?? DEFAULT_THEME_RECORD.radius?.base) ||
    (source.typography?.scale ?? DEFAULT_THEME_RECORD.typography?.scale) !==
      (draft.typography?.scale ?? DEFAULT_THEME_RECORD.typography?.scale) ||
    (source.fonts?.body ?? DEFAULT_THEME_FONTS.body) !==
      (draft.fonts?.body ?? DEFAULT_THEME_FONTS.body) ||
    (source.fonts?.heading ?? DEFAULT_THEME_FONTS.heading) !==
      (draft.fonts?.heading ?? DEFAULT_THEME_FONTS.heading)
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step
}

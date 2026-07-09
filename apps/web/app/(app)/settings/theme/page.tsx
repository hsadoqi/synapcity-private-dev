"use client"

import * as React from "react"

import {
  DEFAULT_THEME_RECORD,
  THEME_PALETTE_STEPS,
  ThemeScopeProvider,
  assignTheme,
  buildThemeVariables,
  createTheme,
  hexToOklch,
  isValidOklch,
  normalizeOklch,
  oklchToHex,
  removeAssignment,
  updateTheme,
  useThemeSnapshot,
  type ThemeRecord,
} from "@/modules/theme"

function getRootThemeId(
  assignments: ReturnType<typeof useThemeSnapshot>["assignments"]
) {
  return assignments.find(
    (assignment) =>
      assignment.scopeType === "root" && assignment.scopeId === "app"
  )?.themeId
}

export default function ThemeSettingsPage() {
  const { themes, assignments } = useThemeSnapshot()
  const rootThemeId = getRootThemeId(assignments)
  const didChooseThemeRef = React.useRef(false)
  const [selectedThemeId, setSelectedThemeId] = React.useState(
    rootThemeId ?? DEFAULT_THEME_RECORD.id
  )

  const selectedTheme =
    themes.find((theme) => theme.id === selectedThemeId) ??
    themes[0] ??
    DEFAULT_THEME_RECORD

  const [name, setName] = React.useState(selectedTheme.name)
  const [primaryOklch, setPrimaryOklch] = React.useState(
    selectedTheme.primaryOklch
  )
  const [accentOklch, setAccentOklch] = React.useState(
    selectedTheme.accentOklch
  )
  const [statusMessage, setStatusMessage] = React.useState("")

  React.useEffect(() => {
    let isCurrent = true

    function syncSelectedTheme(theme: ThemeRecord) {
      window.queueMicrotask(() => {
        if (!isCurrent) {
          return
        }

        setSelectedThemeId(theme.id)
        syncDraftFromTheme(theme)
      })
    }

    if (
      rootThemeId &&
      !didChooseThemeRef.current &&
      selectedThemeId !== rootThemeId
    ) {
      const rootTheme = themes.find((theme) => theme.id === rootThemeId)

      if (rootTheme) {
        syncSelectedTheme(rootTheme)
        return () => {
          isCurrent = false
        }
      }
    }

    if (themes.some((theme) => theme.id === selectedThemeId)) {
      return () => {
        isCurrent = false
      }
    }

    const fallbackTheme =
      themes.find((theme) => theme.id === rootThemeId) ??
      themes[0] ??
      DEFAULT_THEME_RECORD

    syncSelectedTheme(fallbackTheme)

    return () => {
      isCurrent = false
    }
  }, [rootThemeId, selectedThemeId, themes])

  const primaryIsValid = isValidOklch(primaryOklch)
  const accentIsValid = isValidOklch(accentOklch)
  const canSave = name.trim().length > 0 && primaryIsValid && accentIsValid

  const previewTheme = React.useMemo<ThemeRecord>(
    () => ({
      ...selectedTheme,
      name: name.trim() || selectedTheme.name,
      primaryOklch: primaryIsValid
        ? normalizeOklch(primaryOklch)
        : selectedTheme.primaryOklch,
      accentOklch: accentIsValid
        ? normalizeOklch(accentOklch)
        : selectedTheme.accentOklch,
    }),
    [
      accentIsValid,
      accentOklch,
      name,
      primaryIsValid,
      primaryOklch,
      selectedTheme,
    ]
  )

  const previewVars = React.useMemo(
    () =>
      buildThemeVariables(previewTheme.primaryOklch, previewTheme.accentOklch),
    [previewTheme.accentOklch, previewTheme.primaryOklch]
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    handleUpdateSelectedTheme()
  }

  function syncDraftFromTheme(theme: ThemeRecord) {
    setName(theme.name)
    setPrimaryOklch(theme.primaryOklch)
    setAccentOklch(theme.accentOklch)
  }

  function getThemeFromList(themeList: ThemeRecord[], themeId?: string) {
    return (
      themeList.find((theme) => theme.id === themeId) ??
      themeList[0] ??
      DEFAULT_THEME_RECORD
    )
  }

  function handleSelectTheme(nextThemeId: string) {
    const nextTheme = getThemeFromList(themes, nextThemeId)

    didChooseThemeRef.current = true
    setSelectedThemeId(nextTheme.id)
    syncDraftFromTheme(nextTheme)
    setStatusMessage("")
  }

  function handleCreateTheme() {
    if (!canSave) {
      return
    }

    const nextTheme = createTheme({
      name: name.trim(),
      primaryOklch,
      accentOklch,
      mode: "system",
    })

    didChooseThemeRef.current = true
    setSelectedThemeId(nextTheme.id)
    syncDraftFromTheme(nextTheme)
    setStatusMessage(`Created ${nextTheme.name}.`)
  }

  function handleUpdateSelectedTheme() {
    if (!canSave) {
      return
    }

    const nextTheme = updateTheme(selectedTheme, {
      name: name.trim(),
      primaryOklch,
      accentOklch,
      mode: selectedTheme.mode,
    })

    syncDraftFromTheme(nextTheme)
    setStatusMessage(`Updated ${nextTheme.name}.`)
  }

  function handleUseForApp() {
    assignTheme({
      scopeType: "root",
      scopeId: "app",
      themeId: selectedTheme.id,
    })
    setStatusMessage(`${selectedTheme.name} is assigned to the app root.`)
  }

  function handleInheritDefault() {
    removeAssignment("root", "app")
    handleSelectTheme(DEFAULT_THEME_RECORD.id)
    setStatusMessage("Root assignment removed.")
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Theme</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Palette generator
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Save OKLCH seed colors, generate Tailwind-style primary/accent shade
          scales, and assign a saved theme to the app root. Semantics stay in
          CSS; the runtime only writes palette variables.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_380px]">
        <ThemeScopeProvider
          scopeType="root"
          scopeId="theme-preview"
          theme={previewTheme}
          className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Previewing
              </p>
              <h2 className="text-xl font-semibold tracking-tight">
                {previewTheme.name}
              </h2>
            </div>
            <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              {rootThemeId === selectedTheme.id
                ? "Assigned to app"
                : "Preview only"}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <PalettePreview
              label="Primary"
              prefix="primary"
              vars={previewVars}
              selectedValue={normalizeOklch(primaryOklch)}
              onSelect={(value) => {
                setPrimaryOklch(value)
                setStatusMessage("")
              }}
            />
            <PalettePreview
              label="Accent"
              prefix="accent"
              vars={previewVars}
              selectedValue={normalizeOklch(accentOklch)}
              onSelect={(value) => {
                setAccentOklch(value)
                setStatusMessage("")
              }}
            />
          </div>

          <div className="grid gap-3 rounded-xl border border-border bg-background p-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Primary
              </p>
              <div className="mt-3 h-16 rounded-lg bg-primary" />
              <p className="mt-3 text-xs text-muted-foreground">bg-primary</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Accent
              </p>
              <div className="mt-3 h-16 rounded-lg bg-accent" />
              <p className="mt-3 text-xs text-muted-foreground">bg-accent</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Surface
              </p>
              <div className="mt-3 h-16 rounded-lg border border-border bg-background" />
              <p className="mt-3 text-xs text-muted-foreground">
                bg-background
              </p>
            </div>
          </div>
        </ThemeScopeProvider>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Saved theme</span>
            <select
              value={selectedThemeId}
              onChange={(event) => handleSelectTheme(event.target.value)}
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

          <ColorInput
            label="Primary OKLCH seed"
            name="primaryOklch"
            value={primaryOklch}
            isValid={primaryIsValid}
            onChange={(value) => {
              setPrimaryOklch(value)
              setStatusMessage("")
            }}
          />

          <ColorInput
            label="Accent OKLCH seed"
            name="accentOklch"
            value={accentOklch}
            isValid={accentIsValid}
            onChange={(value) => {
              setAccentOklch(value)
              setStatusMessage("")
            }}
          />

          <div className="grid gap-2">
            <button
              type="submit"
              disabled={!canSave}
              className="rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Update selected theme
            </button>
            <button
              type="button"
              onClick={handleCreateTheme}
              disabled={!canSave}
              className="rounded-full border border-border px-3 py-2 text-sm transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save as new preset
            </button>
            <button
              type="button"
              onClick={handleUseForApp}
              className="rounded-full border border-border px-3 py-2 text-sm transition hover:border-primary"
            >
              Use selected for app root
            </button>
            <button
              type="button"
              onClick={handleInheritDefault}
              className="rounded-full border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              Remove root assignment
            </button>
          </div>

          {statusMessage ? (
            <p className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              {statusMessage}
            </p>
          ) : null}

          <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Scope contract</div>
            <p className="mt-2">
              A scope with no explicit theme gets no generated vars and inherits
              through normal CSS cascade. <code>data-theme-id</code> is only the
              saved theme record id.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

function ColorInput({
  label,
  name,
  value,
  isValid,
  onChange,
}: {
  label: string
  name: string
  value: string
  isValid: boolean
  onChange: (value: string) => void
}) {
  const pickerValue = oklchToHex(value)
  const handlePickerValue = (nextHex: string) => {
    const nextValue = hexToOklch(nextHex)

    if (nextValue) {
      onChange(nextValue)
    }
  }

  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <div className="grid grid-cols-[44px_1fr] gap-2">
        <input
          type="color"
          value={pickerValue}
          onInput={(event) => handlePickerValue(event.currentTarget.value)}
          onChange={(event) => handlePickerValue(event.currentTarget.value)}
          className="h-10 w-11 cursor-pointer rounded-lg border border-border bg-background p-1"
          aria-label={`${label} color picker`}
        />
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs"
        />
      </div>
      {!isValid ? (
        <span className="text-xs text-destructive">
          Use OKLCH like <code>oklch(0.62 0.16 255)</code> or{" "}
          <code>oklch(62% 0.16 255)</code>.
        </span>
      ) : null}
    </label>
  )
}

function PalettePreview({
  label,
  prefix,
  vars,
  selectedValue,
  onSelect,
}: {
  label: string
  prefix: "primary" | "accent"
  vars: Record<string, string>
  selectedValue: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">50–950</div>
      </div>
      <div className="grid gap-2">
        {THEME_PALETTE_STEPS.map((step) => {
          const token = `--${prefix}-${step}`
          const value = vars[token]

          if (!value) {
            return null
          }

          return (
            <div
              key={step}
              className="grid grid-cols-[42px_1fr] items-center gap-3"
            >
              <div className="text-xs text-muted-foreground tabular-nums">
                {step}
              </div>
              <button
                type="button"
                onClick={() => onSelect(value)}
                className="overflow-hidden rounded-lg border border-border text-left transition hover:border-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-pressed={selectedValue === value}
                aria-label={`Use ${label.toLowerCase()} ${step} as ${label.toLowerCase()} seed`}
              >
                <span
                  className="block h-8"
                  style={{ backgroundColor: `var(${token})` }}
                  title={`${token}: ${value}`}
                />
                <div className="truncate bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  {value}
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

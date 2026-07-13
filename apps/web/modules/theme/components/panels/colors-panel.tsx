import * as React from "react"

import { ColorPickerCard } from "../display/color-picker-card"
import { ThemeFormData } from "../form-components/theme-form-popover"
import { Sun, Moon } from "lucide-react"

export function ColorsPanel({
  defaultFormData,
  formData,
  onChange,
}: {
  defaultFormData: ThemeFormData
  formData: ThemeFormData
  onChange: <K extends keyof ThemeFormData>(
    field: K,
    value: ThemeFormData[K]
  ) => void
}) {
  const hasAccent = Boolean(formData.accentColor)

  return (
    <>
      <div className="space-y-2 pt-1">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Dark Mode
        </span>
        <DarkModeOptions
          value={formData.darkMode}
          onChange={(isDark) => onChange("darkMode", isDark)}
        />
      </div>
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Primary
      </span>
      <ColorPickerCard
        label="Primary"
        formData={formData.primaryColor}
        onChange={(color) => onChange("primaryColor", color)}
        hideLabel
        defaultFormData={defaultFormData.primaryColor}
      />

      {hasAccent ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Accent
            </span>
            <button
              type="button"
              onClick={() => onChange("accentColor", undefined)}
              className="rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Remove
            </button>
          </div>
          <ColorPickerCard
            label="Accent"
            formData={
              formData.accentColor ??
              defaultFormData.accentColor ??
              defaultFormData.primaryColor
            }
            defaultFormData={
              defaultFormData.accentColor ?? defaultFormData.primaryColor
            }
            hideLabel
            onChange={(color) => onChange("accentColor", color)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            onChange(
              "accentColor",
              defaultFormData.accentColor ?? defaultFormData.primaryColor
            )
          }
          className="w-full rounded border border-border bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Add accent
        </button>
      )}
    </>
  )
}

export function DarkModeOptions({
  value,
  onChange,
}: {
  value: boolean
  onChange: (isDark: boolean) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Appearance">
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => onChange(false)}
        className={`rounded border px-3 py-3 text-sm font-medium transition-all ${
          !value
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-muted"
        }`}
      >
        <Sun className="mx-auto mb-1 h-4 w-4" />
        Light
      </button>

      <button
        type="button"
        aria-pressed={value}
        onClick={() => onChange(true)}
        className={`rounded border px-3 py-3 text-sm font-medium transition-all ${
          value
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-muted"
        }`}
      >
        <Moon className="mx-auto mb-1 h-4 w-4" />
        Dark
      </button>
    </div>
  )
}

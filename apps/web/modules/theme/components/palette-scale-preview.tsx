"use client"

import { useMemo } from "react"

import { PALETTE_STEPS } from "../constants"
import { generatePalette } from "../engine/generate-palette"
import { ColorPicker } from "./color-picker"
import { ThemeSwatch } from "./theme-swatch"

type PaletteScalePreviewProps = {
  label: string
  description?: string
  seed: string
  variablePrefix: "--primary" | "--accent"
  onSeedChange?: (seed: string) => void
  readOnly?: boolean
  compact?: boolean
}

export function PaletteScalePreview({
  label,
  description,
  seed,
  variablePrefix,
  onSeedChange,
  readOnly = false,
  compact = false,
}: PaletteScalePreviewProps) {
  const palette = useMemo(() => generatePalette(seed), [seed])

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex min-w-0 items-start gap-3">
        {!readOnly && onSeedChange ? (
          <ColorPicker color={seed} onChange={onSeedChange} />
        ) : (
          <span
            aria-hidden="true"
            className="mt-0.5 size-8 shrink-0 rounded-md border"
            style={{ backgroundColor: seed }}
          />
        )}
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          {description ? (
            <p className="text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
          <p className="break-all font-mono text-[11px] text-muted-foreground">
            Seed: {seed}
          </p>
        </div>
      </div>

      <div
        className={
          compact
            ? "grid grid-cols-4 gap-2 min-[420px]:grid-cols-6 sm:grid-cols-6"
            : "grid grid-cols-4 gap-2 min-[420px]:grid-cols-6 md:grid-cols-11"
        }
      >
        {PALETTE_STEPS.map((step) => (
          <ThemeSwatch
            key={step}
            step={step}
            value={palette[step]}
            variableName={`${variablePrefix}-${step}`}
          />
        ))}
      </div>
    </section>
  )
}

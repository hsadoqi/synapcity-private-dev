"use client"

import { useMemo } from "react"

import { PALETTE_STEPS } from "../constants"
import { generatePalette } from "../engine/generate-palette"
import { ColorPicker } from "./color-picker"
import { ThemeSwatch } from "./theme-swatch"

type PaletteScalePreviewProps = {
  label: string
  seed: string
  onSeedChange: (seed: string) => void
}

export function PaletteScalePreview({
  label,
  seed,
  onSeedChange,
}: PaletteScalePreviewProps) {
  const palette = useMemo(() => generatePalette(seed), [seed])

  return (
    <section className="space-y-3">
      <div className="flex gap-2">
        <ColorPicker color={seed} onChange={onSeedChange} />
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground">Seed: {seed}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {PALETTE_STEPS.map((step) => (
          <ThemeSwatch key={step} step={step} value={palette[step]} />
        ))}
      </div>
    </section>
  )
}

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@workspace/ui/components/primitives/tooltip"
import { parseOklch } from "../engine/oklch"
import type { PaletteStep } from "../types"

type ThemeSwatchProps = {
  step: PaletteStep
  value: string
}

export function ThemeSwatch({ step, value }: ThemeSwatchProps) {
  const labelColor = getStepLabelColor(value)

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`Palette step ${step}: ${value}`}
        className="relative size-12 min-w-0 overflow-hidden rounded-lg border bg-card"
      >
        <span className="absolute inset-0" style={{ background: value }} />
        <span
          className="relative flex size-full items-center justify-center text-base font-medium"
          style={{ color: labelColor }}
        >
          {step}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className="truncate font-semibold">{value}</span>
      </TooltipContent>
    </Tooltip>
  )
}

function getStepLabelColor(background: string) {
  const color = parseOklch(background)

  if (!color) return "var(--foreground)"

  return color.l >= 0.58 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)"
}

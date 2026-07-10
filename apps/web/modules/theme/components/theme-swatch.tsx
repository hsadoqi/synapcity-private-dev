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
  variableName: string
}

export function ThemeSwatch({ step, value, variableName }: ThemeSwatchProps) {
  const labelColor = getStepLabelColor(value)

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`${variableName}: ${value}`}
        className="group relative h-16 min-w-0 overflow-hidden rounded-md border bg-card text-left focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="absolute inset-0" style={{ background: value }} />
        <span
          className="relative flex size-full flex-col justify-between p-1.5 text-[10px] font-medium"
          style={{ color: labelColor }}
        >
          <span>{step}</span>
          <span className="truncate font-mono opacity-80">{variableName}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className="font-mono text-xs">
          {variableName}: {value}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

function getStepLabelColor(background: string) {
  const color = parseOklch(background)

  if (!color) return "var(--foreground)"

  return color.l >= 0.58 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)"
}

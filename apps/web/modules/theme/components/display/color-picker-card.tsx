"use client"

import * as React from "react"
import { ChevronDown, Pipette } from "lucide-react"
import {
  normalizeHex,
  hexToRgb,
  hexToOklch,
  generateOklchShades,
  formatOklch,
} from "@/modules/theme/color-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/primitives/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

interface ColorPickerCardProps {
  label: string
  formData: string
  onChange: (value: string) => void
  hideLabel?: boolean
  preset?: readonly string[]
  defaultFormData: string
}

export function ColorPickerCard({
  label,
  formData: value,
  onChange,
  hideLabel = false,
  preset = DEFAULT_COLOR_PRESETS,
  defaultFormData,
}: ColorPickerCardProps) {
  const inputId = React.useId()
  const normalizedValue =
    normalizeHex(value) ?? normalizeHex(defaultFormData) ?? "#3B82F6"
  const [hexDraftState, setHexDraftState] = React.useState(() => ({
    sourceValue: normalizedValue,
    value: normalizedValue,
  }))
  const hexDraft =
    hexDraftState.sourceValue === normalizedValue
      ? hexDraftState.value
      : normalizedValue

  const setHexDraft = (nextValue: string) => {
    setHexDraftState({
      sourceValue: normalizedValue,
      value: nextValue,
    })
  }

  const colorData = React.useMemo(() => {
    const rgb = hexToRgb(normalizedValue)
    const oklch = hexToOklch(normalizedValue)
    const shades = generateOklchShades(normalizedValue)

    return {
      rgb,
      oklch,
      shades,
    }
  }, [normalizedValue])

  const commitHexValue = () => {
    const nextValue = normalizeHex(hexDraft)

    if (!nextValue) {
      setHexDraft(normalizedValue)
      return
    }

    setHexDraft(nextValue)
    onChange(nextValue)
  }

  const handleHexInputChange = (nextValue: string) => {
    const formattedValue = nextValue.startsWith("#")
      ? nextValue
      : `#${nextValue}`

    setHexDraft(formattedValue)

    const normalized = normalizeHex(formattedValue)

    if (normalized) {
      onChange(normalized)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-2",
        !hideLabel && "rounded-lg border border-border bg-card p-4"
      )}
    >
      {!hideLabel && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <label
            htmlFor={inputId}
            className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {label}
          </label>

          <Pipette aria-hidden="true" className="size-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-card p-1 shadow-sm">
          <input
            id={inputId}
            type="color"
            value={normalizedValue}
            onChange={(event) => {
              const nextValue = event.target.value.toUpperCase()

              setHexDraft(nextValue)
              onChange(nextValue)
            }}
            className="size-12 cursor-pointer rounded-md border-0 bg-transparent p-0"
            aria-label={`Choose ${label} color`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={hexDraft}
            onChange={(event) => handleHexInputChange(event.target.value)}
            onBlur={commitHexValue}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitHexValue()
                event.currentTarget.blur()
              }

              if (event.key === "Escape") {
                setHexDraft(normalizedValue)
                event.currentTarget.blur()
              }
            }}
            maxLength={7}
            spellCheck={false}
            aria-label={`${label} hexadecimal value`}
            className="w-full border-0 bg-transparent p-0 font-mono text-sm font-medium text-foreground uppercase outline-none"
          />

          <div className="mt-1 font-mono text-xs text-muted-foreground">
            rgb({colorData.rgb.r} {colorData.rgb.g} {colorData.rgb.b})
          </div>

          <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
            {formatOklch(colorData.oklch)}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          Generated shades
        </div>

        <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
          {colorData.shades.map((shade) => (
            <button
              key={shade.name}
              type="button"
              onClick={() => onChange(shade.hex)}
              aria-pressed={shade.hex === normalizedValue}
              className="group min-w-0 text-center focus-visible:outline-none"
              aria-label={`Select shade ${shade.name}, ${shade.hex}`}
              title={`${shade.name}: ${shade.hex}\n${formatOklch(shade.oklch)}`}
            >
              <span
                className="block aspect-square w-full rounded-md border border-black/10 shadow-sm transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2"
                style={{ backgroundColor: shade.hex }}
              />

              <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                {shade.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ColorPresets
        activeValue={normalizedValue}
        presets={preset}
        onChange={onChange}
        className="items-end justify-center"
      />
    </div>
  )
}

export function ColorPresets({
  activeValue,
  presets,
  onChange,
  className,
}: {
  activeValue?: string
  presets: readonly string[]
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <DropdownMenu>
      <div className={cn("w-full", className)}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Presets
            <ChevronDown aria-hidden="true" className="size-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          aria-label="Preset colors"
          className="w-56 rounded-lg border border-border p-2 shadow-lg"
        >
          <DropdownMenuGroup className="grid grid-cols-6 gap-1.5">
            {presets.map((color) => {
              const normalizedPreset = normalizeHex(color)

              if (!normalizedPreset) {
                return null
              }

              const isSelected =
                normalizedPreset.toLowerCase() === activeValue?.toLowerCase()

              return (
                <DropdownMenuItem
                  key={normalizedPreset}
                  onSelect={() => onChange(normalizedPreset)}
                  className={cn(
                    "size-8 cursor-pointer rounded-md border border-black/10 p-0 shadow-sm focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isSelected && "ring-2 ring-ring ring-offset-2"
                  )}
                  style={{ backgroundColor: normalizedPreset }}
                  aria-label={`Select ${normalizedPreset}`}
                >
                  {isSelected ? <span className="sr-only">Selected</span> : null}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  )
}

const DEFAULT_COLOR_PRESETS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
] as const

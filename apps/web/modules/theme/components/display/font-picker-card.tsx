"use client"

import * as React from "react"
import { Check, ChevronDown, Minus, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/primitives/dropdown-menu"

import type { ThemeFormData } from "../form-components/theme-form-popover"
import { FONT_OPTIONS } from "../../constants"
import { FontField, FontOption } from "../../types"


interface FontPickerCardProps {
  data: ThemeFormData
  defaultData: ThemeFormData
  onChange: <K extends keyof ThemeFormData>(
    field: K,
    value: ThemeFormData[K]
  ) => void
}

export function FontPickerCard({
  data,
  onChange,
  defaultData,
}: FontPickerCardProps) {
  const [openField, setOpenField] = React.useState<FontField | null>(null)

  const headingValue =
    data.headingFont || defaultData.headingFont || FONT_OPTIONS[0].value

  const bodyValue =
    data.bodyFont || defaultData.bodyFont || FONT_OPTIONS[0].value

  const headingFont = findFontOption(headingValue)
  const bodyFont = findFontOption(bodyValue)

  const handleSelect = (field: FontField, value: string) => {
    onChange(field, value)
    setOpenField(null)
  }

  return (
    <div className="space-y-4">
      <FontPreview
        body={bodyFont.value}
        heading={headingFont.value}
        baseTextScale={data.textScale ?? defaultData.textScale}
      />
      <FontSelect
        label="Heading"
        field="headingFont"
        selectedFont={headingFont}
        selectedValue={headingValue}
        isOpen={openField === "headingFont"}
        onOpenChange={(open) => setOpenField(open ? "headingFont" : null)}
        onSelect={handleSelect}
      />

      <FontSelect
        label="Body"
        field="bodyFont"
        selectedFont={bodyFont}
        selectedValue={bodyValue}
        isOpen={openField === "bodyFont"}
        onOpenChange={(open) => setOpenField(open ? "bodyFont" : null)}
        onSelect={handleSelect}
      />
      <StepperCard
        label="Type Scale"
        value={data.textScale ?? defaultData.textScale}
        onChange={(value) => onChange("textScale", value)}
        min={1}
        max={1.5}
        step={0.025}
        unit="×"
      />
    </div>
  )
}

interface FontSelectProps {
  label: string
  field: FontField
  selectedFont: FontOption
  selectedValue: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (field: FontField, value: string) => void
}

function FontSelect({
  label,
  field,
  selectedFont,
  selectedValue,
  isOpen,
  onOpenChange,
  onSelect,
}: FontSelectProps) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>

      <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${label} font`}
            className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            style={{ fontFamily: selectedFont.fontFamily }}
          >
            <span>{selectedFont.label}</span>

            <ChevronDown
              aria-hidden="true"
              className={`size-4 text-muted-foreground transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          aria-label={`${label} font options`}
          className="rounded-lg border border-border p-1 shadow-lg"
        >
          {FONT_OPTIONS.map((font) => {
            const isSelected = selectedValue === font.value

            return (
              <DropdownMenuItem
                key={font.value}
                onSelect={() => onSelect(field, font.value)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-popover-foreground hover:bg-muted"
                }`}
                style={{ fontFamily: font.fontFamily }}
              >
                <span>{font.label}</span>

                {isSelected ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function findFontOption(value: string): FontOption {
  return FONT_OPTIONS.find((font) => font.value === value) ?? FONT_OPTIONS[0]
}

const FontPreview = ({ heading, body, baseTextScale }: { heading: string; body: string; baseTextScale: number }) => (
  <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 truncate">
    <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
      Preview
    </p>

    <h3
      className="text-lg leading-tight font-semibold text-foreground"
      style={{ fontFamily: heading, fontSize: `calc(1.25rem * ${baseTextScale})`, lineHeight: `calc(1.75rem * ${baseTextScale})` }}
    >
      The quick brown fox jumps
    </h3>

    <p
      className="mt-2 text-sm leading-relaxed text-foreground"
      style={{
        fontFamily: body,
        fontSize: `calc(0.875rem * ${baseTextScale})`,
      }}
    >
      The quick brown fox jumps over the lazy dog.
    </p>

    <p
      className="mt-2 text-xs break-all text-muted-foreground"
      style={{
        fontFamily: body,
        fontSize: `calc(0.75rem * ${baseTextScale})`,
      }}
    >
      ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
    </p>
  </div>
)


interface StepperCardProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}

export function StepperCard({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: StepperCardProps) {
  const handleIncrement = () => {
    if (value < max) onChange(roundToStep(Math.min(value + step, max), step))
  }

  const handleDecrement = () => {
    if (value > min) onChange(roundToStep(Math.max(value - step, min), step))
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="space-y-4">
        {/* Value display and controls */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="p-2 rounded border border-border bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Decrease ${label}`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-foreground">
              {value}
              <span className="text-xs text-muted-foreground ml-1">{unit}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {min} to {max}
            </div>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="p-2 rounded border border-border bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Increase ${label}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <input
          aria-label={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
    </div>
  )
}

function roundToStep(value: number, step: number): number {
  const precision = Math.max(0, (step.toString().split(".")[1] ?? "").length)
  return Number(value.toFixed(precision))
}

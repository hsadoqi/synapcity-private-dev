"use client"

import * as React from "react"
import { CornerDownRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface BorderRadiusCardProps {
  value: number
  onChange: (value: number) => void
  showCard?: boolean
}

const PRESETS = [
  { label: "none", value: 0 },
  { label: "xs", value: 4 },
  { label: "sm", value: 8 },
  { label: "md", value: 10 },
  { label: "lg", value: 12 },
  { label: "xl", value: 14 },
  { label: "full", value: 999 },
]

const MAX_SLIDER_RADIUS = 14
export function BorderRadiusCard({
  value,
  onChange,
  showCard = true,
}: BorderRadiusCardProps) {
  return (
    <div
      className={cn(
        showCard && "rounded-lg border border-border p-4"
      )}
    >
      {showCard && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Border Radius
          </label>
          <CornerDownRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-center gap-4 rounded bg-muted/30 p-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-10 bg-linear-to-br from-primary to-accent transition-all duration-300"
              style={{ borderRadius: `${value}px` }}
            />
          ))}
        </div>

        <div>
          <input
            aria-label="Border Radius"
            type="range"
            min="0"
            max={MAX_SLIDER_RADIUS}
            value={Math.min(value, MAX_SLIDER_RADIUS)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-primary"
          />
          <div className="mt-2 flex justify-between">
            <span className="text-xs text-muted-foreground">0px</span>
            <span className="font-mono text-xs font-medium text-foreground">
              {value === 999 ? "Full" : `${value}px`}
            </span>
            <span className="text-xs text-muted-foreground">14px</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-pressed={value === preset.value}
              onClick={() => onChange(preset.value)}
              className={`rounded px-2 py-2 text-xs font-medium transition-all ${
                value === preset.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

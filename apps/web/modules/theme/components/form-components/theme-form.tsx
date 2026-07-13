"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface ThemeFormData {
  name: string
  description: string
  primaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  textScale: number
  darkMode: boolean
  borderRadius: number
}

interface ThemeFormProps {
  onSubmit?: (data: ThemeFormData) => void
  initialData?: Partial<ThemeFormData>
  compact?: boolean
}

export function ThemeForm({
  onSubmit,
  initialData,
  compact = false,
}: ThemeFormProps) {
  const [formData, setFormData] = useState<ThemeFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    primaryColor: initialData?.primaryColor || "#3B82F6",
    accentColor: initialData?.accentColor || "#06B6D4",
    headingFont: initialData?.headingFont || "Inter",
    bodyFont: initialData?.bodyFont || "Inter",
    textScale: initialData?.textScale || 1.125,
    darkMode: initialData?.darkMode || false,
    borderRadius: initialData?.borderRadius || 8,
  })

  const handleChange = <K extends keyof ThemeFormData>(
    field: K,
    value: ThemeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const fonts = ["Inter", "System", "Georgia", "Courier", "Trebuchet MS"]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Theme Name
          </label>
          <input
            type="text"
            placeholder="My Brand Theme"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Description
          </label>
          <textarea
            placeholder="Describe your theme..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={compact ? 2 : 3}
            className="mt-1.5 w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="border-t border-border pt-2">
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
          Colors
        </h3>
        <div className={compact ? "space-y-2.5" : "space-y-3"}>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Primary
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-border"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="flex-1 rounded-md border border-border bg-input px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Accent
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-border"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="flex-1 rounded-md border border-border bg-input px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="border-t border-border pt-2">
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
          Typography
        </h3>
        <div className={compact ? "space-y-2.5" : "space-y-3"}>
          <div>
            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Heading Font
            </label>
            <div className="relative mt-1.5">
              <select
                value={formData.headingFont}
                onChange={(e) => handleChange("headingFont", e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-md border border-border bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none"
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Body Font
            </label>
            <div className="relative mt-1.5">
              <select
                value={formData.bodyFont}
                onChange={(e) => handleChange("bodyFont", e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-md border border-border bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 focus:outline-none"
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Text Scale: {formData.textScale.toFixed(3)}
            </label>
            <input
              type="range"
              min="1"
              max="1.25"
              step="0.025"
              value={formData.textScale}
              onChange={(e) =>
                handleChange("textScale", parseFloat(e.target.value))
              }
              className="mt-1.5 w-full"
            />
            <div className="mt-1 text-xs text-muted-foreground">1.0 — 1.25</div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="border-t border-border pt-2">
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
          Appearance
        </h3>
        <div className={compact ? "space-y-2.5" : "space-y-3"}>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Border Radius
              </label>
              <span className="rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">
                {formData.borderRadius}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={formData.borderRadius}
              onChange={(e) =>
                handleChange("borderRadius", parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted p-3">
            <label className="text-xs font-medium text-foreground">
              Dark Mode
            </label>
            <button
              type="button"
              onClick={() => handleChange("darkMode", !formData.darkMode)}
              className={`relative h-6 w-10 rounded-full transition-colors ${
                formData.darkMode ? "bg-primary" : "bg-muted-foreground/20"
              }`}
            >
              <div
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  formData.darkMode ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`flex gap-2 border-t border-border pt-2 ${compact ? "flex-col" : ""}`}
      >
        <button
          type="submit"
          className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Save Theme
        </button>
        <button
          type="button"
          className="flex-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

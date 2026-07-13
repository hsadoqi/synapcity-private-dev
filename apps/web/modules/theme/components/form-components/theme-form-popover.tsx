"use client"

import * as React from "react"
import { X } from "lucide-react"

import { hexToOklch } from "@/modules/theme/color-utils"
import { buildThemeVariables } from "@/modules/theme/theme-engine"
import { FONT_OPTIONS } from "@/modules/theme/constants"
import { ColorsPanel } from "../panels/colors-panel"
import { IdentityPanel } from "../panels/identity-panel"
import { DesignPanel } from "../panels/design-panel"
import { FontPanel } from "../panels/font-panel"

export interface ThemeFormData {
  primaryColor: string
  accentColor?: string
  headingFont: string
  bodyFont: string
  textScale: number
  darkMode: boolean
  borderRadius: number
  name: string
  description: string
}

interface ThemeFormPopoverProps {
  onClose: () => void
  onSubmit?: (data: ThemeFormData) => void
  initialDarkMode?: boolean
}

type PopoverTab = "colors" | "font" | "design" | "identity"

const DEFAULT_FORM_DATA: ThemeFormData = {
  primaryColor: "#3B82F6",
  accentColor: undefined,
  headingFont: "Inter",
  bodyFont: "Inter",
  textScale: 1.125,
  darkMode: false,
  borderRadius: 8,
  name: "",
  description: "",
}

const POPOVER_TABS = [
  { id: "colors", label: "Colors" },
  { id: "font", label: "Font" },
  // { id: "type", label: "Type" },
  { id: "design", label: "Design" },
  { id: "identity", label: "Info" },
] as const satisfies ReadonlyArray<{ id: PopoverTab; label: string }>

export function ThemeFormPopover({
  onClose,
  onSubmit,
  initialDarkMode = false,
}: ThemeFormPopoverProps) {
  const [activeTab, setActiveTab] = React.useState<PopoverTab>("colors")
  const [formData, setFormData] = React.useState<ThemeFormData>(() => ({
    ...DEFAULT_FORM_DATA,
    darkMode: initialDarkMode,
  }))
  const committedRef = React.useRef(false)

  React.useEffect(() => {
    const target = document.documentElement
    const originalDarkMode = target.classList.contains("dark")
    const variableNames = Object.keys(
      buildThemeVariables(
        hexToOklchCss(DEFAULT_FORM_DATA.primaryColor),
        hexToOklchCss(DEFAULT_FORM_DATA.primaryColor)
      )
    )
    variableNames.push(
      "--radius",
      "--radius-base",
      "--type-scale",
      "--font-heading",
      "--font-sans"
    )
    const originalValues = new Map(
      variableNames.map((name) => [name, target.style.getPropertyValue(name)])
    )
    return () => {
      if (committedRef.current) {
        return
      }

      originalValues.forEach((value, name) => {
        if (value) {
          target.style.setProperty(name, value)
        } else {
          target.style.removeProperty(name)
        }
      })
      target.classList.toggle("dark", originalDarkMode)
    }
  }, [])

  React.useEffect(() => {
    const variables = buildThemeVariables(
      hexToOklchCss(formData.primaryColor),
      hexToOklchCss(formData.accentColor ?? formData.primaryColor)
    )

    Object.entries(variables).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value)
    })
  }, [formData.primaryColor, formData.accentColor])

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", formData.darkMode)
  }, [formData.darkMode])

  React.useEffect(() => {
    const radius = `${formData.borderRadius / 16}rem`
    document.documentElement.style.setProperty("--radius", radius)
    document.documentElement.style.setProperty("--radius-base", radius)
  }, [formData.borderRadius])

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--type-scale",
      String(formData.textScale)
    )
  }, [formData.textScale])

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-heading",
      getFontFamily(formData.headingFont)
    )
    document.documentElement.style.setProperty(
      "--font-sans",
      getFontFamily(formData.bodyFont)
    )
  }, [formData.bodyFont, formData.headingFont])

  const handleChange = <K extends keyof ThemeFormData>(
    field: K,
    value: ThemeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    })
    committedRef.current = true
    onClose()
  }

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number | undefined

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % POPOVER_TABS.length
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + POPOVER_TABS.length) % POPOVER_TABS.length
    } else if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = POPOVER_TABS.length - 1
    }

    if (nextIndex === undefined) {
      return
    }

    event.preventDefault()
    const nextTab = POPOVER_TABS[nextIndex]
    if (!nextTab) {
      return
    }

    setActiveTab(nextTab.id)
    document.getElementById(`${nextTab.id}-tab`)?.focus()
  }

  return (
    <div className="flex min-h-0 flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Theme Editor
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close theme editor"
          className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Theme editor sections"
        className="flex border-b border-border bg-muted/20 px-3"
      >
        {POPOVER_TABS.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${tab.id}-tab`}
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={`border-b-2 px-2.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none ${
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3"
      >
        {activeTab === "colors" ? (
          <ColorsPanel
            formData={formData}
            onChange={handleChange}
            defaultFormData={DEFAULT_FORM_DATA}
          />
        ) : null}

        {activeTab === "design" ? (
          <DesignPanel formData={formData} onChange={handleChange} />
        ) : null}

        {activeTab === "identity" ? (
          <IdentityPanel formData={formData} onChange={handleChange} />
        ) : null}

        {activeTab === "font" ? (
          <FontPanel
            formData={formData}
            onChange={handleChange}
            defaultFormData={DEFAULT_FORM_DATA}
          />
        ) : null}

        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

function hexToOklchCss(value: string): string {
  const color = hexToOklch(value)

  return `oklch(${color.l.toFixed(4)} ${color.c.toFixed(4)} ${color.h.toFixed(2)})`
}

function getFontFamily(value: string): string {
  return (
    FONT_OPTIONS.find((option) => option.value === value)?.fontFamily ??
    FONT_OPTIONS[0].fontFamily
  )
}

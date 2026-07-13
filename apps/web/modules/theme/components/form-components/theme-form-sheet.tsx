"use client"

import * as React from "react"

import { hexToOklch } from "@/modules/theme/color-utils"
import { FONT_OPTIONS } from "@/modules/theme/constants"
import { buildThemeVariables } from "@/modules/theme/theme-engine"
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/primitives/sheet"

import { ColorsPanel, DesignPanel, FontPanel } from "../panels"
import { ThemeFormSectionHeader } from "./theme-form-section-header"
import { CornerDownRight, Pipette, Type } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator,
} from "@workspace/ui/components"

interface ThemeFormData {
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

interface ThemeFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: ThemeFormData) => void
  initialDarkMode?: boolean
}

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

export function ThemeFormSheet({
  isOpen,
  onClose,
  onSubmit,
  initialDarkMode = false,
}: ThemeFormSheetProps) {
  const [step, setStep] = React.useState<"design" | "identity">("design")
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
      if (committedRef.current) return

      originalValues.forEach((value, name) => {
        if (value) target.style.setProperty(name, value)
        else target.style.removeProperty(name)
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
  }, [formData.accentColor, formData.primaryColor])

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
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step === "design") {
      setStep("identity")
      return
    }

    onSubmit?.({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    })
    committedRef.current = true
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="border-b border-border pr-10">
        <SheetTitle>Theme Builder</SheetTitle>
        <SheetDescription>{""}</SheetDescription>
      </SheetHeader>

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-y-auto px-5 py-4"
      >
        {step === "design" ? (
          <div className="flex flex-col gap-4">
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <ThemeFormSectionHeader label="Colors" icon={Pipette} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ColorsPanel
                  formData={formData}
                  onChange={handleChange}
                  defaultFormData={DEFAULT_FORM_DATA}
                />
              </CollapsibleContent>
            </Collapsible>
            <Separator orientation="horizontal" />
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <ThemeFormSectionHeader label="Typography" icon={Type} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <FontPanel
                  label="Typography"
                  formData={formData}
                  hideLabel={false}
                  onChange={handleChange}
                  defaultFormData={DEFAULT_FORM_DATA}
                />
              </CollapsibleContent>
            </Collapsible>
            <Separator orientation="horizontal" />
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <ThemeFormSectionHeader label="Shape" icon={CornerDownRight} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <DesignPanel formData={formData} onChange={handleChange} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Theme Name
              <input
                type="text"
                placeholder="My Amazing Theme"
                value={formData.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className="mt-1.5 w-full rounded border border-border bg-input px-3 py-2 text-sm text-foreground normal-case focus:ring-2 focus:ring-ring/50 focus:outline-none"
                autoFocus
              />
            </label>

            <label className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Description
              <textarea
                placeholder="Describe your theme's purpose and style..."
                value={formData.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows={4}
                className="mt-1.5 w-full resize-none rounded border border-border bg-input px-3 py-2 text-sm text-foreground normal-case focus:ring-2 focus:ring-ring/50 focus:outline-none"
              />
            </label>
          </div>
        )}

        <div className="mt-6 flex gap-2 border-t border-border pt-6">
          {step === "identity" ? (
            <button
              type="button"
              onClick={() => setStep("design")}
              className="flex-1 rounded bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className={`${step === "design" ? "flex-1" : ""} rounded bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {step === "design" ? "Next" : "Apply"}
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

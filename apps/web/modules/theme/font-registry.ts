import type { ThemeFontId } from "./types"

export type ThemeFontRole = "body" | "heading"

type ThemeFontDefinition = {
  id: ThemeFontId
  label: string
  cssValue: string
  roles: ThemeFontRole[]
}

export const THEME_FONT_REGISTRY = [
  {
    id: "inter",
    label: "Inter",
    cssValue: "var(--font-family-inter)",
    roles: ["body", "heading"],
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    cssValue: "var(--font-family-space-grotesk)",
    roles: ["body", "heading"],
  },
  {
    id: "system",
    label: "System UI",
    cssValue:
      "ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji",
    roles: ["body", "heading"],
  },
] as const satisfies ThemeFontDefinition[]

export const DEFAULT_THEME_FONTS = {
  body: "inter",
  heading: "space-grotesk",
} as const satisfies Record<ThemeFontRole, ThemeFontId>

export function getThemeFontOptions(role: ThemeFontRole) {
  return THEME_FONT_REGISTRY.filter((font) => font.roles.includes(role))
}

export function isThemeFontId(value: unknown): value is ThemeFontId {
  return (
    typeof value === "string" &&
    THEME_FONT_REGISTRY.some((font) => font.id === value)
  )
}

export function resolveThemeFontValue(
  value: ThemeFontId | undefined,
  fallback: ThemeFontId
) {
  const fontId = isThemeFontId(value) ? value : fallback
  return (
    THEME_FONT_REGISTRY.find((font) => font.id === fontId)?.cssValue ??
    THEME_FONT_REGISTRY.find((font) => font.id === fallback)?.cssValue ??
    "ui-sans-serif, system-ui, sans-serif"
  )
}

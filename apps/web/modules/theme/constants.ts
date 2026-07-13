import { FontOption, ShadeName } from "./types"

export const SHADE_LIGHTNESS: Record<ShadeName, number> = {
    50: 0.97,
    100: 0.93,
    200: 0.86,
    300: 0.77,
    400: 0.68,
    500: 0.59,
    600: 0.51,
    700: 0.43,
    800: 0.35,
    900: 0.27,
    950: 0.2,
}

export const SHADE_NAMES = Object.keys(SHADE_LIGHTNESS).map(Number) as ShadeName[]

export const FONT_OPTIONS = [
    {
        label: "System",
        value: "system-ui",
        fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    {
        label: "Inter",
        value: "Inter",
        fontFamily: "Inter, system-ui, sans-serif",
    },
    {
        label: "Mono",
        value: "monospace",
        fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    {
        label: "Georgia",
        value: "Georgia",
        fontFamily: "Georgia, 'Times New Roman', serif",
    },
    {
        label: "Trebuchet",
        value: "Trebuchet MS",
        fontFamily: "'Trebuchet MS', Arial, sans-serif",
    },
    {
        label: "Comic Sans",
        value: "Comic Sans MS",
        fontFamily: "'Comic Sans MS', cursive",
    },
] as const satisfies ReadonlyArray<FontOption>
import { SHADE_NAMES, SHADE_LIGHTNESS } from "./constants";
import { RGBColor, OKLCHColor, ColorShade } from "./types";

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6
                break
            case g:
                h = ((b - r) / d + 2) / 6
                break
            case b:
                h = ((r - g) / d + 4) / 6
                break
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
}

export function hslToHex(h: number, s: number, l: number): string {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    let r = 0
    let g = 0
    let b = 0

    if (h >= 0 && h < 60) {
        r = c
        g = x
        b = 0
    } else if (h >= 60 && h < 120) {
        r = x
        g = c
        b = 0
    } else if (h >= 120 && h < 180) {
        r = 0
        g = c
        b = x
    } else if (h >= 180 && h < 240) {
        r = 0
        g = x
        b = c
    } else if (h >= 240 && h < 300) {
        r = x
        g = 0
        b = c
    } else if (h >= 300 && h < 360) {
        r = c
        g = 0
        b = x
    }

    const toHex = (val: number) => {
        const hex = Math.round((val + m) * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function generateColorShades(hexColor: string, count: number = 9) {
    const { h, s } = hexToHSL(hexColor)
    const shades = []

    for (let i = 0; i < count; i++) {
        const lightness = 90 - (i / (count - 1)) * 80
        shades.push({
            lightness,
            hex: hslToHex(h, s, lightness),
            label: `${Math.round((i / (count - 1)) * 100)}%`,
        })
    }

    return shades
}


export function normalizeHex(value: string): string | null {
    if (!value) return null;
    const trimmedValue = value.trim()

    const shortMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(trimmedValue)

    if (shortMatch) {
        const [, r, g, b] = shortMatch

        return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
    }

    const fullMatch = /^#?([a-f\d]{6})$/i.exec(trimmedValue)

    if (!fullMatch) {
        return null
    }

    return `#${fullMatch[1]}`.toUpperCase()
}

export function hexToRgb(hex: string): RGBColor {
    const normalizedHex = normalizeHex(hex)

    if (!normalizedHex) {
        throw new Error(`Invalid HEX color: ${hex}`)
    }

    return {
        r: Number.parseInt(normalizedHex.slice(1, 3), 16),
        g: Number.parseInt(normalizedHex.slice(3, 5), 16),
        b: Number.parseInt(normalizedHex.slice(5, 7), 16),
    }
}

export function hexToOklch(hex: string): OKLCHColor {
    const rgb = hexToRgb(hex)

    const linearR = srgbChannelToLinear(rgb.r / 255)
    const linearG = srgbChannelToLinear(rgb.g / 255)
    const linearB = srgbChannelToLinear(rgb.b / 255)

    const l = Math.cbrt(
        0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB
    )

    const m = Math.cbrt(
        0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB
    )

    const s = Math.cbrt(
        0.0883024619 * linearR + 0.2817188376 * linearG + 0.6299787005 * linearB
    )

    const oklabL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
    const oklabA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
    const oklabB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

    const chroma = Math.sqrt(oklabA ** 2 + oklabB ** 2)

    let hue = Math.atan2(oklabB, oklabA) * (180 / Math.PI)

    if (hue < 0) {
        hue += 360
    }

    return {
        l: oklabL,
        c: chroma,
        h: chroma < 0.0001 ? 0 : hue,
    }
}

export function generateOklchShades(hex: string): ColorShade[] {
    const source = hexToOklch(hex)

    return SHADE_NAMES.map((name) => {
        const lightness = SHADE_LIGHTNESS[name]

        /*
         * Very light and very dark colors cannot retain the source color's full
         * chroma in sRGB. This initial adjustment creates a smoother scale before
         * the gamut-mapping pass reduces chroma further when necessary.
         */
        const distanceFromMidpoint = Math.abs(lightness - 0.6) / 0.6
        const chromaMultiplier = 1 - Math.min(distanceFromMidpoint, 1) * 0.45

        const requestedColor: OKLCHColor = {
            l: lightness,
            c: source.c * chromaMultiplier,
            h: source.h,
        }

        const mappedColor = mapOklchToSrgbGamut(requestedColor)

        return {
            name,
            hex: oklchToHex(mappedColor),
            oklch: mappedColor,
        }
    })
}

export function mapOklchToSrgbGamut(color: OKLCHColor): OKLCHColor {
    const normalizedColor = {
        l: clamp(color.l, 0, 1),
        c: Math.max(0, color.c),
        h: normalizeHue(color.h),
    }

    if (isOklchInSrgbGamut(normalizedColor)) {
        return normalizedColor
    }

    let minimumChroma = 0
    let maximumChroma = normalizedColor.c

    for (let index = 0; index < 24; index += 1) {
        const candidateChroma = (minimumChroma + maximumChroma) / 2

        const candidate = {
            ...normalizedColor,
            c: candidateChroma,
        }

        if (isOklchInSrgbGamut(candidate)) {
            minimumChroma = candidateChroma
        } else {
            maximumChroma = candidateChroma
        }
    }

    return {
        ...normalizedColor,
        c: minimumChroma,
    }
}

export function isOklchInSrgbGamut(color: OKLCHColor): boolean {
    const rgb = oklchToRawSrgb(color)
    const epsilon = 0.000001

    return (
        rgb.r >= -epsilon &&
        rgb.r <= 1 + epsilon &&
        rgb.g >= -epsilon &&
        rgb.g <= 1 + epsilon &&
        rgb.b >= -epsilon &&
        rgb.b <= 1 + epsilon
    )
}

export function oklchToHex(color: OKLCHColor): string {
    const rgb = oklchToRawSrgb(color)

    return rgbToHex({
        r: Math.round(clamp(rgb.r, 0, 1) * 255),
        g: Math.round(clamp(rgb.g, 0, 1) * 255),
        b: Math.round(clamp(rgb.b, 0, 1) * 255),
    })
}

export function oklchToRawSrgb(color: OKLCHColor): {
    r: number
    g: number
    b: number
} {
    const hueRadians = normalizeHue(color.h) * (Math.PI / 180)

    const oklabA = color.c * Math.cos(hueRadians)
    const oklabB = color.c * Math.sin(hueRadians)

    const l = color.l + 0.3963377774 * oklabA + 0.2158037573 * oklabB
    const m = color.l - 0.1055613458 * oklabA - 0.0638541728 * oklabB
    const s = color.l - 0.0894841775 * oklabA - 1.291485548 * oklabB

    const linearR =
        4.0767416621 * l ** 3 - 3.3077115913 * m ** 3 + 0.2309699292 * s ** 3

    const linearG =
        -1.2684380046 * l ** 3 + 2.6097574011 * m ** 3 - 0.3413193965 * s ** 3

    const linearB =
        -0.0041960863 * l ** 3 - 0.7034186147 * m ** 3 + 1.707614701 * s ** 3

    return {
        r: linearChannelToSrgb(linearR),
        g: linearChannelToSrgb(linearG),
        b: linearChannelToSrgb(linearB),
    }
}

export function srgbChannelToLinear(channel: number): number {
    return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
}

export function linearChannelToSrgb(channel: number): number {
    return channel <= 0.0031308
        ? channel * 12.92
        : 1.055 * channel ** (1 / 2.4) - 0.055
}

export function rgbToHex(rgb: RGBColor): string {
    const toHex = (channel: number) =>
        clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0")

    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
}

export function formatOklch(color: OKLCHColor): string {
    return `oklch(${(color.l * 100).toFixed(2)}% ${color.c.toFixed(
        4
    )} ${color.h.toFixed(2)})`
}

export function normalizeHue(hue: number): number {
    return ((hue % 360) + 360) % 360
}

export function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum)
}

import { oklch, rgb, type Rgb } from "culori"
import type { RgbaColor } from "react-colorful"

const clamp255 = (value: number) => {
  return Math.min(255, Math.max(0, Math.round(value)))
}

export function oklchToRgbaObj(oklchStr: string): RgbaColor {
  const parsed = oklch(oklchStr)

  if (!parsed) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  const rgbObj = rgb(parsed)

  if (!rgbObj) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  return {
    r: clamp255((rgbObj.r ?? 0) * 255),
    g: clamp255((rgbObj.g ?? 0) * 255),
    b: clamp255((rgbObj.b ?? 0) * 255),
    a: rgbObj.alpha ?? 1,
  }
}

export function rgbaObjToOklchStr(rgbaObj: RgbaColor): string {
  const culoriRgb: Rgb = {
    mode: "rgb",
    r: rgbaObj.r / 255,
    g: rgbaObj.g / 255,
    b: rgbaObj.b / 255,
    alpha: rgbaObj.a,
  }

  const oklchObj = oklch(culoriRgb)

  if (!oklchObj) {
    return "oklch(0 0 0)"
  }

  const l = (oklchObj.l ?? 0).toFixed(3)
  const c = (oklchObj.c ?? 0).toFixed(3)
  const h = Number.isFinite(oklchObj.h) ? oklchObj.h!.toFixed(1) : "0"
  const a = oklchObj.alpha ?? 1

  return `oklch(${l} ${c} ${h}${a < 1 ? ` / ${a.toFixed(2)}` : ""})`
}

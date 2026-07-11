import { DEFAULT_NEUTRAL_ACCENT } from "../constants"
import type { ResolvedThemeSeeds, ThemeRecord } from "../types"

export function resolveThemeSeeds(
  seeds: ThemeRecord["seeds"]
): ResolvedThemeSeeds {
  if (seeds.accent !== undefined) {
    return {
      primary: seeds.primary,
      accent: seeds.accent,
      accentSource: "authored",
    }
  }

  return {
    primary: seeds.primary,
    accent: DEFAULT_NEUTRAL_ACCENT,
    accentSource: "neutral-default",
  }
}

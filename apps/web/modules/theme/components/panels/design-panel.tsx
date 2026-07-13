import * as React from "react"

import { BorderRadiusCard } from "../display/border-radius-card"
import type { ThemeFormData } from "../form-components/theme-form-popover"

export function DesignPanel({
  formData,
  onChange,
}: {
  formData: ThemeFormData
  onChange: <K extends keyof ThemeFormData>(
    field: K,
    value: ThemeFormData[K]
  ) => void
}) {
  return (
    <BorderRadiusCard
      value={formData.borderRadius}
      onChange={(value) => onChange("borderRadius", value)}
      showCard={false}
    />
  )
}

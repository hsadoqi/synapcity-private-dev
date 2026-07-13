"use client"

import * as React from "react"

import type { ThemeFormData } from "../form-components/theme-form-popover"
import { FontPickerCard } from "../display/font-picker-card"

interface FontPanelProps {
  formData: ThemeFormData
  onChange: <K extends keyof ThemeFormData>(
    field: K,
    value: ThemeFormData[K]
  ) => void
  defaultFormData: ThemeFormData
}

export function FontPanel({
  formData,
  onChange,
  defaultFormData,
}: FontPanelProps) {
  return (
    <FontPickerCard
      data={formData}
      defaultData={defaultFormData}
      onChange={onChange}
    />
  )
}

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
  hideLabel?: boolean;
  label?: string;
}

export function FontPanel({
  label,
  hideLabel,
  formData,
  onChange,
  defaultFormData,
}: FontPanelProps) {
  return (
    <FontPickerCard
      label={label}
      hideLabel={hideLabel}
      data={formData}
      defaultData={defaultFormData}
      onChange={onChange}
      showCard={false}
    />
  )
}

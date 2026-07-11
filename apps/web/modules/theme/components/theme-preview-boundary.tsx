"use client"

import * as React from "react"

import { buildThemeVars, varsToReactStyle } from "../engine/build-theme-vars"
import type { ThemeDraft } from "../types"

type ThemePreviewBoundaryProps = {
  draft: ThemeDraft
  children: React.ReactNode
  className?: string
}

export function ThemePreviewBoundary({
  draft,
  children,
  className,
}: ThemePreviewBoundaryProps) {
  return (
    <div
      className={className}
      data-theme-preview-id={draft.id}
      style={varsToReactStyle(buildThemeVars(draft))}
    >
      {children}
    </div>
  )
}

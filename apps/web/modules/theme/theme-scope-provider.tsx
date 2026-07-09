"use client"

import * as React from "react"

import { buildThemeVariables } from "./theme-engine"
import { DEFAULT_THEME_RECORD, type ThemeRecord } from "./types"

interface ThemeScopeProviderProps {
  theme?: ThemeRecord
  children: React.ReactNode
  className?: string
}

export function ThemeScopeProvider({
  theme = DEFAULT_THEME_RECORD,
  children,
  className,
}: ThemeScopeProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const target = containerRef.current ?? document.documentElement
    const cssVars = buildThemeVariables(theme.primaryOklch, theme.accentOklch)

    Object.entries(cssVars).forEach(([name, value]) => {
      target.style.setProperty(name, value)
    })
  }, [theme])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

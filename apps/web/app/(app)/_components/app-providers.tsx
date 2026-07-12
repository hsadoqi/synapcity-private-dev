"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import {
  SidebarProvider,
  useSidebar,
} from "@workspace/ui/components/primitives/sidebar"

const BUILDER_SIDEBAR_COLLAPSE_WIDTH = 1500

function isThemeBuilderPathname(pathname: string) {
  return pathname.startsWith("/settings/themes/") && pathname !== "/settings/themes"
}

function getEffectiveWindowWidth() {
  if (typeof window === "undefined") return 1440

  const rootFontSize = Number.parseFloat(
    window.getComputedStyle(document.documentElement).fontSize
  )
  const textScale = Number.isFinite(rootFontSize) && rootFontSize > 0
    ? rootFontSize / 16
    : 1

  return window.innerWidth / Math.max(1, textScale)
}

function useEffectiveWindowWidth() {
  const [width, setWidth] = React.useState(getEffectiveWindowWidth)

  React.useEffect(() => {
    const handleResize = () => setWidth(getEffectiveWindowWidth())

    handleResize()
    window.addEventListener("resize", handleResize)

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleResize)
    observer?.observe(document.documentElement)

    return () => {
      window.removeEventListener("resize", handleResize)
      observer?.disconnect()
    }
  }, [])

  return width
}

function ThemeBuilderSidebarCoordinator() {
  const pathname = usePathname()
  const width = useEffectiveWindowWidth()
  const { isMobile, open, setOpen } = useSidebar()
  const builderSessionRef = React.useRef<{ priorOpen: boolean } | null>(null)
  const isThemeBuilder = isThemeBuilderPathname(pathname)

  React.useEffect(() => {
    if (isMobile) return

    if (!isThemeBuilder) {
      const session = builderSessionRef.current
      if (session) {
        builderSessionRef.current = null
        if (open !== session.priorOpen) {
          setOpen(session.priorOpen)
        }
      }
      return
    }

    if (!builderSessionRef.current) {
      builderSessionRef.current = { priorOpen: open }
    }

    const session = builderSessionRef.current
    const shouldCollapse = width < BUILDER_SIDEBAR_COLLAPSE_WIDTH

    if (shouldCollapse && open) {
      setOpen(false)
      return
    }

    if (!shouldCollapse && session.priorOpen && !open) {
      setOpen(true)
    }
  }, [isMobile, isThemeBuilder, open, setOpen, width])

  React.useEffect(() => {
    return () => {
      const session = builderSessionRef.current
      if (session && open !== session.priorOpen) {
        setOpen(session.priorOpen)
      }
    }
  }, [open, setOpen])

  return null
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <ThemeBuilderSidebarCoordinator />
        {children}
      </SidebarProvider>
    </div>
  )
}

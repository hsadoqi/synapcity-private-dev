"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Command,
  Ellipsis,
  FilePlus2,
  Moon,
  PanelRight,
  Palette,
  Search,
  Share2,
  SlidersHorizontal,
  Sun,
} from "lucide-react"

import type { AppRouteContext } from "@/modules/routing"
import { Button } from "@workspace/ui/components/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/primitives/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/primitives/tooltip"

function HeaderIconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          type="button"
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function AppearanceToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <HeaderIconButton
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </HeaderIconButton>
  )
}

export function AppGlobalActions({
  routeContext,
}: {
  routeContext: AppRouteContext
}) {
  const createHref =
    routeContext.section === "dashboards" ||
    routeContext.section === "dashboard"
      ? "/dashboards"
      : "/documents"

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="hidden gap-1.5 sm:inline-flex"
        asChild
      >
        <Link href={createHref}>
          <FilePlus2 />
          New
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="hidden gap-1.5 text-muted-foreground lg:inline-flex"
        type="button"
      >
        <Command />
        Command
      </Button>

      <HeaderIconButton label="Search">
        <Search />
      </HeaderIconButton>
      <AppearanceToggle />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Open theme library" asChild>
            <Link href="/settings/themes">
              <Palette />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open theme library</TooltipContent>
      </Tooltip>

      {routeContext.entityType ? (
        <HeaderIconButton label="Toggle context panel">
          <PanelRight />
        </HeaderIconButton>
      ) : null}

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>More actions</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Application</DropdownMenuLabel>
          <DropdownMenuItem>
            <Search />
            Search all
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Command />
            Command palette
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/themes">
              <Palette />
              Themes
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function AppContextToolbar({
  routeContext,
}: {
  routeContext: AppRouteContext
}) {
  if (routeContext.section === "home" || routeContext.section === "unknown") {
    return null
  }

  const isDetail =
    routeContext.section === "document" || routeContext.section === "dashboard"
  const isDashboard =
    routeContext.section === "dashboards" || routeContext.section === "dashboard"

  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border-b bg-surface-muted/55 px-4 text-xs md:px-6">
      <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <span className="hidden font-medium text-foreground sm:inline">
          {isDetail ? "Object actions" : "View controls"}
        </span>
        <span className="truncate">
          {isDetail
            ? `Actions for this ${routeContext.entityType}`
            : `Controls for ${routeContext.title.toLowerCase()}`}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="xs" className="hidden gap-1.5 sm:inline-flex">
          <SlidersHorizontal />
          {isDetail ? "Properties" : "Filter"}
        </Button>
        <Button variant="ghost" size="xs" className="gap-1.5">
          {isDashboard && isDetail ? "Add widget" : "Sort"}
        </Button>
        {isDetail ? (
          <Button variant="ghost" size="xs" className="hidden gap-1.5 md:inline-flex">
            <Share2 />
            Share
          </Button>
        ) : null}
      </div>
    </div>
  )
}

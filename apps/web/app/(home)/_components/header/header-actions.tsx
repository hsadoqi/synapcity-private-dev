// Ported from synapcity-theme/apps/web/app/(app)/_components/header-actions.tsx
// unchanged aside from the import path for AppRouteContext (documents fork
// keeps a flat components/ dir rather than app/(app)/_components/).
"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@wrksz/themes/client"
import {
  Command,
  Ellipsis,
  FilePlus2,
  Moon,
  PanelRight,
  Palette,
  Search,
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

      <HeaderIconButton label="Search">
        <Search />
      </HeaderIconButton>
      <AppearanceToggle />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Open theme settings" asChild>
            <Link href="/settings/theme">
              <Palette />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open theme settings</TooltipContent>
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
            <Link href="/settings/theme">
              <Palette />
              Theme
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

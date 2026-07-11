"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@wrksz/themes/client"
import { Command, FilePlus2, Moon, Palette, Search, Sun } from "lucide-react"

import type { AppRouteContext } from "@/modules/routing"
import { Button } from "@workspace/ui/components/primitives/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/primitives/tooltip"
import { Separator } from "@workspace/ui/components"
import { SidebarSearch } from "../sidebar/sidebar-search"
import { cn } from "@workspace/ui/lib/utils"
import useClickOutside from "@workspace/ui/hooks/use-click-outside"
import { useRef } from "react"
import { useCommand } from "@/components/command/command-context"
import { MobileHeaderActions } from "./mobile-header-actions"

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
      label={isDark ? "Switch to light" : "Switch to dark"}
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
    <div className="flex items-center gap-4">
      <div className="hidden items-center gap-2 md:flex">
        <CommandTrigger />
        <Separator className="mx-1 h-6" orientation="vertical" />
        <ThemeTrigger />
        <AppearanceToggle />
        <Separator className="mx-1 h-6" orientation="vertical" />
        <AddNewTrigger createHref={createHref} />
      </div>
      <div className="flex md:hidden">
        <MobileHeaderActions />
      </div>
    </div>
  )
}

export const CommandTrigger = () => {
  const { open, setOpen } = useCommand()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open command palette"
          onClick={() => setOpen(!open)}
        >
          <Command className="size-4 shrink-0" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Open command palette</TooltipContent>
    </Tooltip>
  )
}
export const SearchTrigger = () => {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useClickOutside(ref, () => {
    if (searchOpen) {
      setSearchOpen(!searchOpen)
    }
  })
  return (
    <>
      <div
        ref={ref}
        className={cn(
          "w-0 opacity-0 transition-[width,opacity] duration-300 ease-linear",
          searchOpen && "w-full opacity-100"
        )}
      >
        <SidebarSearch />
      </div>
      <div className="flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn(
                "pointer-events-auto z-50 flex items-center gap-2 transition-[opacity,display] duration-300 ease-linear",
                searchOpen && "hidden opacity-0"
              )}
              variant="ghost"
              size="icon-sm"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
export const AddNewTrigger = ({ createHref }: { createHref: string }) => {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" asChild>
      <Link href={createHref}>
        <FilePlus2 />
        New
      </Link>
    </Button>
  )
}

export const ThemeTrigger = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open theme settings"
          asChild
        >
          <Link href="/settings/theme">
            <Palette />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Theme settings</TooltipContent>
    </Tooltip>
  )
}

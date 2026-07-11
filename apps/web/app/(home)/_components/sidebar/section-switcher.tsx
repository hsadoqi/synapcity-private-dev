"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@workspace/ui/components/primitives/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/primitives/sidebar"
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"

export function SectionSwitcher({
  sections,
}: {
  sections: {
    name: string
    logo: React.ReactNode
    href: string
  }[]
}) {
  const { isMobile, state } = useSidebar()
  const pathname = usePathname()
  const activeTeam =
    sections.find(
      (section) =>
        pathname === section.href || pathname.startsWith(`${section.href}/`)
    ) ?? sections[0]

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-6 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTeam.logo}
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">
                  {activeTeam.name}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit px-1 py-2"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={6}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Domains
            </DropdownMenuLabel>
            {sections.map((section, index) => (
              <DropdownMenuItem key={section.name} className="gap-2" asChild>
                <Link
                  href={section.href}
                  aria-current={section === activeTeam ? "page" : undefined}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {section.logo}
                  </div>
                  {section.name}
                  <DropdownMenuShortcut>
                    <kbd className="bg-muted-foreground px-1 text-muted">
                      ⌘{index + 1}
                    </kbd>
                  </DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add section
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {state === "collapsed" && (
          <span className="sr-only">Current section: {activeTeam.name}</span>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

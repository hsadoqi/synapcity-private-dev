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

export function DomainSwitcher({
  domains,
}: {
  domains: {
    name: string
    logo: React.ReactNode
    href: string
  }[]
}) {
  const { isMobile, state } = useSidebar()
  const pathname = usePathname()
  const activeTeam = domains.find(
    (domain) => pathname === domain.href || pathname.startsWith(`${domain.href}/`)
  ) ?? domains[0]

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
              <div className="flex aspect-square size-6 items-center justify-center
              bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTeam.logo}
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium text-sm">{activeTeam.name}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit py-2 px-1"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={6}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Domains
            </DropdownMenuLabel>
            {domains.map((domain, index) => (
              <DropdownMenuItem
                key={domain.name}
                className="gap-2"
                asChild
              >
                <Link href={domain.href} aria-current={domain === activeTeam ? "page" : undefined}>
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {domain.logo}
                  </div>
                  {domain.name}
                  <DropdownMenuShortcut>
                    <kbd className="bg-muted-foreground text-muted px-1">
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
              <div className="font-medium text-muted-foreground">Add domain</div>
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

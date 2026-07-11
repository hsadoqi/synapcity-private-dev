"use client"

import Link from "next/link"
import { FileText, LayoutDashboard, Palette } from "lucide-react"

import {
  APP_NAV_ITEMS,
  AppRouteContext,
  isNavItemActive,
} from "@/modules/routing"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components"

type SidebarPrimaryNavigationProps = {
  open: boolean
  pathname: string
  routeContext: AppRouteContext
  toggleSidebar: () => void
}

const sidebarNavigationItems = APP_NAV_ITEMS.filter(
  (item) => item.section !== "home"
).map((item) => ({
  ...item,
  icon:
    item.section === "documents"
      ? FileText
      : item.section === "dashboards"
        ? LayoutDashboard
        : Palette,
}))

export function SidebarPrimaryNavigation({
  open,
  pathname,
  routeContext,
  toggleSidebar,
}: SidebarPrimaryNavigationProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Sections</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sidebarNavigationItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavItemActive(
              {
                ...item,
                section: routeContext.section,
              },
              pathname
            )

            return (
              !isActive && (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    onClick={
                      !open
                        ? () => toggleSidebar()
                        : (event) => {
                            event.stopPropagation()
                          }
                    }
                  >
                    <Link href={item.href}>
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

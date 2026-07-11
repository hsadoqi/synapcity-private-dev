"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Palette,
  Search,
} from "lucide-react"

import { getAppRouteContext, isNavItemActive } from "@/modules/routing"
import { loadDocuments } from "@/modules/documents/services/document-data"
import { loadDashboards } from "@/modules/dashboards/services/dashboard-data"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/primitives/sidebar"
import { Label } from "@workspace/ui/components/primitives/label"
import { NavUser } from "./nav-user"

const sidebarUser = {
  name: "Synapcity",
  email: "workspace.local",
  avatar: "/avatars/shadcn.jpg",
}

const sectionItems = [
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Dashboards",
    href: "/dashboards",
    icon: LayoutDashboard,
  },
  {
    label: "Themes",
    href: "/settings/themes",
    icon: Palette,
  },
]

/**
 * Reads straight from the localStorage-backed services (same pattern
 * document-detail/dashboard-detail already use), keyed on the route so the
 * list re-reads on navigation. This is NOT live-reactive — creating a
 * document in another tab, or without a navigation in between, won't
 * update this list until something remounts the sidebar. That's a known
 * limitation of localStorage-as-source-of-truth generally, not something
 * worth solving twice — real reactivity arrives with Roadmap Phase 2
 * (real persistence + proper data-fetching), not before.
 */
function useSidebarItems(section: string) {
  return React.useMemo(() => {
    const documentItems = loadDocuments().map((document) => ({
      label: document.title,
      href: `/documents/${document.id}`,
      meta: document.summary ?? "Untitled summary",
    }))

    const dashboardItems = loadDashboards().map((dashboard) => ({
      label: dashboard.title,
      href: `/dashboards/${dashboard.id}`,
      meta: dashboard.description ?? "No description",
    }))

    return { documentItems, dashboardItems }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-read on section change, not on every render
  }, [section])
}

function SidebarSearch() {
  return (
    <form>
      <div className="relative">
        <Label htmlFor="app-sidebar-search" className="sr-only">
          Search objects
        </Label>
        <SidebarInput
          id="app-sidebar-search"
          placeholder="Filter objects"
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </form>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)
  const activeSection =
    routeContext.section === "dashboard" || routeContext.section === "dashboards"
      ? "Dashboards"
      : routeContext.section === "theme-settings"
        ? "Themes"
        : "Documents"
  const { documentItems, dashboardItems } = useSidebarItems(routeContext.section)
  const activeItems = activeSection === "Dashboards" ? dashboardItems : documentItems

  return (
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      side="left"
      className="top-[5.5rem] h-[calc(100svh-5.5rem)]"
    >
      <SidebarHeader className="gap-3 border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={activeSection === "Dashboards" ? "/dashboards" : "/documents"}>
                <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                  <BarChart3 className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">
                    {activeSection}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/65">
                    Synapcity workspace
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSearch />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sectionItems.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavItemActive(
                        {
                          href: item.href,
                          label: item.label,
                          section: routeContext.section,
                        },
                        pathname
                      )}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            {activeSection === "Dashboards" ? "Dashboards" : "Documents"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {activeItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="h-auto items-start py-2"
                  >
                    <Link href={item.href}>
                      <FileText className="mt-0.5" />
                      <span className="grid min-w-0 gap-0.5">
                        <span>{item.label}</span>
                        <span className="truncate text-[11px] font-normal text-sidebar-foreground/60">
                          {item.meta}
                        </span>
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

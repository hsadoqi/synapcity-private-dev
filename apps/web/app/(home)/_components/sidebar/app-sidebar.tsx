"use client"

import * as React from "react"

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
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/primitives/sidebar"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  LayoutDashboard,
  NotepadText,
  Palette,
  Search,
} from "lucide-react"

import {
  AppRouteContext,
  getAppRouteContext,
  isNavItemActive,
} from "@/modules/routing"
import { loadDocuments } from "@/modules/documents/services/document-data"
import { loadDashboards } from "@/modules/dashboards/services/dashboard-data"
import { Label } from "@workspace/ui/components"
import { DomainSwitcher } from "./domain-switcher"
import { NavUser } from "./nav-user"

const sidebarUser = {
  name: "Hanaa",
  email: "workspace.local",
  avatar: "/logo.png",
}

const sectionItems = [
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Dashboards", href: "/dashboards", icon: LayoutDashboard },
  { label: "Theme", href: "/settings/theme", icon: Palette },
]

/**
 * Reads straight from the localStorage-backed services, keyed on the route
 * so the list re-reads on navigation. Not live-reactive — see the matching
 * comment in synapcity-theme's app-sidebar.tsx. Real reactivity arrives
 * with Roadmap Phase 2 (real persistence + proper data-fetching).
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
  }, [])
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
        <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </form>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)
  const activeSection =
    routeContext.section === "dashboard" ||
    routeContext.section === "dashboards"
      ? "Dashboards"
      : routeContext.section === "theme-settings"
        ? "Theme"
        : "Documents"
  const { documentItems, dashboardItems } = useSidebarItems(
    routeContext.section
  )
  const activeItems =
    activeSection === "Dashboards" ? dashboardItems : documentItems
  const { open, toggleSidebar } = useSidebar()

  return (
    <Sidebar
      collapsible="icon"
      className="max-h-dvh flex-col justify-center"
      {...props}
    >
      <SidebarHeader className="gap-3 border-b border-sidebar-border">
        <DomainSwitcher
          domains={[
            {
              name: "Documents",
              logo: <NotepadText className="size-4 shrink-0" />,
              href: "/documents",
            },
            {
              name: "Dashboards",
              logo: <LayoutDashboard className="size-4 shrink-0" />,
              href: "/dashboards",
            },
          ]}
        />
        {open && <SidebarSearch />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarSections
          open={open}
          routeContext={routeContext}
          pathname={pathname}
          toggleSidebar={toggleSidebar}
        />
        <InactiveItemsGroup
          activeItems={activeItems}
          activeSection={activeSection}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

const InactiveItemsGroup = ({
  activeSection,
  activeItems,
}: {
  activeSection: string
  activeItems:
    | {
        href: string
        label: string
        meta: string
      }[]
    | string
}) => {
  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {activeSection === "Dashboards" ? "Dashboards" : "Documents"}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {[...activeItems].map(
            (item) =>
              typeof item === "object" && (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="h-auto items-start py-2"
                  >
                    <Link href={"#"}>
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
              )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const SidebarSections = ({
  open=false,
  routeContext,
  pathname,
  toggleSidebar,
}: {
    open: boolean;
  routeContext: AppRouteContext
  pathname: string
  toggleSidebar: () => void
}) => {
  return (
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
                  onClick={
                    !open
                      ? () => toggleSidebar()
                      : (e) => {
                          e.stopPropagation()
                        }
                  }
                >
                  <Link href={"#"}>
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
  )
}

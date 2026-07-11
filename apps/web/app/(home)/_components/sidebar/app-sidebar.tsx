"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/primitives/sidebar"
import useClickOutside from "@workspace/ui/hooks/use-click-outside"
import { LayoutDashboard, NotepadText } from "lucide-react"
import { usePathname } from "next/navigation"

import { getAppRouteContext } from "@/modules/routing"
import { SectionSwitcher } from "./section-switcher"
import { NavUser } from "./nav-user"
import { SidebarPrimaryNavigation } from "./sidebar-primary-navigation"
import { SidebarSearch } from "./sidebar-search"
import { SidebarWorkspaceItems } from "./sidebar-workspace-items"
import { useSidebarWorkspaceItems } from "./use-sidebar-workspace-items"

const sidebarUser = {
  name: "Hanaa",
  email: "workspace.local",
  avatar: "/logo.png",
}

/**
 * Reads straight from the localStorage-backed services. Real reactivity arrives
 * with the persistence/data-fetching work planned for the app.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)
  const activeSection =
    routeContext.section === "dashboard" ||
    routeContext.section === "dashboards"
      ? "Dashboards"
      : routeContext.section === "theme-settings"
        ? "Theme"
        : "Documents"
  const { dashboardItems, documentItems, themeItems } =
    useSidebarWorkspaceItems()
  const activeItems =
    activeSection === "Dashboards"
      ? dashboardItems
      : activeSection === "Theme"
        ? themeItems
        : documentItems
  const { open, setOpen, toggleSidebar } = useSidebar()

  useClickOutside(ref, () => setOpen(false))

  return (
    <Sidebar
      ref={ref}
      collapsible="offcanvas"
      className="max-h-dvh flex-col justify-center"
      {...props}
    >
      <SidebarHeader className="gap-3 border-b border-sidebar-border">
        <SectionSwitcher
          sections={[
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
        {open ? <SidebarSearch /> : null}
      </SidebarHeader>
      <SidebarContent>
        <SidebarPrimaryNavigation
          open={open}
          pathname={pathname}
          routeContext={routeContext}
          toggleSidebar={toggleSidebar}
        />
        <SidebarWorkspaceItems
          activeSection={activeSection}
          items={activeItems}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

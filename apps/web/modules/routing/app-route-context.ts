export type AppRouteSection =
  | "home"
  | "documents"
  | "document"
  | "dashboards"
  | "dashboard"
  | "theme-settings"
  | "unknown"

export type AppEntityType = "document" | "dashboard"

export type AppNavItem = {
  href: string
  label: string
  section: AppRouteSection
}

export type AppRouteContext = {
  pathname: string
  section: AppRouteSection
  entityType?: AppEntityType
  entityId?: string
  title: string
  description: string
  navItems: AppNavItem[]
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: "/", label: "Home", section: "home" },
  { href: "/documents", label: "Documents", section: "documents" },
  { href: "/dashboards", label: "Dashboards", section: "dashboards" },
  { href: "/settings/themes", label: "Themes", section: "theme-settings" },
]

function decodeRouteSegment(value: string | undefined) {
  if (!value) return undefined

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") return "/"
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
}

export function getAppRouteContext(pathname: string): AppRouteContext {
  const normalizedPathname = normalizePathname(pathname)
  const segments = normalizedPathname.split("/").filter(Boolean)

  if (normalizedPathname === "/") {
    return {
      pathname: normalizedPathname,
      section: "home",
      title: "Synapcity",
      description: "Workspace overview",
      navItems: APP_NAV_ITEMS,
    }
  }

  if (segments[0] === "documents") {
    const documentId = decodeRouteSegment(segments[1])

    return {
      pathname: normalizedPathname,
      section: documentId ? "document" : "documents",
      entityType: documentId ? "document" : undefined,
      entityId: documentId,
      title: documentId ? "Document" : "Documents",
      description: documentId ? `Editing ${documentId}` : "Document library",
      navItems: APP_NAV_ITEMS,
    }
  }

  if (segments[0] === "dashboards") {
    const dashboardId = decodeRouteSegment(segments[1])

    return {
      pathname: normalizedPathname,
      section: dashboardId ? "dashboard" : "dashboards",
      entityType: dashboardId ? "dashboard" : undefined,
      entityId: dashboardId,
      title: dashboardId ? "Dashboard" : "Dashboards",
      description: dashboardId ? `Viewing ${dashboardId}` : "Dashboard library",
      navItems: APP_NAV_ITEMS,
    }
  }

  if (segments[0] === "settings" && segments[1] === "themes") {
    return {
      pathname: normalizedPathname,
      section: "theme-settings",
      title: "Themes",
      description: "Reusable visual systems",
      navItems: APP_NAV_ITEMS,
    }
  }

  return {
    pathname: normalizedPathname,
    section: "unknown",
    title: "Synapcity",
    description: "Route not recognized",
    navItems: APP_NAV_ITEMS,
  }
}

export function getRouteKind(pathname: string) {
  return getAppRouteContext(pathname).section
}

export function isNavItemActive(item: AppNavItem, pathname: string) {
  const normalizedPathname = normalizePathname(pathname)

  if (item.href === "/") {
    return normalizedPathname === "/"
  }

  return (
    normalizedPathname === item.href ||
    normalizedPathname.startsWith(`${item.href}/`)
  )
}

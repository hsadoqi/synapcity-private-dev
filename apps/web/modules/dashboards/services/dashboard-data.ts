import type { DashboardRecord } from "../types"

const STORAGE_KEY = "synapcity.dashboards"

const seedDashboards: DashboardRecord[] = [
  {
    id: "db-1",
    title: "Weekly review",
    slug: "weekly-review",
    description: "A calm view of work in motion.",
    version: 1,
    createdAt: "2026-01-03T09:00:00.000Z",
    updatedAt: "2026-01-03T09:00:00.000Z",
  },
  {
    id: "db-2",
    title: "Product launch",
    slug: "product-launch",
    description: "A launch surface for the next release.",
    version: 1,
    createdAt: "2026-01-04T09:00:00.000Z",
    updatedAt: "2026-01-04T09:00:00.000Z",
  },
]

function readDashboardsFromStorage(): DashboardRecord[] | null {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as DashboardRecord[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function persistDashboards(dashboards: DashboardRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards))
}

export function loadDashboards(): DashboardRecord[] {
  if (typeof window === "undefined") {
    return seedDashboards
  }

  return readDashboardsFromStorage() ?? seedDashboards
}

export function loadDashboardById(dashboardId: string): DashboardRecord | null {
  const dashboards = loadDashboards()
  return dashboards.find((dashboard) => dashboard.id === dashboardId) ?? null
}

export function saveDashboard(dashboard: DashboardRecord) {
  const dashboards = loadDashboards()
  const nextDashboards = dashboards.some((item) => item.id === dashboard.id)
    ? dashboards.map((item) => (item.id === dashboard.id ? dashboard : item))
    : [...dashboards, dashboard]

  persistDashboards(nextDashboards)
  return nextDashboards
}

export function updateDashboard(
  dashboardId: string,
  updates: Partial<DashboardRecord>
) {
  const currentDashboard = loadDashboardById(dashboardId)
  if (!currentDashboard) {
    return null
  }

  const nextDashboard: DashboardRecord = {
    ...currentDashboard,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveDashboard(nextDashboard)
  return nextDashboard
}

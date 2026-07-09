import type {
  DashboardLayout,
  DashboardLayoutItem,
  WidgetInstance,
} from "../types"

const WIDGETS_STORAGE_KEY = "synapcity.dashboard-widgets"
const LAYOUT_STORAGE_KEY = "synapcity.dashboard-layouts"

function readStorageValue<T>(storageKey: string): T | null {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = window.localStorage.getItem(storageKey)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return null
  }
}

function writeStorageValue(storageKey: string, value: unknown) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value))
}

export function loadDashboardWidgets(dashboardId: string): WidgetInstance[] {
  const widgetsByDashboard =
    readStorageValue<Record<string, WidgetInstance[]>>(WIDGETS_STORAGE_KEY)
  return widgetsByDashboard?.[dashboardId] ?? []
}

export function saveDashboardWidgets(
  dashboardId: string,
  widgets: WidgetInstance[]
) {
  const widgetsByDashboard =
    readStorageValue<Record<string, WidgetInstance[]>>(WIDGETS_STORAGE_KEY) ??
    {}
  widgetsByDashboard[dashboardId] = widgets
  writeStorageValue(WIDGETS_STORAGE_KEY, widgetsByDashboard)
}

export function loadDashboardLayout(dashboardId: string): DashboardLayout {
  const layoutsByDashboard =
    readStorageValue<Record<string, DashboardLayout>>(LAYOUT_STORAGE_KEY)
  const existingLayout = layoutsByDashboard?.[dashboardId]

  return (
    existingLayout ?? {
      dashboardId,
      breakpoint: "lg",
      items: [],
    }
  )
}

export function saveDashboardLayout(
  dashboardId: string,
  layout: DashboardLayout
) {
  const layoutsByDashboard =
    readStorageValue<Record<string, DashboardLayout>>(LAYOUT_STORAGE_KEY) ?? {}
  layoutsByDashboard[dashboardId] = layout
  writeStorageValue(LAYOUT_STORAGE_KEY, layoutsByDashboard)
}

export function createDashboardWidget(
  widgetType: string,
  title: string,
  dashboardId: string
): WidgetInstance {
  return {
    id: `widget-${Date.now()}`,
    dashboardId,
    widgetType,
    title,
    config: { sourceId: "", title },
    sourceType: widgetType === "document-card" ? "document" : null,
    sourceId: widgetType === "document-card" ? "doc-1" : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createLayoutItem(
  widgetInstanceId: string,
  index: number
): DashboardLayoutItem {
  return {
    widgetInstanceId,
    x: index % 2,
    y: Math.floor(index / 2),
    w: 2,
    h: 2,
  }
}

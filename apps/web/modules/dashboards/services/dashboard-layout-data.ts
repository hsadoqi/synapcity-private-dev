import type {
  DashboardLayout,
  DashboardLayoutItem,
  WidgetInstance,
} from "../types"

const WIDGETS_STORAGE_KEY = "synapcity.dashboard-widgets"
const LAYOUT_STORAGE_KEY = "synapcity.dashboard-layouts"
const DASHBOARD_STORAGE_EVENT = "synapcity.dashboard-storage"

const emptyWidgetsByDashboard = new Map<string, WidgetInstance[]>()
const emptyLayoutByDashboard = new Map<string, DashboardLayout>()

let widgetsCacheRaw: string | null | undefined
let widgetsCacheValue: Record<string, WidgetInstance[]> = {}
let layoutsCacheRaw: string | null | undefined
let layoutsCacheValue: Record<string, DashboardLayout> = {}

function getEmptyWidgets(dashboardId: string): WidgetInstance[] {
  const existingWidgets = emptyWidgetsByDashboard.get(dashboardId)
  if (existingWidgets) {
    return existingWidgets
  }

  const widgets: WidgetInstance[] = []
  emptyWidgetsByDashboard.set(dashboardId, widgets)
  return widgets
}

function getEmptyLayout(dashboardId: string): DashboardLayout {
  const existingLayout = emptyLayoutByDashboard.get(dashboardId)
  if (existingLayout) {
    return existingLayout
  }

  const layout: DashboardLayout = {
    dashboardId,
    breakpoint: "lg",
    items: [],
  }
  emptyLayoutByDashboard.set(dashboardId, layout)
  return layout
}

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
  window.dispatchEvent(new Event(DASHBOARD_STORAGE_EVENT))
}

function readWidgetsByDashboard(): Record<string, WidgetInstance[]> {
  if (typeof window === "undefined") {
    return {}
  }

  const rawValue = window.localStorage.getItem(WIDGETS_STORAGE_KEY)
  if (rawValue === widgetsCacheRaw) {
    return widgetsCacheValue
  }

  widgetsCacheRaw = rawValue
  try {
    widgetsCacheValue = rawValue
      ? (JSON.parse(rawValue) as Record<string, WidgetInstance[]>)
      : {}
  } catch {
    widgetsCacheValue = {}
  }
  return widgetsCacheValue
}

function readLayoutsByDashboard(): Record<string, DashboardLayout> {
  if (typeof window === "undefined") {
    return {}
  }

  const rawValue = window.localStorage.getItem(LAYOUT_STORAGE_KEY)
  if (rawValue === layoutsCacheRaw) {
    return layoutsCacheValue
  }

  layoutsCacheRaw = rawValue
  try {
    layoutsCacheValue = rawValue
      ? (JSON.parse(rawValue) as Record<string, DashboardLayout>)
      : {}
  } catch {
    layoutsCacheValue = {}
  }
  return layoutsCacheValue
}

export function loadDashboardWidgets(dashboardId: string): WidgetInstance[] {
  return readWidgetsByDashboard()[dashboardId] ?? getEmptyWidgets(dashboardId)
}

export function saveDashboardWidgets(
  dashboardId: string,
  widgets: WidgetInstance[]
) {
  const widgetsByDashboard =
    readStorageValue<Record<string, WidgetInstance[]>>(WIDGETS_STORAGE_KEY) ??
    {}
  widgetsByDashboard[dashboardId] = widgets
  widgetsCacheValue = widgetsByDashboard
  widgetsCacheRaw = JSON.stringify(widgetsByDashboard)
  writeStorageValue(WIDGETS_STORAGE_KEY, widgetsByDashboard)
}

export function loadDashboardLayout(dashboardId: string): DashboardLayout {
  return readLayoutsByDashboard()[dashboardId] ?? getEmptyLayout(dashboardId)
}

export function saveDashboardLayout(
  dashboardId: string,
  layout: DashboardLayout
) {
  const layoutsByDashboard =
    readStorageValue<Record<string, DashboardLayout>>(LAYOUT_STORAGE_KEY) ?? {}
  layoutsByDashboard[dashboardId] = layout
  layoutsCacheValue = layoutsByDashboard
  layoutsCacheRaw = JSON.stringify(layoutsByDashboard)
  writeStorageValue(LAYOUT_STORAGE_KEY, layoutsByDashboard)
}

export function getDashboardWidgetsServerSnapshot(
  dashboardId: string
): WidgetInstance[] {
  return getEmptyWidgets(dashboardId)
}

export function getDashboardLayoutServerSnapshot(
  dashboardId: string
): DashboardLayout {
  return getEmptyLayout(dashboardId)
}

export function subscribeDashboardLayoutStorage(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === WIDGETS_STORAGE_KEY ||
      event.key === LAYOUT_STORAGE_KEY
    ) {
      listener()
    }
  }

  window.addEventListener(DASHBOARD_STORAGE_EVENT, listener)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(DASHBOARD_STORAGE_EVENT, listener)
    window.removeEventListener("storage", handleStorage)
  }
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

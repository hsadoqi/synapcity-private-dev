export interface DashboardRecord {
  id: string
  title: string
  slug: string
  description?: string | null
  version: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface DashboardLayoutItem {
  widgetInstanceId: string
  x: number
  y: number
  w: number
  h: number
}

export interface DashboardLayout {
  dashboardId: string
  breakpoint: "lg" | "md" | "sm" | "xs"
  items: DashboardLayoutItem[]
}

export interface WidgetInstance {
  id: string
  dashboardId: string
  widgetType: string
  title?: string | null
  config: Record<string, unknown>
  sourceType?: "document" | null
  sourceId?: string | null
  createdAt: string
  updatedAt: string
}

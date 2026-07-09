export type WidgetCategory = "content" | "document" | "data" | "media"

export interface WidgetDefinition<TConfig = Record<string, unknown>> {
  id: string
  label: string
  category: WidgetCategory
  defaultSize: { w: number; h: number }
  minSize?: { w: number; h: number }
  defaultConfig: TConfig
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

import type { BaseRecord, EntityRef } from "./base.js"

export type WidgetCategory = "content" | "document" | "data" | "media"

export interface WidgetDefinition<TConfig = Record<string, unknown>> {
  id: string
  label: string
  category: WidgetCategory
  defaultSize: { w: number; h: number }
  minSize?: { w: number; h: number }
  defaultConfig: TConfig
}

/**
 * Single canonical definition. Previously duplicated verbatim in both
 * modules/widgets/types.ts and modules/dashboards/types.ts across all four
 * forks — both modules now import this instead of redefining it.
 */
export interface WidgetInstance extends BaseRecord {
  dashboardId: string
  widgetType: string
  title?: string | null
  config: Record<string, unknown>

  /**
   * @deprecated Prefer `source` (a typed EntityRef). Kept so existing
   * service code (dashboard-data.ts etc.) that reads/writes these two
   * fields keeps working unchanged — nothing forces a migration yet.
   */
  sourceType?: "document" | null
  /** @deprecated Prefer `source`. See sourceType. */
  sourceId?: string | null

  /** Typed replacement for sourceType/sourceId. Optional, additive. */
  source?: EntityRef | null
}

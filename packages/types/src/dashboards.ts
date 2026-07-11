import type { BaseRecord } from "./base.js"

export interface DashboardRecord extends BaseRecord {
  title: string
  slug: string
  description?: string | null
  version: number
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

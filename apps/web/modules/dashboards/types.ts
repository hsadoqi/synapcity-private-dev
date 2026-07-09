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

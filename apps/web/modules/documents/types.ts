export interface DocumentRecord {
  id: string
  title: string
  slug: string
  content: string
  plainText: string
  summary?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

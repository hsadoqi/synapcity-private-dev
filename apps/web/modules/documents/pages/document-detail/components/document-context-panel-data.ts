import { loadDocuments } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"

/**
 * V0 context-panel content is deliberately mock/derived-from-local-state
 * only. Outline is parsed from the markdown-ish `content` string as a
 * stand-in for a real heading index; Related is a naive sibling lookup.
 * None of this should be mistaken for real backlink or search infra —
 * see the module README for what's intentionally deferred.
 */

export interface OutlineEntry {
  id: string
  depth: 1 | 2 | 3
  label: string
}

const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/

export function deriveOutline(content: string): OutlineEntry[] {
  return content
    .split("\n")
    .map((line, index) => {
      const match = HEADING_PATTERN.exec(line.trim())
      if (!match) return null

      const depth = match[1]?.length as 1 | 2 | 3
      const label = match[2]?.trim()
      if (!label) return null

      return { id: `heading-${index}`, depth, label }
    })
    .filter((entry): entry is OutlineEntry => entry !== null)
}

export interface RelatedDocumentEntry {
  id: string
  title: string
  reason: string
}

export function deriveRelatedDocuments(
  currentDocumentId: string
): RelatedDocumentEntry[] {
  return loadDocuments()
    .filter((document) => document.id !== currentDocumentId)
    .slice(0, 3)
    .map((document) => ({
      id: document.id,
      title: document.title,
      // TODO(lexical-integration): replace with real backlink/reference
      // data once documents can link to one another from editor content.
      reason: "Mentioned in the same workspace",
    }))
}

export interface PropertyEntry {
  label: string
  value: string
}

export function deriveProperties(
  document: Pick<DocumentRecord, "id" | "slug" | "createdAt" | "updatedAt">
): PropertyEntry[] {
  return [
    { label: "Document ID", value: document.id },
    { label: "Slug", value: document.slug },
    {
      label: "Created",
      value: new Date(document.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
    {
      label: "Updated",
      value: new Date(document.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
  ]
}

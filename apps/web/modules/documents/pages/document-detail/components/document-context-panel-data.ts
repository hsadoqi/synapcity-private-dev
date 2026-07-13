import { loadDocuments } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"

/**
 * V0 context-panel content is deliberately mock/derived-from-local-state
 * only. Related is a naive sibling lookup — not real backlink or search
 * infra; see the module README for what's intentionally deferred.
 * (Outline derivation moved to `modules/documents/editor/derive-outline.ts`
 * with the Lexical integration: it now reads HeadingNodes, not markdown.)
 */

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
      value: new Date(document.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    },
    {
      label: "Updated",
      value: new Date(document.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    },
  ]
}

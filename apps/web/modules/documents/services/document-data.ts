import type { DocumentRecord } from "../types"

const STORAGE_KEY = "synapcity.documents"

const seedDocuments: DocumentRecord[] = [
  {
    id: "doc-1",
    title: "Product vision",
    slug: "product-vision",
    content:
      "# Product vision\n\nDocument content is now editable from the route shell.",
    plainText:
      "Product vision. Document content is now editable from the route shell.",
    summary: "Shared direction for the V0 product experience.",
    createdAt: "2026-01-01T09:00:00.000Z",
    updatedAt: "2026-01-01T09:00:00.000Z",
  },
  {
    id: "doc-2",
    title: "Design principles",
    slug: "design-principles",
    content: "## Design principles\n\nKeep the experience calm and structured.",
    plainText: "Design principles. Keep the experience calm and structured.",
    summary: "A concise editorial reference for the product surface.",
    createdAt: "2026-01-02T09:00:00.000Z",
    updatedAt: "2026-01-02T09:00:00.000Z",
  },
]

function readDocumentsFromStorage(): DocumentRecord[] | null {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as DocumentRecord[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function persistDocuments(documents: DocumentRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
}

export function loadDocuments(): DocumentRecord[] {
  if (typeof window === "undefined") {
    return seedDocuments
  }

  return readDocumentsFromStorage() ?? seedDocuments
}

export function loadDocumentById(documentId: string): DocumentRecord | null {
  const documents = loadDocuments()
  return documents.find((document) => document.id === documentId) ?? null
}

export function saveDocument(document: DocumentRecord) {
  const documents = loadDocuments()
  const nextDocuments = documents.some((item) => item.id === document.id)
    ? documents.map((item) => (item.id === document.id ? document : item))
    : [...documents, document]

  persistDocuments(nextDocuments)
  return nextDocuments
}

export function updateDocument(
  documentId: string,
  updates: Partial<DocumentRecord>
) {
  const currentDocument = loadDocumentById(documentId)
  if (!currentDocument) {
    return null
  }

  const nextDocument: DocumentRecord = {
    ...currentDocument,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveDocument(nextDocument)
  return nextDocument
}

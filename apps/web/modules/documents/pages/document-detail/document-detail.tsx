"use client"

import * as React from "react"

import { DocumentEditorShell } from "./components/document-editor-shell"
import { DocumentMetadataPanel } from "./components/document-metadata-panel"
import { documentDetailStyles } from "./document-detail.styles"
import { loadDocumentById } from "@/modules/documents/services/document-data"
import type { DocumentRecord } from "@/modules/documents/types"

interface DocumentDetailPageProps {
  documentId: string
}

export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  const [document, setDocument] = React.useState<DocumentRecord | null>(() =>
    loadDocumentById(documentId)
  )

  React.useEffect(() => {
    setDocument(loadDocumentById(documentId))
  }, [documentId])

  return (
    <div className={documentDetailStyles.layout}>
      <div className={documentDetailStyles.content}>
        <div className={documentDetailStyles.heading}>
          <p className={documentDetailStyles.eyebrow}>Document</p>
          <h1 className={documentDetailStyles.title}>
            Document {document?.title ?? documentId}
          </h1>
        </div>
        <DocumentEditorShell
          documentId={documentId}
          initialDocument={document}
        />
      </div>
      <DocumentMetadataPanel documentId={documentId} document={document} />
    </div>
  )
}

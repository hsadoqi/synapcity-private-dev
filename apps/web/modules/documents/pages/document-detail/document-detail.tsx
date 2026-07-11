"use client"

import * as React from "react"

import { DocumentEditorShell } from "./components/document-editor-shell"
import { documentDetailStyles } from "./document-detail.styles"
import { loadDocumentById } from "@/modules/documents/services/document-data"
interface DocumentDetailPageProps {
  documentId: string
}

export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  const document = React.useMemo(
    () => loadDocumentById(documentId),
    [documentId]
  )

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
          key={documentId}
          documentId={documentId}
          initialDocument={document}
        />
      </div>
    </div>
  )
}

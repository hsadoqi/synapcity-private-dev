"use client"

import * as React from "react"

import { DocumentEditorShell } from "./components/document-editor-shell"
import { loadDocumentById } from "@/modules/documents/services/document-data"
import { Clock } from "lucide-react"
interface DocumentDetailPageProps {
  documentId: string
}

const DocumentHeader = ({
  metadata: { id: documentId },
}: {
  metadata: {
    id: string
  }
}) => (
  <div className="flex flex-col items-start gap-4">
    <p className="text-xs text-muted-foreground uppercase">Document</p>
    <h1 className="text-xl font-semibold tracking-tight md:text-3xl">
      Document {documentId}
    </h1>
    <span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3" />
        July 11, 2026
      </span>
    </span>
  </div>
)

export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  const document = React.useMemo(
    () => loadDocumentById(documentId),
    [documentId]
  )

  return (
    <div className="mt-12 flex flex-1 justify-center gap-8 overflow-hidden p-6 md:p-12">
      <div className="flex w-full max-w-7xl flex-1 flex-col gap-8 transition-transform duration-300 ease-linear xl:h-full">
        <DocumentHeader
          metadata={{
            id: documentId,
          }}
        />
        <DocumentEditorShell
          key={documentId}
          documentId={documentId}
          initialDocument={document}
        />
      </div>
      {/* <DocumentMetadataPanel documentId={documentId} document={document} /> */}
    </div>
  )
}

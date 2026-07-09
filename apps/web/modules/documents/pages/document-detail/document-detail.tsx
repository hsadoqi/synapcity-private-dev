import { DocumentEditorShell } from "./components/document-editor-shell"
import { DocumentMetadataPanel } from "./components/document-metadata-panel"

interface DocumentDetailPageProps {
  documentId: string
}

export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Document</p>
          <h1 className="text-3xl font-semibold tracking-tight">Document {documentId}</h1>
        </div>
        <DocumentEditorShell documentId={documentId} />
      </div>
      <DocumentMetadataPanel documentId={documentId} />
    </div>
  )
}

// SUPERSEDED — kept only because file deletion wasn't approved in this
// session. This was already unused before this pass (never imported by
// document-detail.tsx). Its role is now covered by the "Properties" tab in
// `document-context-panel.tsx`, registered into the shared context panel
// by `document-workspace.tsx`. Safe to delete.
import type { DocumentRecord } from "@/modules/documents/types"

interface DocumentMetadataPanelProps {
  documentId: string
  document?: DocumentRecord | null
}

export function DocumentMetadataPanel({
  documentId,
  document,
}: DocumentMetadataPanelProps) {
  return (
    <aside className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">Metadata</p>
      <h2 className="mt-1 text-lg font-medium">Document details</h2>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div>Document ID: {documentId}</div>
        <div>Title: {document?.title ?? "Pending"}</div>
        <div>
          Updated:{" "}
          {document?.updatedAt
            ? new Date(document.updatedAt).toLocaleDateString()
            : "Pending"}
        </div>
        <div>Theme assignment: pending</div>
        <div>Relationships: minimal support only</div>
      </div>
    </aside>
  )
}

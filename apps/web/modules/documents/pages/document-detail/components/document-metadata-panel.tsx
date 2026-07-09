interface DocumentMetadataPanelProps {
  documentId: string
}

export function DocumentMetadataPanel({ documentId }: DocumentMetadataPanelProps) {
  return (
    <aside className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">Metadata</p>
      <h2 className="mt-1 text-lg font-medium">Document details</h2>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div>Document ID: {documentId}</div>
        <div>Theme assignment: pending</div>
        <div>Relationships: minimal support only</div>
      </div>
    </aside>
  )
}

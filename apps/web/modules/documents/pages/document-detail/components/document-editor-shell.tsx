interface DocumentEditorShellProps {
  documentId: string
}

export function DocumentEditorShell({ documentId }: DocumentEditorShellProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Editor shell</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Placeholder editor surface for document {documentId}.
          </p>
        </div>
      </div>
    </div>
  )
}

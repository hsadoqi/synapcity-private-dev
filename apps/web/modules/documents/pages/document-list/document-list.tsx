import Link from "next/link"

const sampleDocuments = [
  { id: "doc-1", title: "Product vision", slug: "product-vision" },
  { id: "doc-2", title: "Design principles", slug: "design-principles" },
]

export function DocumentListPage() {
  return (
    <div className={"mx-auto mt-16 w-full max-w-7xl space-y-4 p-6"}>
      <div className={"space-y-1"}>
        <p className="text-sm text-muted-foreground">Documents</p>
        <h1 className={"text-3xl font-semibold tracking-tight"}>
          Document library
        </h1>
      </div>

      <div className="grid gap-3">
        {sampleDocuments.map((document) => (
          <Link
            key={document.id}
            href={`/documents/${document.id}`}
            className="rounded-lg border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary"
          >
            <div className={"font-medium"}>{document.title}</div>
            <div className={"mt-1 text-sm text-muted-foreground"}>
              /{document.slug}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import Link from "next/link"

const sampleDashboards = [
  { id: "db-1", title: "Weekly review", slug: "weekly-review" },
  { id: "db-2", title: "Product launch", slug: "product-launch" },
]

export function DashboardListPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Dashboards</p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard library</h1>
      </div>

      <div className="grid gap-3">
        {sampleDashboards.map((dashboard) => (
          <Link
            key={dashboard.id}
            href={`/dashboards/${dashboard.id}`}
            className="rounded-lg border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary"
          >
            <div className="font-medium">{dashboard.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">/{dashboard.slug}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

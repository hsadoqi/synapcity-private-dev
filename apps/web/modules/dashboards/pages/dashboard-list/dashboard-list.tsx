import Link from "next/link"

import { dashboardListStyles } from "./dashboard-list.styles"

const sampleDashboards = [
  { id: "db-1", title: "Weekly review", slug: "weekly-review" },
  { id: "db-2", title: "Product launch", slug: "product-launch" },
]

export function DashboardListPage() {
  return (
    <div className={dashboardListStyles.page}>
      <div className={dashboardListStyles.heading}>
        <p className="text-sm text-muted-foreground">Dashboards</p>
        <h1 className={dashboardListStyles.title}>Dashboard library</h1>
      </div>

      <div className={dashboardListStyles.list}>
        {sampleDashboards.map((dashboard) => (
          <Link
            key={dashboard.id}
            href={`/dashboards/${dashboard.id}`}
            className={dashboardListStyles.card}
          >
            <div className={dashboardListStyles.cardTitle}>
              {dashboard.title}
            </div>
            <div className={dashboardListStyles.cardMeta}>
              /{dashboard.slug}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

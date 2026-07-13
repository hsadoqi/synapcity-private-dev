import { FileText, LayoutDashboard, LayoutGrid, Notebook } from "lucide-react"
import Link from "next/link"

import { Button } from "@workspace/ui/components"

export type QuickActionItem = {
  title: string
  href: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
}

type QuickActionCardProps = {
  item: QuickActionItem
}

const quickActions: QuickActionItem[] = [
  {
    href: "/documents",
    icon: FileText,
    title: "New Document",
    description: "Open the document workspace to create a new document",
  },
  {
    href: "/dashboards",
    icon: LayoutDashboard,
    title: "New Dashboard",
    description: "Open the dashboard workspace to create a new dashboard",
  },
  {
    href: "/documents",
    icon: Notebook,
    title: "Browse Documents",
    description: "View collection of documents",
  },
  {
    href: "/dashboards",
    icon: LayoutGrid,
    title: "Browse Dashboards",
    description: "View collection of dashboards",
  },
]

function QuickActionCard({ item }: QuickActionCardProps) {
  const Icon = item.icon

  return (
    <Button
      variant="outline"
      className="h-full min-h-28 w-full items-start justify-start p-4 text-left hover:bg-muted"
      asChild
    >
      <Link href={item.href}>
        <div className="flex h-full w-full items-start gap-3">
          {Icon ? (
            <Icon
              data-icon="inline-start"
              className="mt-0.5 text-primary"
              aria-hidden="true"
            />
          ) : null}
          <div className="flex min-w-0 flex-wrap">
            <h3 className="text-sm font-medium">{item.title}</h3>
            {item.description ? (
              <p className="mt-1 text-xs leading-5 whitespace-pre-wrap text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </Button>
  )
}

export const QuickActionsSection = ({
  actions = quickActions,
}: {
  actions?: QuickActionItem[]
}) => {
  return (
    <section
      aria-label="Quick actions"
      className="@container/actions mb-12 flex flex-12 flex-col"
    >
      <div className="@md/home @m/actions:grid-cols-2 grid grid-cols-1 gap-3 @lg/actions:grid-cols-3">
        {actions.map((item) => (
          <QuickActionCard key={`${item.href}-${item.title}`} item={item} />
        ))}
      </div>
    </section>
  )
}

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
          <div className="min-w-0">
            <h3 className="text-sm font-medium">{item.title}</h3>
            {item.description ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
      className="mb-12 grid grid-cols-1 gap-3 @md/home:grid-cols-2 @4xl/home:grid-cols-4"
    >
      {actions.map((item) => (
        <QuickActionCard key={`${item.href}-${item.title}`} item={item} />
      ))}
    </section>
  )
}

import {
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Notebook,
} from "lucide-react"
import { Button } from "@workspace/ui/components"
import Link from "next/link"

export type QuickAction = {
  action: string
  href?: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
  onClick?: () => void
}

const quickActions: QuickAction[] = [
  {
    href: "/documents/new",
    icon: FileText,
    action: "New Document",
    description: "Create a blank document",
  },
  {
    href: "/dashboards/new",
    icon: LayoutDashboard,
    action: "New Dashboard",
    description: "Compose a new dashboard",
  },
  {
    href: "/documents",
    icon: Notebook,
    action: "Browse Documents",
    description: "View collection of documents",
  },
  {
    href: "/dashboards",
    icon: LayoutGrid,
    action: "Browse Dashboards",
    description: "View collection of dashboards",
  },
]

export const QuickActionsSection = ({actions=quickActions}: { actions?: QuickAction[]}) => {
  return (
    <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href ?? "#"}>
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-3 p-6 hover:bg-secondary"
              onClick={action.onClick}
            >
              {Icon && <Icon className="h-6 w-6 text-primary" />}
              <div className="text-left">
                <h3 className="text-sm font-semibold">{action.action}</h3>
                {action.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {action.description}
                  </p>
                )}
              </div>
            </Button>
          </Link>
        )
      })}
    </section>
  )
}

import Link from "next/link"

export default function RootPage() {
  return (
    <div className="h-full w-full space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Phase 0</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Synapcity V0 foundation
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This scaffold establishes the route structure, shell boundaries, core
          module folders, and the initial theme/widget foundations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            href: "/documents",
            label: "Documents",
            description: "Document list and detail shell",
          },
          {
            href: "/dashboards",
            label: "Dashboards",
            description: "Dashboard list and composition placeholder",
          },
          {
            href: "/settings/themes",
            label: "Themes",
            description: "Reusable visual systems and assignments",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary"
          >
            <h2 className="font-medium">{item.label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

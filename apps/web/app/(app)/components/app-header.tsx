"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"

import { getAppRouteContext, isNavItemActive } from "@/modules/routing"

export const AppHeader = () => {
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)

  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {routeContext.title}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {routeContext.description}
          </p>
        </div>

        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap gap-2 text-sm"
        >
          {routeContext.navItems.map((item) => {
            const isActive = isNavItemActive(item, pathname)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 transition-colors hover:bg-muted",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

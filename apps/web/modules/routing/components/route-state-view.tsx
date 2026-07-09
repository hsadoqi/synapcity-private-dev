"use client"

import Link from "next/link"
import type * as React from "react"
import { AlertTriangle, Loader2, SearchX } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

type RouteStateType = "loading" | "error" | "not-found"

type RouteStateViewProps = {
  type: RouteStateType
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

const routeStateDefaults: Record<
  RouteStateType,
  {
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  loading: {
    title: "Loading",
    description: "Preparing this workspace view.",
    icon: Loader2,
  },
  error: {
    title: "Something went wrong",
    description: "The route failed to render. Try again.",
    actionLabel: "Try again",
    icon: AlertTriangle,
  },
  "not-found": {
    title: "Page not found",
    description: "The page you requested does not exist in this workspace.",
    actionLabel: "Back to home",
    actionHref: "/",
    icon: SearchX,
  },
}

export function RouteStateView({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: RouteStateViewProps) {
  const defaults = routeStateDefaults[type]
  const Icon = defaults.icon
  const resolvedActionLabel = actionLabel ?? defaults.actionLabel
  const resolvedActionHref = actionHref ?? defaults.actionHref

  return (
    <div
      className={cn(
        "grid min-h-[60svh] place-items-center px-6 py-16",
        className
      )}
    >
      <section className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <div className="grid size-12 place-items-center rounded-lg border bg-card text-muted-foreground shadow-sm">
          <Icon
            className={cn(
              "size-5",
              type === "loading" ? "animate-spin" : undefined
            )}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {title ?? defaults.title}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {description ?? defaults.description}
          </p>
        </div>

        {resolvedActionLabel && onAction ? (
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={onAction}
          >
            {resolvedActionLabel}
          </button>
        ) : null}

        {resolvedActionLabel && resolvedActionHref && !onAction ? (
          <Link
            href={resolvedActionHref}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {resolvedActionLabel}
          </Link>
        ) : null}
      </section>
    </div>
  )
}

"use client"

import * as React from "react"
import { CircleAlert } from "lucide-react"

import { Button } from "@workspace/ui/components/primitives/button"
import { cn } from "@workspace/ui/lib/utils"

export interface ErrorStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  /** Retry or navigation action */
  action?: React.ReactNode
  /** Show a default "Reload page" button when no custom action is given */
  showReload?: boolean
  className?: string
}

/**
 * Error-themed variant of EmptyState. Shows when a request or operation
 * failed and there's nothing else to render in its place.
 *
 * @example
 * <ErrorState
 *   title="Couldn't load documents"
 *   description={error.message}
 *   action={<Button size="sm" onClick={retry}>Try again</Button>}
 * />
 */
export const ErrorState = React.memo(function ErrorState({
  icon,
  title,
  description,
  action,
  showReload = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="mb-4 text-destructive/60">
        {icon ?? <CircleAlert className="size-10" aria-hidden />}
      </div>
      <h3 className="font-heading text-sm font-medium text-destructive">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-md text-xs/relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? (
        <div className="mt-6">{action}</div>
      ) : showReload ? (
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </div>
      ) : null}
    </div>
  )
})

/**
 * React error boundary with a fallback UI. Catches render errors in its
 * subtree and shows ErrorState (or a custom fallback) instead of taking
 * down the whole app.
 *
 * @example
 * <ErrorBoundary fallback={<ErrorState title="Something broke" />}>
 *   <DocumentEditor />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: undefined }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorState
            title="Something went wrong"
            description={this.state.error?.message}
            showReload
          />
        )
      )
    }
    return this.props.children
  }
}

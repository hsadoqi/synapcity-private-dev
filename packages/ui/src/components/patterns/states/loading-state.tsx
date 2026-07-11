"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Skeleton } from "@workspace/ui/components/primitives/skeleton"
import { cn } from "@workspace/ui/lib/utils"

export interface LoadingStateProps {
  isLoading: boolean
  /** Skeleton/placeholder to show while loading. Falls back to a spinner. */
  skeleton?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/**
 * Renders a skeleton (or spinner, if none given) while isLoading is true,
 * then swaps to children once it's false. Keeps layout stable across the
 * transition when a skeleton is provided.
 *
 * @example
 * <LoadingState isLoading={isLoading} skeleton={<PageHeaderSkeleton />}>
 *   <PageHeader title={document.title} description={document.summary} />
 * </LoadingState>
 */
export function LoadingState({
  isLoading,
  skeleton,
  children,
  className,
}: LoadingStateProps) {
  if (!isLoading) return <>{children}</>

  if (skeleton) {
    return (
      <div className={cn("flex flex-col", className)} aria-busy="true" aria-live="polite">
        {skeleton}
      </div>
    )
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center py-12", className)}
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
    </div>
  )
}

// --------------------------------
// Pre-built skeleton variants
// --------------------------------

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between border-b border-border pb-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  )
}

export function EmptyStateSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Skeleton className="mb-4 size-10" />
      <Skeleton className="mb-2 h-5 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 rounded-none border border-border bg-card p-6", className)}>
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  )
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      <Skeleton className="size-9" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-none border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="size-4" />
      </div>
      <Skeleton className="mt-3 h-7 w-24" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  )
}

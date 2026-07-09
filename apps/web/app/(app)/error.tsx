"use client"

import { useEffect } from "react"

import { RouteStateView } from "@/modules/routing"

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <RouteStateView type="error" onAction={unstable_retry} />
}

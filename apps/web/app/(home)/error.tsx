"use client"

import { Button, ErrorState } from "@workspace/ui/components"

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-1 items-center justify-center p-6 md:p-12">
      <ErrorState
        title="Couldn’t load this workspace"
        description={error.message || "Please try again."}
        action={
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Try again
          </Button>
        }
      />
    </div>
  )
}

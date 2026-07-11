import {
  CardSkeleton,
  LoadingState,
  PageHeaderSkeleton,
} from "@workspace/ui/components"

export default function PageLoading() {
  return (
    <LoadingState isLoading skeleton={(
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 p-6 md:p-12">
        <PageHeaderSkeleton />
        <div className="grid gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>)}
      />
  )
}

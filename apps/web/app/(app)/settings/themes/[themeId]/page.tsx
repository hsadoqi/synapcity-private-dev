import Link from "next/link"

import { Button } from "@workspace/ui/components/primitives/button"

export default async function ThemeDetailPage(
  props: { params: Promise<{ themeId: string }> }
) {
  const { themeId } = await props.params

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-6 md:px-6">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{themeId}</p>
        <h1 className="text-xl font-semibold tracking-normal text-foreground">
          Theme builder
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Saved-theme editing opens in the builder in a later batch.
        </p>
      </div>
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings/themes">Back to Themes</Link>
        </Button>
      </div>
    </section>
  )
}

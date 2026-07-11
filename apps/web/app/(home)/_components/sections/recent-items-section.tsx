export type RecentItem = {
  href: string
  title: string
  description?: string
}

export const RecentItemsSection = ({
  items = [],
}: {
  items?: RecentItem[]
}) => {
  if (items.length === 0) {
    return (
      <section className="border-t pt-6">
        <h2 className="text-sm font-medium text-foreground">Recent Items</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          No recent items yet. Create your first document or dashboard to get
          started.
        </p>
      </section>
    )
  }
  return null
}

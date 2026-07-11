export type RecentItem = {
    href: string;
    title: string;
    description?: string;
}

export const RecentItemsSection = ({ items = [] }: { items?: RecentItem[] }) => {
    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-border bg-card p-8">
                <h2 className="mb-4 text-sm font-semibold text-foreground">
                    Recent Items
                </h2>
                <p className="text-sm text-muted-foreground">
                    No recent items yet. Create your first document or dashboard to get
                    started.
                </p>
            </div>
        )
    }
    return null;
}
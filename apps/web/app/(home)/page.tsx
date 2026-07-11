import { QuickActionsSection } from "./_components/sections/quick-actions-section"
import { RecentItemsSection } from "./_components/sections/recent-items-section"

export default function HomePage() {
  return (
    <div className="@container/home min-h-full">
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center px-6 py-12 lg:px-8 lg:py-16">
        <div className="w-full">
          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome to Synapcity
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your personal knowledge, document, dashboard, and composition
              workspace. Create, organize, and explore your ideas with calm,
              editorial clarity.
            </p>
          </div>

          <QuickActionsSection />
          <RecentItemsSection />
        </div>
      </div>
    </div>
  )
}

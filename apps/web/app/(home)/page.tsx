import { QuickActionsSection } from "./_components/sections/quick-actions-section";
import { RecentItemsSection } from "./_components/sections/recent-items-section";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-2xl text-center">
          <h1 className="mb-2 text-3xl font-semibold text-foreground">
            Welcome to Synapcity
          </h1>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground">
            Your personal knowledge, document, dashboard, and composition
            workspace. Create, organize, and explore your ideas with calm,
            editorial clarity.
          </p>

          <QuickActionsSection />
          <RecentItemsSection />
        </div>
      </div>
    </div>
  )
}

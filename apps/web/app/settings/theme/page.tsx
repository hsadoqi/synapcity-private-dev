import { ThemeScopeProvider, DEFAULT_THEME_RECORD } from "@/modules/theme"

export default function ThemeSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Theme</p>
        <h1 className="text-3xl font-semibold tracking-tight">Theme test and settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Runtime palette generation and scoped theme plumbing are scaffolded here.
        </p>
      </div>

      <ThemeScopeProvider theme={DEFAULT_THEME_RECORD} className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="text-sm text-muted-foreground">Primary palette</div>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-10 w-10 rounded-full border border-border" style={{ backgroundColor: `var(--primary-${(index + 2) * 100})` }} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="text-sm text-muted-foreground">Accent palette</div>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-10 w-10 rounded-full border border-border" style={{ backgroundColor: `var(--accent-${(index + 2) * 100})` }} />
              ))}
            </div>
          </div>
        </div>
      </ThemeScopeProvider>
    </div>
  )
}

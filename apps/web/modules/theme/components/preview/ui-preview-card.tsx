"use client"

interface UiPreviewCardProps {
  primaryColor: string
  accentColor: string
  baseSize?: number
}

const semanticColors = [
  {
    label: "Success",
    color: "#16A34A",
    background: "#F0FDF4",
  },
  {
    label: "Warning",
    color: "#D97706",
    background: "#FFFBEB",
  },
  {
    label: "Error",
    color: "#DC2626",
    background: "#FEF2F2",
  },
  {
    label: "Info",
    color: "#2563EB",
    background: "#EFF6FF",
  },
]

function hexToRgba(hex: string, alpha: number) {
  const normalizedHex = hex.replace("#", "")

  if (!/^[0-9A-Fa-f]{6}$/.test(normalizedHex)) {
    return hex
  }

  const value = Number.parseInt(normalizedHex, 16)

  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function UiPreviewCard({
  primaryColor,
  accentColor,
  baseSize = 16,
}: UiPreviewCardProps) {
  return (
    <section
      className="rounded-xl border border-border bg-card p-4 lg:col-span-2"
      style={{ fontSize: `${baseSize}px` }}
    >
      <div className="mb-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        Preview
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="grid gap-6 border-b border-border p-5 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="space-y-5">
            <div className="space-y-2">
              <h3
                className="font-semibold tracking-tight text-foreground"
                style={{
                  fontSize: `${baseSize * 1.75}px`,
                  lineHeight: 1.15,
                }}
              >
                Design that feels like you
              </h3>

              <p
                className="max-w-xl text-muted-foreground"
                style={{
                  fontSize: `${baseSize * 0.875}px`,
                  lineHeight: 1.65,
                }}
              >
                A quick preview of how your colors and typography work together
                across realistic interface elements.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Primary button
              </button>

              <button
                type="button"
                className="rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                Outlined
              </button>

              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: hexToRgba(primaryColor, 0.1),
                  color: primaryColor,
                }}
              >
                Ghost
              </button>

              <button
                type="button"
                aria-label="Save preview"
                className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
              >
                ♡
              </button>
            </div>
          </div>

          <div
            className="relative min-h-36 overflow-hidden rounded-lg border border-border"
            style={{
              background: `linear-gradient(
                145deg,
                ${hexToRgba(primaryColor, 0.08)},
                ${hexToRgba(accentColor, 0.2)}
              )`,
            }}
          >
            <div
              className="absolute top-6 left-8 size-5 rounded-full"
              style={{
                backgroundColor: hexToRgba(accentColor, 0.4),
              }}
            />

            <div
              className="absolute -bottom-10 left-6 size-28 rotate-45 rounded-2xl"
              style={{
                backgroundColor: hexToRgba(primaryColor, 0.16),
              }}
            />

            <div
              className="absolute right-3 -bottom-8 size-36 rotate-45 rounded-2xl"
              style={{
                backgroundColor: hexToRgba(accentColor, 0.18),
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          {semanticColors.map((tone) => (
            <div
              key={tone.label}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium"
              style={{
                color: tone.color,
                backgroundColor: tone.background,
              }}
            >
              <span
                className="grid size-4 place-items-center rounded-full text-[10px] text-white"
                style={{ backgroundColor: tone.color }}
              >
                ✓
              </span>

              {tone.label}
            </div>
          ))}

          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="h-5 w-1 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            Accent line
          </div>
        </div>

        <div className="grid border-b border-border md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
          <div className="space-y-2 border-b border-border p-5 md:border-r md:border-b-0">
            <h4 className="text-base font-semibold text-foreground">
              Project overview
            </h4>

            <p className="text-sm leading-6 text-muted-foreground">
              Review key metrics and recent activity across your projects.
            </p>

            <button
              type="button"
              className="text-sm font-medium"
              style={{ color: primaryColor }}
            >
              View all projects →
            </button>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border p-5">
            {[
              {
                label: "Users",
                value: "12,684",
                change: "↑ 12%",
                positive: true,
              },
              {
                label: "Sessions",
                value: "8,432",
                change: "↑ 8%",
                positive: true,
              },
              {
                label: "Bounce rate",
                value: "24.6%",
                change: "↓ 3%",
                positive: false,
              },
            ].map((metric) => (
              <div key={metric.label} className="px-4 first:pl-0 last:pr-0">
                <div className="text-xs text-muted-foreground">
                  {metric.label}
                </div>

                <div className="mt-1 text-xl font-semibold text-foreground">
                  {metric.value}
                </div>

                <div
                  className={
                    metric.positive
                      ? "mt-2 text-xs font-medium text-emerald-600"
                      : "mt-2 text-xs font-medium text-red-600"
                  }
                >
                  {metric.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-base font-semibold text-foreground">
              Recent activity
            </h4>

            <button
              type="button"
              className="text-sm font-medium"
              style={{ color: primaryColor }}
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-border">
            {[
              {
                initials: "S",
                name: "Sarah Johnson",
                email: "sarah@example.com",
                action: "Created a new project",
                time: "2 minutes ago",
                status: "Active",
                statusColor: "#16A34A",
              },
              {
                initials: "M",
                name: "Michael Chen",
                email: "michael@example.com",
                action: "Updated billing information",
                time: "34 minutes ago",
                status: "Pending",
                statusColor: "#D97706",
              },
            ].map((item) => (
              <div
                key={item.email}
                className="grid gap-3 py-3 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-medium"
                    style={{
                      color: accentColor,
                      backgroundColor: hexToRgba(accentColor, 0.14),
                    }}
                  >
                    {item.initials}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {item.name}
                    </div>

                    <div className="truncate text-xs text-muted-foreground">
                      {item.email}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-foreground">{item.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.time}
                  </div>
                </div>

                <div
                  className="w-fit rounded-md px-2.5 py-1 text-xs font-medium"
                  style={{
                    color: item.statusColor,
                    backgroundColor: hexToRgba(item.statusColor, 0.1),
                  }}
                >
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

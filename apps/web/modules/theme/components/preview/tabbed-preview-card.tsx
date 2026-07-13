"use client"

import { useMemo, useState } from "react"

interface TabbedThemePreviewCardProps {
  primaryColor: string
  accentColor: string
  baseSize?: number
}

type PreviewTab = "preview" | "tokens"

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

export function TabbedPreviewCard({
  primaryColor,
  accentColor,
  baseSize = 16,
}: TabbedThemePreviewCardProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("preview")

  const typographyScale = useMemo(
    () => [
      {
        name: "Display",
        size: baseSize * 3,
        lineHeight: 1.05,
      },
      {
        name: "H1",
        size: baseSize * 2.5,
        lineHeight: 1.1,
      },
      {
        name: "H2",
        size: baseSize * 2,
        lineHeight: 1.15,
      },
      {
        name: "H3",
        size: baseSize * 1.5,
        lineHeight: 1.2,
      },
      {
        name: "Body",
        size: baseSize,
        lineHeight: 1.5,
      },
      {
        name: "Small",
        size: baseSize * 0.875,
        lineHeight: 1.5,
      },
      {
        name: "XSmall",
        size: baseSize * 0.75,
        lineHeight: 1.5,
      },
    ],
    [baseSize]
  )

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2"
      style={{ fontSize: `${baseSize}px` }}
    >
      <div
        role="tablist"
        aria-label="Theme preview sections"
        className="flex border-b border-border px-4"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "preview"}
          onClick={() => setActiveTab("preview")}
          className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium"
          style={{
            color:
              activeTab === "preview"
                ? primaryColor
                : "hsl(var(--muted-foreground))",
          }}
        >
          <span aria-hidden="true">▣</span>
          UI Preview
          {activeTab === "preview" && (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5"
              style={{ backgroundColor: primaryColor }}
            />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tokens"}
          onClick={() => setActiveTab("tokens")}
          className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium"
          style={{
            color:
              activeTab === "tokens"
                ? primaryColor
                : "hsl(var(--muted-foreground))",
          }}
        >
          <span aria-hidden="true">☷</span>
          Tokens
          {activeTab === "tokens" && (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5"
              style={{ backgroundColor: primaryColor }}
            />
          )}
        </button>
      </div>

      {activeTab === "preview" ? (
        <div role="tabpanel" className="p-4">
          <div className="grid overflow-hidden rounded-xl border border-border bg-background md:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.8fr)]">
            <div className="space-y-5 p-5">
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
                  A quick preview of how your colors and typography work
                  together.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Primary button
                </button>

                <button
                  type="button"
                  className="rounded-md border px-4 py-2 text-sm font-medium"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  Outlined
                </button>

                <button
                  type="button"
                  className="rounded-md px-4 py-2 text-sm font-medium"
                  style={{
                    color: primaryColor,
                    backgroundColor: hexToRgba(primaryColor, 0.1),
                  }}
                >
                  Ghost
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
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
                      className="size-2 rounded-full"
                      style={{ backgroundColor: tone.color }}
                    />

                    {tone.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-5 md:border-t-0 md:border-l">
              <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Card title
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      This is an example card using your theme. It shows how
                      cards look with text and a call to action.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Card options"
                    className="text-muted-foreground"
                  >
                    •••
                  </button>
                </div>

                <button
                  type="button"
                  className="mt-auto w-full rounded-md px-4 py-2.5 text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Take action
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="tabpanel"
          className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0"
        >
          <div className="p-5">
            <h3 className="mb-5 text-sm font-semibold text-foreground">
              Typography scale
            </h3>

            <div className="space-y-4">
              {typographyScale.map((scale) => (
                <div
                  key={scale.name}
                  className="grid grid-cols-[4.5rem_minmax(0,1fr)_3rem] items-baseline gap-3"
                >
                  <span className="text-xs text-muted-foreground">
                    {scale.name}
                  </span>

                  <span
                    className="min-w-0 truncate font-semibold text-foreground"
                    style={{
                      fontSize: `${scale.size}px`,
                      lineHeight: scale.lineHeight,
                    }}
                  >
                    The quick brown fox
                  </span>

                  <span className="text-right text-xs text-muted-foreground">
                    {Math.round(scale.size)}px
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 p-5">
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Color usage
              </h3>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground">
                    Primary
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Button
                    </div>

                    <div
                      className="rounded-md border px-3 py-1.5 text-xs font-medium"
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                      }}
                    >
                      Outline
                    </div>

                    <div
                      className="rounded-md px-3 py-1.5 text-xs font-medium"
                      style={{
                        color: primaryColor,
                        backgroundColor: hexToRgba(primaryColor, 0.1),
                      }}
                    >
                      Ghost
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground">
                    Accent
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      Badge
                    </div>

                    <div
                      className="rounded-md px-2.5 py-1 text-xs font-medium"
                      style={{
                        color: accentColor,
                        backgroundColor: hexToRgba(accentColor, 0.1),
                      }}
                    >
                      Label
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="h-5 w-1 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      Accent line
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground">
                    Semantic
                  </div>

                  <div className="flex flex-wrap gap-2">
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
                          className="size-2 rounded-full"
                          style={{ backgroundColor: tone.color }}
                        />

                        {tone.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground">
                    Surfaces
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[
                      {
                        label: "Background",
                        className: "bg-background",
                      },
                      {
                        label: "Card",
                        className: "bg-card",
                      },
                      {
                        label: "Border",
                        className: "bg-border",
                      },
                      {
                        label: "Muted",
                        className: "bg-muted",
                      },
                      {
                        label: "Text",
                        className: "bg-foreground",
                      },
                    ].map((surface) => (
                      <div key={surface.label} className="min-w-0">
                        <div
                          className={`aspect-square rounded-md border border-border ${surface.className}`}
                        />

                        <div className="mt-1 truncate text-[10px] text-muted-foreground">
                          {surface.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

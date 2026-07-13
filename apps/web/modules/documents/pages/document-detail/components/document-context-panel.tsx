"use client"

import * as React from "react"
import Link from "next/link"
import { Hash, Link2, ListTree, SlidersHorizontal } from "lucide-react"

import { ScrollArea, ToggleGroup, ToggleGroupItem } from "@workspace/ui/components"
import { cn } from "@workspace/ui/lib/utils"

import type {
  OutlineEntry,
  PropertyEntry,
  RelatedDocumentEntry,
} from "./document-context-panel-data"

type PanelTabId = "outline" | "properties" | "related"

const TABS: { id: PanelTabId; label: string; icon: typeof ListTree }[] = [
  { id: "outline", label: "Outline", icon: ListTree },
  { id: "properties", label: "Properties", icon: SlidersHorizontal },
  { id: "related", label: "Related", icon: Link2 },
]

interface DocumentContextPanelProps {
  outline: OutlineEntry[]
  properties: PropertyEntry[]
  related: RelatedDocumentEntry[]
  onSelectOutlineEntry: (entry: OutlineEntry) => void
}

/**
 * Document-level context only — nothing here reflects editor selection or
 * active block (that's a future "inspector" extension once Lexical exposes
 * selection state; see the module README).
 */
export function DocumentContextPanel({
  outline,
  properties,
  related,
  onSelectOutlineEntry,
}: DocumentContextPanelProps) {
  const [activeTab, setActiveTab] = React.useState<PanelTabId>("outline")
  const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label ?? ""

  // Note on semantics: this is a segmented control (Radix ToggleGroup), not
  // ARIA tabs (no role="tablist"/"tab"/"tabpanel") — there's no Tabs
  // primitive in the design system yet, and bolting tab roles onto a
  // toggle-group primitive that doesn't implement the matching keyboard
  // model (arrow-key roving tabindex, etc.) would be less accessible than
  // an honestly-labeled segmented control. The group has an accessible
  // name, and the content region below announces which section is active.
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b p-2">
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(value) => {
            if (value) setActiveTab(value as PanelTabId)
          }}
          variant="outline"
          className="w-full"
          aria-label="Document panel section"
        >
          {TABS.map((tab) => (
            <ToggleGroupItem
              key={tab.id}
              value={tab.id}
              aria-label={tab.label}
              className="flex-1 gap-1.5"
            >
              <tab.icon className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{tab.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3" role="region" aria-label={activeTabLabel}>
          {activeTab === "outline" && (
            <OutlineTab entries={outline} onSelect={onSelectOutlineEntry} />
          )}
          {activeTab === "properties" && <PropertiesTab entries={properties} />}
          {activeTab === "related" && <RelatedTab entries={related} />}
        </div>
      </ScrollArea>
    </div>
  )
}

function OutlineTab({
  entries,
  onSelect,
}: {
  entries: OutlineEntry[]
  onSelect: (entry: OutlineEntry) => void
}) {
  if (entries.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-xs text-muted-foreground">
        Headings you add to the document will show up here.
      </p>
    )
  }

  return (
    <nav aria-label="Document outline" className="flex flex-col gap-0.5">
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onSelect(entry)}
          className={cn(
            "truncate rounded-none px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            entry.depth === 1 && "font-medium text-foreground",
            entry.depth === 2 && "ml-3",
            entry.depth === 3 && "ml-6 text-xs"
          )}
        >
          {entry.label}
        </button>
      ))}
    </nav>
  )
}

function PropertiesTab({ entries }: { entries: PropertyEntry[] }) {
  return (
    <dl className="flex flex-col gap-3">
      {entries.map((entry) => (
        <div key={entry.label} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">{entry.label}</dt>
          <dd className="truncate text-sm text-foreground">{entry.value}</dd>
        </div>
      ))}
      <div className="mt-1 flex items-start gap-2 border-t pt-3 text-xs text-muted-foreground">
        <Hash className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
        <span>
          Theme assignment and richer properties arrive alongside the
          document data model rework.
        </span>
      </div>
    </dl>
  )
}

function RelatedTab({ entries }: { entries: RelatedDocumentEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-xs text-muted-foreground">
        No related documents yet.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-1">
      {entries.map((entry) => (
        <li key={entry.id}>
          <Link
            href={`/documents/${entry.id}`}
            className="flex flex-col gap-0.5 rounded-none px-2 py-1.5 transition-colors hover:bg-muted"
          >
            <span className="truncate text-sm font-medium text-foreground">
              {entry.title}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {entry.reason}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

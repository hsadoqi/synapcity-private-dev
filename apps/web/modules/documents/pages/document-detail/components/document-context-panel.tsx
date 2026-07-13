"use client"

import * as React from "react"
import Link from "next/link"
import { Hash, Link2, ListTree, SlidersHorizontal } from "lucide-react"
import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core"
import { useTree } from "@headless-tree/react"

import {
  ScrollArea,
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components"
import {
  Tree,
  TreeItem,
  TreeItemLabel,
} from "@workspace/ui/components/reui/tree"

import type { OutlineEntry } from "@/modules/documents/editor/derive-outline"
import type {
  PropertyEntry,
  RelatedDocumentEntry,
} from "./document-context-panel-data"

export type DocumentContextSectionId = "outline" | "properties" | "related"

const DOCUMENT_CONTEXT_SECTIONS: ReadonlyArray<{
  id: DocumentContextSectionId
  label: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}> = [
  { id: "outline", label: "Outline", icon: ListTree },
  { id: "properties", label: "Properties", icon: SlidersHorizontal },
  { id: "related", label: "Related", icon: Link2 },
]

interface DocumentContextPanelProps {
  activeSection: DocumentContextSectionId
  onActiveSectionChange: (section: DocumentContextSectionId) => void
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
  activeSection,
  onActiveSectionChange,
  outline,
  properties,
  related,
  onSelectOutlineEntry,
}: DocumentContextPanelProps) {
  const activeSectionLabel =
    DOCUMENT_CONTEXT_SECTIONS.find((section) => section.id === activeSection)
      ?.label ?? ""

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b p-2">
        <ToggleGroup
          type="single"
          value={activeSection}
          onValueChange={(value) => {
            if (value) {
              onActiveSectionChange(value as DocumentContextSectionId)
            }
          }}
          variant="outline"
          className="w-full"
          aria-label="Document panel section"
        >
          {DOCUMENT_CONTEXT_SECTIONS.map((section) => (
            <ToggleGroupItem
              key={section.id}
              value={section.id}
              aria-label={section.label}
              className="flex-1 gap-1.5"
            >
              <section.icon className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{section.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3" role="region" aria-label={activeSectionLabel}>
          {activeSection === "outline" && (
            <OutlineTab entries={outline} onSelect={onSelectOutlineEntry} />
          )}
          {activeSection === "properties" && (
            <PropertiesTab entries={properties} />
          )}
          {activeSection === "related" && <RelatedTab entries={related} />}
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
    <nav aria-label="Document outline">
      <OutlineTree
        key={getOutlineStructureKey(entries)}
        entries={entries}
        onSelect={onSelect}
      />
    </nav>
  )
}

interface OutlineTreeItemData {
  name: string
  children: string[]
  entry?: OutlineEntry
}

const OUTLINE_ROOT_ID = "document-outline-root"

function createOutlineTreeData(entries: OutlineEntry[]) {
  const items: Record<string, OutlineTreeItemData> = {
    [OUTLINE_ROOT_ID]: {
      name: "Document outline",
      children: entries.map((entry) => entry.nodeKey),
    },
  }
  const expandedItems: string[] = []

  const visit = (entry: OutlineEntry) => {
    const children = entry.children.map((child) => child.nodeKey)
    items[entry.nodeKey] = {
      name: entry.label,
      children,
      entry,
    }
    if (children.length > 0) expandedItems.push(entry.nodeKey)
    entry.children.forEach(visit)
  }

  entries.forEach(visit)
  return { items, expandedItems }
}

function getOutlineStructureKey(entries: OutlineEntry[]) {
  const keys: string[] = []
  const visit = (entry: OutlineEntry) => {
    keys.push(`${entry.nodeKey}:${entry.depth}`)
    entry.children.forEach(visit)
  }
  entries.forEach(visit)
  return keys.join("|")
}

function OutlineTree({
  entries,
  onSelect,
}: {
  entries: OutlineEntry[]
  onSelect: (entry: OutlineEntry) => void
}) {
  const { items, expandedItems } = React.useMemo(
    () => createOutlineTreeData(entries),
    [entries]
  )
  const tree = useTree<OutlineTreeItemData>({
    initialState: { expandedItems },
    rootItemId: OUTLINE_ROOT_ID,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children.length > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId]!,
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    onPrimaryAction: (item) => {
      const entry = item.getItemData().entry
      if (entry) onSelect(entry)
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  })

  return (
    <Tree tree={tree} indent={12} aria-label="Document headings">
      {tree.getItems().map((item) => {
        const entry = item.getItemData().entry
        return (
          <TreeItem key={item.getId()} item={item} className="w-full">
            <TreeItemLabel
              className={
                entry?.depth === 1
                  ? "font-medium text-foreground"
                  : entry?.depth === 3
                    ? "text-xs"
                    : "text-muted-foreground"
              }
            />
          </TreeItem>
        )
      })}
    </Tree>
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

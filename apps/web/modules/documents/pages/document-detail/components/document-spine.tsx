import * as React from "react"
import { Plus } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import type { OutlineEntry } from "@/modules/documents/editor/derive-outline"

interface DocumentSpineProps {
  outline: OutlineEntry[]
  onSelectIntro: () => void
  onSelectEntry: (entry: OutlineEntry) => void
  className?: string
}

/**
 * Flattens H2 sections out of the outline tree in document order,
 * regardless of nesting depth (a document's own H1 title nests its H2
 * sections as children — see `derive-outline.ts`). H3s are intentionally
 * excluded: the spine numbers top-level sections, not every subheading.
 */
export function collectSpineSections(entries: OutlineEntry[]): OutlineEntry[] {
  const sections: OutlineEntry[] = []
  for (const entry of entries) {
    if (entry.depth === 2) sections.push(entry)
    sections.push(...collectSpineSections(entry.children))
  }
  return sections
}

export function DocumentSpineHeader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-5.5 shrink-0 items-center border-r border-b border-border px-3",
        className
      )}
    >
      <span className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground/60 uppercase">
        Spine
      </span>
    </div>
  )
}

/** Real navigation over the document's own headings — no placeholder rows. */
export function DocumentSpine({
  outline,
  onSelectIntro,
  onSelectEntry,
  className,
}: DocumentSpineProps) {
  const sections = React.useMemo(() => collectSpineSections(outline), [outline])

  return (
    <nav
      aria-label="Document sections"
      className={cn(
        "flex w-36 shrink-0 flex-col overflow-y-auto border-r border-border py-2",
        className
      )}
    >
      <button
        type="button"
        onClick={onSelectIntro}
        className="group flex items-center gap-2 rounded px-3 py-1.5 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus
          className="size-3 shrink-0 text-muted-foreground/50 group-hover:text-primary"
          aria-hidden="true"
        />
        Intro
      </button>

      {sections.length > 0 && (
        <ol className="relative mt-1 ml-[15px] flex flex-col border-l border-border">
          {sections.map((section, index) => (
            <li key={section.nodeKey}>
              <button
                type="button"
                onClick={() => onSelectEntry(section)}
                className="group flex w-full items-start gap-2 py-2 pr-2 pl-3 text-left"
              >
                <span className="text-[10px] tabular-nums text-muted-foreground/50 group-hover:text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                  {section.label.toUpperCase()}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </nav>
  )
}

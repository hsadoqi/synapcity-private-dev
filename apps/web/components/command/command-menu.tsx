"use client"

import { useState, useEffect, useMemo } from "react"
import { useCommand } from "./command-context"
import { Search, X } from "lucide-react"
import { Input } from "@workspace/ui/components"

export function CommandMenu() {
  const { open, setOpen, commands } = useCommand()
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const filtered = commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(search.toLowerCase())
    )

    const groups: Record<string, typeof filtered> = {}
    filtered.forEach((cmd) => {
      const category = cmd.category || "General"
      if (!groups[category]) groups[category] = []
      groups[category].push(cmd)
    })
    return groups
  }, [commands, search])

  const flatCommands = useMemo(() => {
    return Object.values(groupedCommands).flat()
  }, [groupedCommands])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % flatCommands.length)
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(
          (prev) => (prev - 1 + flatCommands.length) % flatCommands.length
        )
      }

      if (e.key === "Enter") {
        e.preventDefault()
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action()
          setOpen(false)
          setSearch("")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, flatCommands, selectedIndex, setOpen])

  // Global command trigger (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(!open)
        setSearch("")
        setSelectedIndex(0)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Command menu */}
      <div
        className="relative mx-4 w-full max-w-2xl rounded-lg border border-border bg-card shadow-lg"
        role="dialog"
        aria-labelledby="command-input"
        aria-modal="true"
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            id="command-input"
            autoFocus
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            className="border-0 bg-transparent px-3 outline-none"
            aria-label="Search commands"
          />
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {flatCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No commands found.
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const globalIdx = flatCommands.findIndex(
                    (c) => c.id === cmd.id
                  )
                  const isSelected = globalIdx === selectedIndex

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action()
                        setOpen(false)
                        setSearch("")
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {cmd.icon && (
                            <span className="shrink-0">{cmd.icon}</span>
                          )}
                          <div>
                            <div className="font-medium">{cmd.label}</div>
                            {cmd.description && (
                              <div className="text-xs text-muted-foreground">
                                {cmd.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {cmd.shortcut && (
                          <div className="font-mono text-xs text-muted-foreground">
                            {cmd.shortcut}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <div>
            <span className="font-mono">↑↓</span> to navigate •{" "}
            <span className="font-mono">↵</span> to select •{" "}
            <span className="font-mono">esc</span> to close
          </div>
        </div>
      </div>
    </div>
  )
}

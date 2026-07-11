"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Filter, Plus, Search } from "lucide-react"

import { Button } from "@workspace/ui/components/primitives/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/primitives/dialog"
import { Input } from "@workspace/ui/components/primitives/input"
import { Label } from "@workspace/ui/components/primitives/label"
import { Textarea } from "@workspace/ui/components/primitives/textarea"

import { useThemes } from "../../hooks/use-themes"
import type { ThemeRecord } from "../../types"
import {
  buildThemeDuplicate,
  getThemeLibraryRows,
  getThemeUsageSummary,
  type ThemeLibraryFilter,
  type ThemeLibrarySort,
} from "./theme-library-model"
import { ThemeLibraryRow } from "./theme-library-row"

function createThemeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `theme-${crypto.randomUUID()}`
  }

  return `theme-${Date.now().toString(36)}`
}

function ThemeLibrarySkeleton() {
  return (
    <div className="border-y border-border" aria-label="Loading themes">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-16 grid-cols-[4.5rem_minmax(0,1fr)_8rem_5rem_2.5rem] items-center gap-4 border-b border-border px-3 py-2 last:border-b-0 md:grid-cols-[5.5rem_minmax(0,1fr)_9rem_6rem_2.5rem]"
        >
          <div className="h-7 bg-muted" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-muted" />
            <div className="hidden h-3 w-56 bg-muted sm:block" />
          </div>
          <div className="h-3 w-20 bg-muted" />
          <div className="hidden h-3 w-16 bg-muted md:block" />
          <div className="size-7 bg-muted" />
        </div>
      ))}
    </div>
  )
}

function getEmptyStateCopy(input: {
  themeCount: number
  query: string
  filter: ThemeLibraryFilter
}) {
  if (input.themeCount === 0) {
    return {
      title: "No themes yet",
      description:
        "Themes are reusable visual systems. Create one, preview it safely, then apply it to the app or a specific surface.",
    }
  }

  if (input.query.trim()) {
    return {
      title: "No search results",
      description: "No theme names or descriptions match this search.",
    }
  }

  return {
    title: input.filter === "in-use" ? "No themes in use" : "No unused themes",
    description: "Change the filter to see the rest of your saved themes.",
  }
}

export function ThemeLibraryPage() {
  const router = useRouter()
  const { assignments, deleteTheme, saveTheme, themes } = useThemes()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<ThemeLibraryFilter>("all")
  const [sort, setSort] = React.useState<ThemeLibrarySort>("updated")
  const [status, setStatus] = React.useState("")
  const [blockedDeleteTheme, setBlockedDeleteTheme] =
    React.useState<ThemeRecord | null>(null)
  const [deleteThemeId, setDeleteThemeId] = React.useState<string | null>(null)
  const [renameThemeId, setRenameThemeId] = React.useState<string | null>(null)
  const isLoading = false

  const rows = React.useMemo(
    () =>
      getThemeLibraryRows({
        themes,
        assignments,
        filter,
        query,
        sort,
      }),
    [assignments, filter, query, sort, themes]
  )

  const deleteCandidate = themes.find((theme) => theme.id === deleteThemeId)
  const renameCandidate = themes.find((theme) => theme.id === renameThemeId)

  function openTheme(themeId: string) {
    router.push(`/settings/themes/${themeId}`)
  }

  function duplicateTheme(themeId: string) {
    const source = themes.find((theme) => theme.id === themeId)
    if (!source) return

    const copy = buildThemeDuplicate(source, {
      id: createThemeId(),
      now: new Date().toISOString(),
    })

    saveTheme(copy)
    setStatus(`${source.name} duplicated as ${copy.name}.`)
  }

  function requestDelete(themeId: string) {
    const source = themes.find((theme) => theme.id === themeId)
    if (!source) return

    const usage = getThemeUsageSummary(source, assignments)
    if (usage.isInUse) {
      setBlockedDeleteTheme(source)
      return
    }

    setDeleteThemeId(themeId)
  }

  function confirmDelete() {
    if (!deleteCandidate) return

    deleteTheme(deleteCandidate.id)
    setStatus(`${deleteCandidate.name} deleted.`)
    setDeleteThemeId(null)
  }

  function submitRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!renameCandidate) return

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    if (!name) return

    saveTheme({
      ...renameCandidate,
      name,
      description: description || undefined,
      updatedAt: new Date().toISOString(),
    })
    setStatus(`${name} updated.`)
    setRenameThemeId(null)
  }

  const emptyState = getEmptyStateCopy({
    themeCount: themes.length,
    query,
    filter,
  })

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-6 md:px-6">
      <div className="flex min-h-16 items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-normal text-foreground">
            Themes
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Reusable visual systems for Synapcity surfaces.
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/settings/themes/new">
            <Plus />
            New theme
          </Link>
        </Button>
      </div>

      <div className="flex min-h-11 flex-col gap-2 border-y border-border py-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Label htmlFor="theme-search" className="sr-only">
            Search themes
          </Label>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="theme-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search themes"
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 items-center border border-border">
            {(["all", "in-use", "unused"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className="h-full px-2.5 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring aria-pressed:bg-muted aria-pressed:text-foreground"
              >
                {item === "all" ? "All" : item === "in-use" ? "In use" : "Unused"}
              </button>
            ))}
          </div>

          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            <span className="sr-only">Sort themes</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as ThemeLibrarySort)}
              className="h-8 border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            >
              <option value="updated">Updated</option>
              <option value="name">Name</option>
            </select>
          </Label>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {status}
      </div>

      {isLoading ? (
        <ThemeLibrarySkeleton />
      ) : rows.length ? (
        <div className="border-y border-border">
          {rows.map((row) => (
            <ThemeLibraryRow
              key={row.theme.id}
              row={row}
              onDelete={requestDelete}
              onDuplicate={duplicateTheme}
              onOpen={openTheme}
              onRename={setRenameThemeId}
              onUsage={() =>
                setStatus(`${row.theme.name} usage: ${row.usage.label}.`)
              }
            />
          ))}
        </div>
      ) : (
        <div className="border-y border-border px-3 py-12 text-center">
          <h2 className="text-sm font-medium text-foreground">
            {emptyState.title}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {emptyState.description}
          </p>
        </div>
      )}

      <Dialog
        open={Boolean(renameCandidate)}
        onOpenChange={(open) => !open && setRenameThemeId(null)}
      >
        <DialogContent>
          <form onSubmit={submitRename} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Rename theme</DialogTitle>
              <DialogDescription>
                Update the saved record details. Assignments are unchanged.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="theme-rename-name">Name</Label>
                <Input
                  id="theme-rename-name"
                  name="name"
                  defaultValue={renameCandidate?.name}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="theme-rename-description">Description</Label>
                <Textarea
                  id="theme-rename-description"
                  name="description"
                  defaultValue={renameCandidate?.description}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => !open && setDeleteThemeId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete theme</DialogTitle>
            <DialogDescription>
              Delete {deleteCandidate?.name}. This only removes unused saved
              records and does not change assignments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(blockedDeleteTheme)}
        onOpenChange={(open) => !open && setBlockedDeleteTheme(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Theme is in use</DialogTitle>
            <DialogDescription>
              {blockedDeleteTheme?.name} cannot be deleted until its assignments
              are resolved. Reassignment and inheritance resolution are deferred.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </section>
  )
}

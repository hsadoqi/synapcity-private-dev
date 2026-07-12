"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowLeft,
  ChevronDown,
  Minus,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Save,
  X,
} from "lucide-react"

import { Button } from "@workspace/ui/components/primitives/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/primitives/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/primitives/dropdown-menu"
import { Input } from "@workspace/ui/components/primitives/input"
import { Label } from "@workspace/ui/components/primitives/label"
import { Textarea } from "@workspace/ui/components/primitives/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/primitives/toggle-group"

import { DEFAULT_NEUTRAL_ACCENT } from "../../constants"
import { generatePalette } from "../../engine/generate-palette"
import { getThemeFontOptions } from "../../font-registry"
import { useThemes } from "../../hooks/use-themes"
import { ThemePreviewBoundary } from "../../components/theme-preview-boundary"
import type { ThemeDraft, ThemeFontId } from "../../types"
import {
  areThemeDraftsEqual,
  buildThemeRecordFromDraft,
  cloneThemeDraft,
  createNewThemeDraft,
  DEFAULT_THEME_PREVIEW_STATE,
  getResolvedAccentLabel,
  themeRecordToDraft,
  validateThemeDraft,
  type ThemeBuilderPreviewState,
  type ThemeBuilderSection,
  type ThemePreviewAppearance,
  type ThemePreviewScenario,
  type ThemePreviewViewport,
} from "./theme-builder-model"

type ThemeBuilderPageProps =
  | { mode: "new" }
  | { mode: "edit"; themeId: string }

type PendingNavigation = "back" | null

const SECTIONS: Array<{ id: ThemeBuilderSection; label: string; enabled: boolean }> = [
  { id: "colors", label: "Colors", enabled: true },
  { id: "typography", label: "Typography", enabled: true },
  { id: "shape", label: "Shape", enabled: true },
  { id: "accessibility", label: "Accessibility", enabled: false },
  { id: "advanced", label: "Advanced", enabled: false },
]

const SCENARIOS: Array<{ id: ThemePreviewScenario; label: string }> = [
  { id: "document", label: "Document" },
  { id: "dashboard", label: "Dashboard" },
  { id: "editor", label: "Editor" },
  { id: "components", label: "Components" },
]

const VIEWPORTS: Array<{ id: ThemePreviewViewport; label: string; width?: string }> = [
  { id: "fit", label: "Fit" },
  { id: "desktop", label: "Desktop", width: "min(100%, 960px)" },
  { id: "tablet", label: "Tablet", width: "min(100%, 768px)" },
  { id: "mobile", label: "Mobile", width: "390px" },
]

const APPEARANCES: Array<{ id: ThemePreviewAppearance; label: string }> = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
]

const SECTION_STRIP_WIDTH = 1120
const INSPECTOR_SHEET_WIDTH = 1180

function createThemeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `theme-${crypto.randomUUID()}`
  }

  return `theme-${Date.now().toString(36)}`
}

function getEffectiveWindowWidth() {
  if (typeof window === "undefined") return 1440

  const rootFontSize = Number.parseFloat(
    window.getComputedStyle(document.documentElement).fontSize
  )
  const textScale =
    Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize / 16 : 1

  return window.innerWidth / Math.max(1, textScale)
}

function useEffectiveWindowWidth() {
  const [width, setWidth] = React.useState(getEffectiveWindowWidth)

  React.useEffect(() => {
    const handleResize = () => setWidth(getEffectiveWindowWidth())

    handleResize()
    window.addEventListener("resize", handleResize)

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleResize)
    observer?.observe(document.documentElement)

    return () => {
      window.removeEventListener("resize", handleResize)
      observer?.disconnect()
    }
  }, [])

  return width
}

export function ThemeBuilderPage(props: ThemeBuilderPageProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const { saveTheme, themes } = useThemes()
  const windowWidth = useEffectiveWindowWidth()
  const useSectionStrip = windowWidth < SECTION_STRIP_WIDTH
  const useInspectorSheet = windowWidth < INSPECTOR_SHEET_WIDTH
  const persistedTheme =
    props.mode === "edit"
      ? themes.find((theme) => theme.id === props.themeId)
      : undefined
  const unavailable = props.mode === "edit" && !persistedTheme
  const initialDraft = React.useMemo(
    () =>
      props.mode === "new"
        ? createNewThemeDraft()
        : persistedTheme
          ? themeRecordToDraft(persistedTheme)
          : createNewThemeDraft(),
    [persistedTheme, props.mode]
  )
  const [baseline, setBaseline] = React.useState<ThemeDraft | null>(
    props.mode === "edit" && persistedTheme
      ? themeRecordToDraft(persistedTheme)
      : null
  )
  const [draft, setDraft] = React.useState<ThemeDraft>(initialDraft)
  const [preview, setPreview] = React.useState<ThemeBuilderPreviewState>(
    DEFAULT_THEME_PREVIEW_STATE
  )
  const [saveStatus, setSaveStatus] = React.useState<
    "not-created" | "saved" | "unsaved" | "saving" | "saved-just-now" | "error"
  >(props.mode === "new" ? "not-created" : "saved")
  const [announcement, setAnnouncement] = React.useState("")
  const [pendingNavigation, setPendingNavigation] =
    React.useState<PendingNavigation>(null)
  const [inspectorState, setInspectorState] = React.useState<
    "default" | "open" | "closed"
  >("default")
  const inspectorTriggerRef = React.useRef<HTMLButtonElement | null>(null)

  const validation = React.useMemo(() => validateThemeDraft(draft), [draft])
  const isDirty =
    props.mode === "new"
      ? !areThemeDraftsEqual(createNewThemeDraft(), draft)
      : baseline
        ? !areThemeDraftsEqual(baseline, draft)
        : false
  const effectiveStatus =
    saveStatus === "saved" && isDirty ? "unsaved" : saveStatus
  const canSaveExisting =
    props.mode === "edit" && Boolean(persistedTheme) && isDirty && validation.valid
  const canCreate = props.mode === "new" && validation.valid
  const inspectorOpen =
    inspectorState === "open" ||
    (inspectorState === "default" && !useInspectorSheet)

  React.useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  function updateDraft(patch: Partial<ThemeDraft>) {
    setDraft((current) => cloneThemeDraft({ ...current, ...patch }))
    setSaveStatus("unsaved")
  }

  function updateSeeds(seeds: ThemeDraft["seeds"]) {
    updateDraft({ seeds })
  }

  function announce(message: string) {
    setAnnouncement(message)
  }

  function openInspector() {
    setInspectorState("open")
  }

  function closeInspector() {
    setInspectorState("closed")
    const restoreFocus = () => inspectorTriggerRef.current?.focus()
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(restoreFocus)
    } else {
      window.setTimeout(restoreFocus, 0)
    }
  }

  function persistExisting() {
    if (props.mode !== "edit" || !persistedTheme || !validation.valid) return null

    setSaveStatus("saving")
    try {
      const now = new Date().toISOString()
      const saved = buildThemeRecordFromDraft({
        draft,
        id: persistedTheme.id,
        createdAt: persistedTheme.createdAt,
        now,
      })
      saveTheme(saved)
      const nextBaseline = themeRecordToDraft(saved)
      setBaseline(nextBaseline)
      setDraft(nextBaseline)
      setSaveStatus("saved-just-now")
      announce("Theme saved.")
      return saved
    } catch {
      setSaveStatus("error")
      announce("Save failed.")
      return null
    }
  }

  function createTheme() {
    if (!validation.valid) return null

    setSaveStatus("saving")
    try {
      const now = new Date().toISOString()
      const saved = buildThemeRecordFromDraft({
        draft,
        id: createThemeId(),
        now,
      })
      saveTheme(saved)
      announce("Theme created.")
      router.push(`/settings/themes/${saved.id}`)
      return saved
    } catch {
      setSaveStatus("error")
      announce("Create failed.")
      return null
    }
  }

  function saveAsNew() {
    if (props.mode !== "edit" || !validation.valid) return null

    setSaveStatus("saving")
    try {
      const now = new Date().toISOString()
      const saved = buildThemeRecordFromDraft({
        draft: { ...draft, name: `${draft.name} copy` },
        id: createThemeId(),
        now,
      })
      saveTheme(saved)
      announce("Theme saved as new.")
      router.push(`/settings/themes/${saved.id}`)
      return saved
    } catch {
      setSaveStatus("error")
      announce("Save as new failed.")
      return null
    }
  }

  function revert() {
    if (!baseline) return
    setDraft(cloneThemeDraft(baseline))
    setSaveStatus("saved")
    announce("Draft reverted.")
  }

  function requestBack() {
    if (isDirty) {
      setPendingNavigation("back")
      return
    }
    router.push("/settings/themes")
  }

  function discardAndLeave() {
    setPendingNavigation(null)
    router.push("/settings/themes")
  }

  function saveAndLeave() {
    const saved = props.mode === "new" ? createTheme() : persistExisting()
    if (saved) {
      setPendingNavigation(null)
      if (props.mode === "edit") router.push("/settings/themes")
    }
  }

  React.useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const usesModifier = event.metaKey || event.ctrlKey
      if (!usesModifier || event.key.toLowerCase() !== "s") return
      if (event.target instanceof HTMLElement) {
        const dialog = event.target.closest('[role="dialog"]')
        if (dialog) return
      }

      event.preventDefault()
      if (event.shiftKey) {
        if (props.mode === "edit" && validation.valid) saveAsNew()
        return
      }

      if (props.mode === "new") {
        createTheme()
      } else if (canSaveExisting) {
        persistExisting()
      }
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  })

  if (unavailable) {
    return (
      <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-6 md:px-6">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/settings/themes">
            <ArrowLeft data-icon="inline-start" />
            Back to Themes
          </Link>
        </Button>
        <div className="border-y border-border py-10">
          <h1 className="text-lg font-semibold text-foreground">
            Theme unavailable
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            This saved theme could not be found. It may have been deleted or the
            local theme store may not contain this ID.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      data-testid="theme-builder-shell"
      className="-mx-6 -my-8 flex h-[calc(100svh-5.5rem)] min-h-[680px] flex-col overflow-hidden bg-background"
    >
      <CommandBar
        canCreate={canCreate}
        canSaveExisting={canSaveExisting}
        draft={draft}
        effectiveStatus={effectiveStatus}
        isDirty={isDirty}
        mode={props.mode}
        onCreate={createTheme}
        onDraftChange={updateDraft}
        onRevert={revert}
        onSave={persistExisting}
        onSaveAsNew={saveAsNew}
        onBack={requestBack}
      />
      <div
        data-testid="theme-builder-grid"
        className={cn(
          "min-h-0 min-w-0 flex-1 border-t border-border",
          useSectionStrip
            ? "flex flex-col"
            : "grid grid-cols-[176px_minmax(0,1fr)]"
        )}
      >
        <SectionRail
          orientation={useSectionStrip ? "horizontal" : "vertical"}
          section={preview.section}
          onSectionChange={(section) =>
            setPreview((current) => ({ ...current, section }))
          }
        />
        <div
          className={cn(
            "relative min-h-0 min-w-0",
            !useSectionStrip &&
              (inspectorOpen
                ? "grid grid-cols-[minmax(520px,1fr)_336px] max-[1360px]:grid-cols-[minmax(0,1fr)_320px]"
                : "flex"),
            useSectionStrip &&
              (inspectorOpen && !useInspectorSheet
                ? "grid flex-1 grid-cols-[minmax(0,1fr)_320px]"
                : "flex flex-1")
          )}
        >
          <PreviewRegion
            draft={draft}
            inspectorButtonRef={inspectorTriggerRef}
            isDirty={isDirty}
            preview={preview}
            resolvedTheme={resolvedTheme}
            onOpenInspector={openInspector}
            onPreviewChange={(patch) =>
              setPreview((current) => ({ ...current, ...patch }))
            }
          />
          {inspectorOpen ? (
            <Inspector
              draft={draft}
              isSheet={useInspectorSheet}
              section={preview.section}
              validation={validation}
              onClose={closeInspector}
              onDraftChange={updateDraft}
              onSeedsChange={updateSeeds}
            />
          ) : null}
        </div>
      </div>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <DirtyNavigationDialog
        open={pendingNavigation !== null}
        mode={props.mode}
        canSave={props.mode === "new" ? canCreate : canSaveExisting}
        onCancel={() => setPendingNavigation(null)}
        onDiscard={discardAndLeave}
        onSave={saveAndLeave}
      />
    </section>
  )
}

function CommandBar({
  canCreate,
  canSaveExisting,
  draft,
  effectiveStatus,
  isDirty,
  mode,
  onBack,
  onCreate,
  onDraftChange,
  onRevert,
  onSave,
  onSaveAsNew,
}: {
  canCreate: boolean
  canSaveExisting: boolean
  draft: ThemeDraft
  effectiveStatus: string
  isDirty: boolean
  mode: "new" | "edit"
  onBack: () => void
  onCreate: () => void
  onDraftChange: (patch: Partial<ThemeDraft>) => void
  onRevert: () => void
  onSave: () => void
  onSaveAsNew: () => void
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Back to Themes"
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Label htmlFor="theme-builder-name" className="sr-only">
            Theme name
          </Label>
          <Input
            id="theme-builder-name"
            value={draft.name}
            onChange={(event) => onDraftChange({ name: event.target.value })}
            className="h-8 max-w-80 border-transparent px-1 text-base font-semibold focus-visible:border-ring"
          />
          <DescriptionTrigger draft={draft} onDraftChange={onDraftChange} />
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatSaveStatus(effectiveStatus)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isDirty && mode === "edit" ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRevert}>
            <RotateCcw data-icon="inline-start" />
            Revert
          </Button>
        ) : null}
        {mode === "new" ? (
          <Button type="button" size="sm" disabled={!canCreate} onClick={onCreate}>
            <Save data-icon="inline-start" />
            Create theme
          </Button>
        ) : (
          <div className="flex items-center">
            <Button
              type="button"
              size="sm"
              disabled={!canSaveExisting}
              onClick={onSave}
            >
              <Save data-icon="inline-start" />
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Save options"
                  className="border-l border-primary-foreground/20"
                >
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={onSaveAsNew}>
                  Save as new
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="More builder actions"
          disabled
        >
          <MoreHorizontal />
        </Button>
      </div>
    </header>
  )
}

function DescriptionTrigger({
  draft,
  onDraftChange,
}: {
  draft: ThemeDraft
  onDraftChange: (patch: Partial<ThemeDraft>) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Details
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Theme details</DialogTitle>
          <DialogDescription>
            Name and description are saved with the authored theme record.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="theme-details-name">Name</Label>
            <Input
              id="theme-details-name"
              value={draft.name}
              onChange={(event) => onDraftChange({ name: event.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="theme-details-description">Description</Label>
            <Textarea
              id="theme-details-description"
              value={draft.description ?? ""}
              onChange={(event) =>
                onDraftChange({ description: event.target.value || undefined })
              }
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SectionRail({
  orientation,
  section,
  onSectionChange,
}: {
  orientation: "horizontal" | "vertical"
  section: ThemeBuilderSection
  onSectionChange: (section: ThemeBuilderSection) => void
}) {
  const enabledSections = SECTIONS.filter((item) => item.enabled)
  const horizontal = orientation === "horizontal"

  return (
    <nav
      aria-label="Theme sections"
      data-orientation={orientation}
      className={cn(
        "min-h-0 bg-surface-muted/35 p-3",
        horizontal
          ? "flex shrink-0 overflow-x-auto border-b border-border"
          : "flex flex-col border-r border-border"
      )}
      onKeyDown={(event) => {
        const previousKey = horizontal ? "ArrowLeft" : "ArrowUp"
        const nextKey = horizontal ? "ArrowRight" : "ArrowDown"
        if (event.key !== nextKey && event.key !== previousKey) return
        event.preventDefault()
        const currentIndex = enabledSections.findIndex((item) => item.id === section)
        const offset = event.key === nextKey ? 1 : -1
        const next =
          enabledSections[
            (currentIndex + offset + enabledSections.length) %
              enabledSections.length
          ]
        if (next) onSectionChange(next.id)
      }}
    >
      <div className={cn("flex gap-1", horizontal ? "flex-row" : "flex-col")}>
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={section === item.id ? "page" : undefined}
            disabled={!item.enabled}
            onClick={() => item.enabled && onSectionChange(item.id)}
            className={cn(
              "flex h-9 items-center whitespace-nowrap px-3 text-left text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45 aria-current:bg-muted aria-current:font-medium aria-current:text-foreground",
              horizontal ? "min-w-11 justify-center" : ""
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

function PreviewRegion({
  draft,
  inspectorButtonRef,
  isDirty,
  onOpenInspector,
  onPreviewChange,
  preview,
  resolvedTheme,
}: {
  draft: ThemeDraft
  inspectorButtonRef: React.RefObject<HTMLButtonElement | null>
  isDirty: boolean
  preview: ThemeBuilderPreviewState
  resolvedTheme?: string
  onOpenInspector: () => void
  onPreviewChange: (patch: Partial<ThemeBuilderPreviewState>) => void
}) {
  const viewport = VIEWPORTS.find((item) => item.id === preview.viewport)
  const appearanceLabel =
    preview.appearance === "system"
      ? `System -> ${resolvedTheme === "dark" ? "Dark" : "Light"}`
      : preview.appearance === "dark"
        ? "Dark"
        : "Light"

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <div
        aria-label="Preview toolbar"
        className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border px-3"
      >
        <div className="flex min-w-0 items-center gap-3 overflow-hidden">
          <LabeledSelect
            label="Scenario"
            value={preview.scenario}
            items={SCENARIOS}
            onValueChange={(value) =>
              onPreviewChange({ scenario: value as ThemePreviewScenario })
            }
          />
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <LabeledToggle
            label="Appearance"
            value={preview.appearance}
            items={APPEARANCES}
            onValueChange={(value) =>
              value &&
              onPreviewChange({ appearance: value as ThemePreviewAppearance })
            }
          />
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <LabeledSelect
            label="Viewport"
            value={preview.viewport}
            items={VIEWPORTS}
            onValueChange={(value) =>
              onPreviewChange({ viewport: value as ThemePreviewViewport })
            }
          />
        </div>
        <Button
          ref={inspectorButtonRef}
          type="button"
          variant="outline"
          size="xs"
          className="shrink-0"
          onClick={onOpenInspector}
        >
          Edit {SECTIONS.find((item) => item.id === preview.section)?.label}
        </Button>
      </div>
      <div
        data-testid="theme-preview-scroll"
        className="min-h-0 flex-1 overflow-auto bg-surface-muted/45 p-6"
      >
        <div
          className="mx-auto min-h-full bg-background ring-1 ring-border"
          style={{ width: viewport?.width ?? "100%" }}
        >
          <ThemePreviewBoundary
            draft={draft}
            className={preview.appearance === "dark" ? "dark min-h-full" : "min-h-full"}
          >
            <PreviewScenario scenario={preview.scenario} />
          </ThemePreviewBoundary>
        </div>
      </div>
      <div className="h-8 shrink-0 border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
        {isDirty ? "Previewing unsaved draft" : "Previewing saved theme"} ·{" "}
        {draft.name || "Untitled theme"} · {appearanceLabel}
      </div>
    </div>
  )
}

function LabeledSelect<T extends string>({
  items,
  label,
  onValueChange,
  value,
}: {
  items: Array<{ id: T; label: string }>
  label: string
  value: T
  onValueChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="h-7 min-w-24 rounded-none border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function LabeledToggle<T extends string>({
  items,
  label,
  onValueChange,
  value,
}: {
  items: Array<{ id: T; label: string }>
  label: string
  value: T
  onValueChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        size="xs"
        variant="outline"
        spacing={0}
      >
        {items.map((item) => (
          <ToggleGroupItem key={item.id} value={item.id} aria-label={item.label}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

function Inspector({
  draft,
  isSheet,
  onClose,
  onDraftChange,
  onSeedsChange,
  section,
  validation,
}: {
  draft: ThemeDraft
  isSheet: boolean
  section: ThemeBuilderSection
  validation: ReturnType<typeof validateThemeDraft>
  onClose: () => void
  onDraftChange: (patch: Partial<ThemeDraft>) => void
  onSeedsChange: (seeds: ThemeDraft["seeds"]) => void
}) {
  const sectionLabel = SECTIONS.find((item) => item.id === section)?.label ?? "Theme"

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col border-l border-border bg-background",
        isSheet
          ? "absolute inset-y-0 right-0 z-20 w-[336px] max-w-[calc(100%-2rem)] shadow-[0_0_0_1px_hsl(var(--border))]"
          : ""
      )}
    >
      <div className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-foreground">
            {sectionLabel}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {section === "colors"
              ? "Author color seeds and inspect generated scales."
              : section === "typography"
                ? "Set font roles and type scale."
                : section === "shape"
                  ? "Adjust the base radius used inside the preview."
                  : "Implementation deferred."}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Close ${sectionLabel} inspector`}
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {section === "colors" ? (
          <ColorsInspector
            draft={draft}
            validation={validation}
            onSeedsChange={onSeedsChange}
          />
        ) : null}
        {section === "typography" ? (
          <TypographyInspector draft={draft} onDraftChange={onDraftChange} />
        ) : null}
        {section === "shape" ? (
          <ShapeInspector draft={draft} onDraftChange={onDraftChange} />
        ) : null}
        {section === "accessibility" || section === "advanced" ? (
          <div className="border-y border-border py-6 text-sm text-muted-foreground">
            This section is planned for a later builder batch.
          </div>
        ) : null}
      </div>
    </aside>
  )
}

function ColorsInspector({
  draft,
  onSeedsChange,
  validation,
}: {
  draft: ThemeDraft
  validation: ReturnType<typeof validateThemeDraft>
  onSeedsChange: (seeds: ThemeDraft["seeds"]) => void
}) {
  const accent = getResolvedAccentLabel(draft)

  return (
    <div className="flex flex-col gap-5">
      <SeedControl
        id="primary-seed"
        label="Primary"
        value={draft.seeds.primary}
        error={validation.errors.primary}
        onChange={(primary) => onSeedsChange({ ...draft.seeds, primary })}
      />
      <PaletteStrip label="Primary scale" seed={draft.seeds.primary} />
      <div className="h-px bg-border" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground">Accent</h3>
          <p className="mt-1 text-xs text-muted-foreground">{accent.status}</p>
        </div>
        {draft.seeds.accent === undefined ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onSeedsChange({
                ...draft.seeds,
                accent: DEFAULT_NEUTRAL_ACCENT,
              })
            }
          >
            Customize accent
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSeedsChange({ primary: draft.seeds.primary })}
          >
            Reset to neutral default
          </Button>
        )}
      </div>
      {draft.seeds.accent !== undefined ? (
        <SeedControl
          id="accent-seed"
          label="Authored accent"
          value={draft.seeds.accent}
          error={validation.errors.accent}
          onChange={(accentValue) =>
            onSeedsChange({ ...draft.seeds, accent: accentValue })
          }
        />
      ) : null}
      <PaletteStrip label={accent.scaleLabel} seed={accent.seed} />
    </div>
  )
}

function SeedControl({
  error,
  id,
  label,
  onChange,
  value,
}: {
  error?: string
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <span
          aria-label={`${label} swatch ${value}`}
          className="size-8 shrink-0 border border-border"
          style={{ backgroundColor: value }}
        />
        <Input
          id={id}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="font-mono"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function PaletteStrip({ label, seed }: { label: string; seed: string }) {
  const palette = React.useMemo(() => generatePalette(seed), [seed])
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div
        className="grid grid-cols-11 border border-border"
        aria-label={`${label} palette`}
      >
        {steps.map((step) => (
          <span
            key={step}
            aria-label={`${label} ${step}: ${palette[step]}`}
            className="h-7"
            style={{ backgroundColor: palette[step] }}
          />
        ))}
      </div>
    </div>
  )
}

function TypographyInspector({
  draft,
  onDraftChange,
}: {
  draft: ThemeDraft
  onDraftChange: (patch: Partial<ThemeDraft>) => void
}) {
  const bodyOptions = getThemeFontOptions("body")
  const headingOptions = getThemeFontOptions("heading")

  function updateFonts(fonts: Partial<Record<"body" | "heading", ThemeFontId>>) {
    onDraftChange({ fonts: { ...draft.fonts, ...fonts } })
  }

  return (
    <div className="flex flex-col gap-5">
      <SelectControl
        id="heading-font"
        label="Heading font"
        value={draft.fonts?.heading ?? "space-grotesk"}
        options={headingOptions}
        onChange={(value) => updateFonts({ heading: value as ThemeFontId })}
      />
      <SelectControl
        id="body-font"
        label="Body font"
        value={draft.fonts?.body ?? "inter"}
        options={bodyOptions}
        onChange={(value) => updateFonts({ body: value as ThemeFontId })}
      />
      <NumberStepper
        id="type-scale"
        label="Type scale"
        value={draft.typography?.scale ?? 1}
        min={0.85}
        max={1.25}
        step={0.01}
        onChange={(scale) => onDraftChange({ typography: { scale } })}
      />
      <div className="border-y border-border py-4">
        <p className="text-base font-semibold">Representative heading</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Body text updates inside the preview boundary through generated font
          and scale variables.
        </p>
      </div>
    </div>
  )
}

function ShapeInspector({
  draft,
  onDraftChange,
}: {
  draft: ThemeDraft
  onDraftChange: (patch: Partial<ThemeDraft>) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <NumberStepper
        id="radius-base"
        label="Radius base"
        value={draft.radius?.base ?? 0.75}
        min={0}
        max={2}
        step={0.05}
        onChange={(base) => onDraftChange({ radius: { base } })}
      />
      <div className="flex flex-col gap-3 border-y border-border py-4">
        <p className="text-xs font-medium text-muted-foreground">
          Representative controls
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm">
            Primary
          </Button>
          <Button type="button" size="sm" variant="outline">
            Secondary
          </Button>
          <Input aria-label="Radius preview input" defaultValue="Input" />
        </div>
      </div>
    </div>
  )
}

function SelectControl({
  id,
  label,
  onChange,
  options,
  value,
}: {
  id: string
  label: string
  value: string
  options: Array<{ id: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 border border-input bg-background px-2.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function NumberStepper({
  id,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  function commit(next: number) {
    if (!Number.isFinite(next)) return
    onChange(Math.min(max, Math.max(min, Number(next.toFixed(3)))))
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label={`Decrease ${label}`}
          onClick={() => commit(value - step)}
        >
          <Minus />
        </Button>
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => commit(Number(event.target.value))}
        />
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label={`Increase ${label}`}
          onClick={() => commit(value + step)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  )
}

function PreviewScenario({ scenario }: { scenario: ThemePreviewScenario }) {
  if (scenario === "dashboard") return <DashboardScenario />
  if (scenario === "editor") return <EditorScenario />
  if (scenario === "components") return <ComponentsScenario />
  return <DocumentScenario />
}

function DocumentScenario() {
  return (
    <article className="min-h-full bg-background p-6 text-foreground">
      <div className="flex h-10 items-center justify-between border-b border-border text-xs text-muted-foreground">
        <span>Synapcity / Product notes</span>
        <Button type="button" size="xs" variant="outline">
          Share
        </Button>
      </div>
      <div className="grid gap-6 py-6 md:grid-cols-[150px_minmax(0,1fr)]">
        <nav className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Context</span>
          <span>Outline</span>
          <span>References</span>
          <span>Theme preview</span>
        </nav>
        <div className="max-w-[70ch]">
          <h1 className="font-heading text-2xl font-semibold">
            Product narrative draft
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This scenario checks long-form reading, quiet metadata, links,
            inputs, and structured surfaces under the current draft theme.
          </p>
          <p className="mt-4 text-sm leading-6">
            The preview boundary owns all generated variables. A{" "}
            <a className="text-primary underline underline-offset-4" href="#">
              contextual link
            </a>{" "}
            should inherit the draft palette without changing the app shell.
          </p>
          <div className="mt-5 border border-border bg-muted/55 p-3 text-sm">
            Inline callout: use restrained surfaces to judge contrast and
            hierarchy without turning the preview into a component catalogue.
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <div className="border border-border p-2">
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="font-medium">Design systems</dd>
            </div>
            <div className="border border-border p-2">
              <dt className="text-muted-foreground">State</dt>
              <dd className="font-medium">Draft</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-center gap-2">
            <Input aria-label="Preview comment" placeholder="Add a note" />
            <Button type="button">Add</Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function DashboardScenario() {
  return (
    <div className="min-h-full bg-background p-6 text-foreground">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h1 className="text-lg font-semibold">Weekly review</h1>
        <Button type="button" size="sm" variant="outline">
          Configure
        </Button>
      </div>
      <div className="grid gap-3 py-4 md:grid-cols-2">
        {["Launch readiness", "Research synthesis", "Design debt"].map((item) => (
          <section key={item} className="border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">{item}</h2>
              <span className="text-xs text-muted-foreground">In review</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Structured status, muted text, action contrast, and widget
              boundaries remain legible at dashboard density.
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

function EditorScenario() {
  return (
    <div className="min-h-full bg-background p-6 text-foreground">
      <div className="flex h-9 items-center gap-1 border border-border px-2">
        <Button type="button" size="xs" variant="ghost">
          Bold
        </Button>
        <Button type="button" size="xs" variant="ghost">
          Link
        </Button>
        <Button type="button" size="xs" variant="outline">
          Comment
        </Button>
      </div>
      <div className="mt-5 max-w-[68ch] border-l border-border pl-4">
        <h1 className="text-xl font-semibold">Editable section</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Selected and focused editor states should remain visible without
          depending on decorative chrome.
        </p>
        <div className="mt-4 border border-primary bg-primary/10 p-3 text-sm">
          Selected block with contextual controls.
        </div>
      </div>
    </div>
  )
}

function ComponentsScenario() {
  return (
    <div className="min-h-full bg-background p-6 text-foreground">
      <div className="flex max-w-xl flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button type="button">Primary</Button>
          <Button type="button" variant="outline">
            Outline
          </Button>
          <Button type="button" variant="destructive">
            Destructive
          </Button>
        </div>
        <Input aria-label="Component input" placeholder="Input state" />
        <div className="border border-border bg-muted p-3 text-sm">
          Muted surface with border and text.
        </div>
        <div className="border border-primary bg-primary/10 p-3 text-sm">
          Selected item
        </div>
      </div>
    </div>
  )
}

function DirtyNavigationDialog({
  canSave,
  mode,
  onCancel,
  onDiscard,
  onSave,
  open,
}: {
  open: boolean
  mode: "new" | "edit"
  canSave: boolean
  onCancel: () => void
  onDiscard: () => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave with unsaved changes?</DialogTitle>
          <DialogDescription>
            Save the current draft, discard it, or keep editing.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={onDiscard}>
            Discard
          </Button>
          <Button type="button" disabled={!canSave} onClick={onSave}>
            {mode === "new" ? "Create and leave" : "Save and leave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatSaveStatus(status: string) {
  if (status === "not-created") return "Not created"
  if (status === "unsaved") return "Unsaved changes"
  if (status === "saving") return "Saving..."
  if (status === "saved-just-now") return "Saved just now"
  if (status === "error") return "Save failed"
  return "Saved"
}

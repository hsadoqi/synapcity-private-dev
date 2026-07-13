# Feedback System Integration Guide

This guide documents the feedback conventions established in Synapcity and how to integrate them into new features.

## Architecture

### Route-Level Feedback

Route-level Suspense boundaries are handled via Next.js App Router:

- **`loading.tsx`**: Renders skeleton UI while the route data loads
- **`error.tsx`**: Catches route-level errors and displays error state
- **`not-found.tsx`**: Shows 404 state for missing resources

**Usage**: Automatic via Next.js. Routes that can suspend (server components fetching data) show skeletons during navigation.

**Existing boundaries**:
- `/app/loading.tsx` — root app loading
- `/app/(home)/loading.tsx` — home/workspace loading
- `/app/(home)/documents/loading.tsx` — documents list loading
- `/app/(home)/settings/loading.tsx` — settings loading
- `/app/(home)/error.tsx` — workspace error boundary

### Async Action Feedback

When a user action requires async work, provide inline feedback at the control initiating the action.

#### Save State (Document Editor Pattern)

For long-lived editing surfaces (document editor, theme builder), use the **save-state model**:

```typescript
type SaveState = "clean" | "dirty" | "saving" | "saved" | "error"
```

**States and their meanings**:
- **`clean`** — No unsaved changes; last save succeeded
- **`dirty`** — User has made changes since last save
- **`saving`** — Save operation is in progress
- **`saved`** — Save just completed successfully (transient, ~2s)
- **`error`** — Save failed; user should retry

**Implementation example**:

```typescript
const [document, setDocument] = useState(initialDocument)
const [title, setTitle] = useState(initialDocument.title)
const [content, setContent] = useState(initialDocument.content)
const [saveState, setSaveState] = useState<SaveState>("clean")
const [saveError, setSaveError] = useState<string>()

// Detect unsaved changes
const isDirty = useMemo(
  () => title !== document.title || content !== document.content,
  [title, content, document]
)

// Map dirty state to display state
const displayState = useMemo(() => {
  if (saveState === "saving" || saveState === "saved" || saveState === "error") {
    return saveState
  }
  return isDirty ? "dirty" : "clean"
}, [saveState, isDirty])

// Save handler
const handleSave = () => {
  if (!isDirty || saveState === "saving") return
  
  setSaveState("saving")
  setSaveError(undefined)
  
  try {
    const result = updateDocument(documentId, { title, content })
    if (result) {
      setDocument(result)
      setSaveState("saved")
      setTimeout(() => setSaveState("clean"), 2000) // auto-clear after 2s
    }
  } catch (error) {
    setSaveState("error")
    setSaveError(error.message)
  }
}
```

**UI patterns**:

```typescript
// Disable save button while saving or when clean
<Button
  onClick={handleSave}
  disabled={!isDirty || saveState === "saving"}
  aria-busy={saveState === "saving"}
>
  {saveState === "saving" ? (
    <>
      <Loader2 className="animate-spin" />
      Saving…
    </>
  ) : (
    "Save"
  )}
</Button>

// Show persistent status
<div role="status" aria-live="polite">
  {displayState === "dirty" && "Unsaved changes"}
  {displayState === "saving" && "Saving…"}
  {displayState === "saved" && "Saved"}
  {displayState === "error" && `Save failed: ${saveError}`}
</div>
```

#### Transient Action Feedback

For discrete actions that don't have a persistent edited state (creating, deleting, applying), use **toasts** for feedback.

```typescript
import { useToast } from "@workspace/feedback"

const toast = useToast()

const handleCreateTheme = async (name: string) => {
  try {
    const theme = await createTheme({ name })
    toast.success(`Theme "${name}" created`)
  } catch (error) {
    toast.error(`Failed to create theme: ${error.message}`)
  }
}
```

**When to use toasts**:
- ✓ Discrete, non-reversible actions (delete, create, apply)
- ✓ Background operations completing
- ✓ Short-lived confirmations
- ✓ Permission/access denials
- ✗ Validation errors (use inline feedback instead)
- ✗ Persistent editor state (use status display instead)

### Form Feedback

For forms with user input and validation:

1. **Pending state** — Disable submit button, show "Creating…" label
2. **Inline errors** — Show error messages near affected fields
3. **Preserve values** — Keep user input intact after failure
4. **Reset after success** — Clear form only on successful submission

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState<string>()
const [formData, setFormData] = useState({ name: "" })

const handleSubmit = async (e) => {
  e.preventDefault()
  if (isSubmitting || !formData.name.trim()) return
  
  setIsSubmitting(true)
  setError(undefined)
  
  try {
    await createTheme(formData)
    setFormData({ name: "" }) // reset on success
    toast.success("Theme created")
  } catch (err) {
    setError(err.message)
    // formData is preserved automatically
  } finally {
    setIsSubmitting(false)
  }
}

return (
  <form onSubmit={handleSubmit}>
    <input
      value={formData.name}
      onChange={(e) => setFormData({ name: e.target.value })}
    />
    {error && <div role="alert">{error}</div>}
    <button disabled={isSubmitting || !formData.name.trim()}>
      {isSubmitting ? (
        <>
          <Loader2 className="animate-spin" />
          Creating…
        </>
      ) : (
        "Create"
      )}
    </button>
  </form>
)
```

### Empty and No-Results States

Distinguish between different empty scenarios:

1. **Collection is truly empty** — "No documents yet" with create action
2. **Search filtered everything** — "No documents match 'xyz'" (different from empty)
3. **Load failed** — Use `ErrorState` instead of empty

```typescript
const filteredItems = searchQuery
  ? items.filter(item => item.name.includes(searchQuery))
  : items

if (filteredItems.length === 0) {
  return (
    <div>
      {searchQuery && items.length > 0 ? (
        <p>No documents match "{searchQuery}"</p>
      ) : (
        <EmptyState
          title="No documents yet"
          description="Create your first document"
          action={<Button onClick={onCreate}>New</Button>}
        />
      )}
    </div>
  )
}
```

### Destructive Actions

Use modal confirmation for operations that cannot be undone:

```typescript
import { useModal } from "@workspace/feedback"

const modal = useModal()

const handleDelete = async (itemId: string) => {
  const confirmed = await modal.confirm({
    title: "Delete document?",
    description: "This action cannot be undone.",
    confirmLabel: "Delete",
    confirmVariant: "destructive",
  })
  
  if (!confirmed) return
  
  try {
    await deleteDocument(itemId)
    toast.success("Document deleted")
  } catch (error) {
    toast.error(`Failed to delete: ${error.message}`)
  }
}
```

## Available Primitives

### Components

- **`LoadingState`** — Skeleton + spinner, conditional render
- **`ErrorState`** — Error message + action button
- **`EmptyState`** — Empty collection + action button
- **`ErrorBoundary`** — Catches render errors
- **`Button`** — Supports `aria-busy`, `disabled`
- **`ToastRenderer`** — Must be mounted in root providers (already done)
- **`ModalRenderer`** — Must be mounted in root providers (already done)

### Hooks

- **`useToast()`** — Push toasts: `.success(msg)`, `.error(msg)`, `.info(msg)`, `.neutral(msg)`
- **`useModal()`** — Push modals: `.confirm(options)`, `.alert(options)`

### Patterns

- **Save-state model** — Use for long-lived editing surfaces
- **Dirty-state detection** — Compare current state to last-saved state
- **Pending-action pattern** — Disable control, show pending label, prevent duplicate submission

## Integration Checklist

When adding a new async feature:

- [ ] Identify which feedback pattern fits (route loading, save state, transient action, form)
- [ ] Disable the initiating control while operation is pending
- [ ] Use meaningful pending label ("Saving…", "Creating…", "Deleting…")
- [ ] Show success/failure result (toast, inline, or persistent status)
- [ ] Preserve user input on failure
- [ ] Announce state changes via ARIA (`aria-busy`, `role="alert"`, `aria-live="polite"`)
- [ ] Test happy path (success) and failure cases

## Examples in Codebase

### Document Editor
**File**: `apps/web/modules/documents/pages/document-detail/components/document-editor-shell.tsx`
**Pattern**: Save-state model with dirty-state detection
**Shows**: Unsaved indicator, pending button, save status

### Theme Creation
**File**: `apps/web/app/(home)/settings/theme/page.tsx`
**Pattern**: Form with pending button and error feedback
**Shows**: Creating state, success toast, inline error

### Sidebar Search
**File**: `apps/web/app/(home)/_components/sidebar/sidebar-workspace-items.tsx`
**Pattern**: Filtered list with "no results" feedback
**Shows**: Empty state vs. search-empty state distinction

## Visual Guidelines

Keep feedback aligned with Synapcity's calm, editorial aesthetic:

- **Compact status** — Single line, <12px font for secondary info
- **Subtle color** — Use semantic tokens (primary/accent/destructive), not loud colors
- **Minimal motion** — Fade in/out, no bounce or excessive animation
- **Persistent where needed** — Status display for editors, toasts for transient outcomes
- **Clear hierarchy** — "Unsaved changes" is less prominent than "Save failed"
- **Contextual icons** — Use icons only as visual support, never as sole indicator

## Performance Notes

- Dirty-state detection uses `useMemo` to avoid unnecessary recalculations
- Save-state timeout is set to 2s (auto-clear "Saved" status)
- Modal queue is managed by `useModal` — only one modal shows at a time
- Toast stack is in fixed positioning (no layout reflow)

## Accessibility

All feedback implements:

- **Live regions**: `aria-live="polite"` for status updates
- **Busy state**: `aria-busy="true"` on pending controls
- **Semantic roles**: `role="alert"` for errors, `role="status"` for info
- **Focus management**: Modals trap focus; status updates don't steal focus
- **No color-only encoding**: All states include text labels
- **Reduced motion**: Respects `prefers-reduced-motion` (use CSS media queries)

---

**Last updated**: July 11, 2026  
**Scope**: Active integration patterns based on implemented feedback system

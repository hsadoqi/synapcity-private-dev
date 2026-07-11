# Synapcity Feedback System Audit

**Date:** July 11, 2026  
**Branch:** feat/documents-editor  
**Auditor:** Design Review Skill  

---

## Executive Summary

The current Synapcity implementation has **foundational feedback infrastructure but lacks coherent integration and coverage**. A previous task ("create ux system to convey notifications, alerts, etc") resulted in:

- ✅ Basic state components (`LoadingState`, `ErrorState`, `EmptyState`, `ErrorBoundary`)
- ✅ Toast system infrastructure (`useToast`, `ToastRenderer`)
- ✅ Modal system infrastructure (`useModal`, `ModalRenderer`)
- ❌ **No integration into real user actions** (save, delete, form submission, async operations)
- ❌ **No save/dirty state tracking** across documents or dashboards
- ❌ **No pending action feedback** (buttons still appear clickable while operation runs)
- ❌ **No destructive action confirmations** for delete operations
- ❌ **No inline form validation feedback**
- ❌ **No loading indicators for async operations** (theme save, document save)

**Result:** Users see buttons that work, but get no visible response when actions complete. Changes may or may not have saved. Form errors have no feedback path. The app feels unresponsive.

---

## Audit Findings

### 1. Loading States

**What exists:**
- 5× `loading.tsx` files at different route levels
- `LoadingState` component with skeleton support
- Pre-built skeletons: `PageHeaderSkeleton`, `CardSkeleton`, `ListItemSkeleton`, `EmptyStateSkeleton`, `StatsCardSkeleton`

**What works:**
- Route-level Suspense boundaries render skeletons while pages load
- Skeletons are shaped appropriately for their content

**What's missing:**
- No Suspense boundaries for *asynchronous actions* (only for route loads)
- No inline loading indicators for buttons/form submissions
- No loading state for document save (line 63-77 in `document-editor-shell.tsx`)
- No loading state for theme preset creation (line 41-66 in `theme/page.tsx`)
- No loading indicator while items load in collection views

**Evidence:**
- `document-editor-shell.tsx`: "Save" button has no disabled/pending state during save
- `theme/page.tsx`: "Create theme preset" button runs synchronously with no feedback

### 2. Error States

**What exists:**
- `ErrorState` component for page-level errors
- `ErrorBoundary` class component for render errors
- Route-level `error.tsx` at `(home)` level

**What works:**
- Document detail page shows error state when document can't be loaded
- Dashboard list shows error state when dashboards can't be loaded
- Error boundary catches and displays render crashes

**What's missing:**
- No error display for **failed async operations** (save failures, theme creation failures)
- No error recovery path for failed saves (no retry mechanism)
- No contextual error messages (what failed? why? what should user do?)
- No scoped error boundaries for isolated components (if context panel fails, entire sidebar doesn't break)
- No error toast display for transient failures

**Evidence:**
- Theme save (`theme/page.tsx`) has no error handling if `saveTheme()` fails
- Document save (`document-editor-shell.tsx`) has no error handling if `updateDocument()` fails
- No try-catch or error boundary around async operations

### 3. Empty States

**What exists:**
- `EmptyState` component with icon/title/description/action support
- Used in document list, dashboard list, theme assignments

**What works:**
- Theme settings page shows empty state when no assignments exist
- Empty states are warm and actionable (icon + message + CTA)

**What's missing:**
- No distinction between different empty state types:
  - "No documents created yet" vs. "Search found no results" vs. "Data failed to load"
- No empty states for search results (sidebar search shows nothing when no results)
- No empty states for failed loads vs. truly empty collections

**Evidence:**
- Sidebar search has no empty/no-results feedback
- Theme assignments section doesn't distinguish between "none exist yet" and "failed to load"

### 4. Async Operation Feedback

**What exists:**
- Toast system ready to use (`useToast`)
- Modal system ready to use (`useModal`)

**What's missing:**
- **Zero integration into real async operations**
- No pending feedback on:
  - ✗ Saving documents (document editor)
  - ✗ Saving themes (theme settings)
  - ✗ Creating new documents (no create UI yet)
  - ✗ Creating new dashboards (no create UI yet)
  - ✗ Deleting items (no delete UI yet)
  - ✗ Applying themes to scopes (no apply UI yet)
  - ✗ Loading context panel data (context panel exists but has no loading states)

**Evidence:**
- `document-editor-shell.tsx` line 63: `handleSave()` calls `updateDocument()` with no loading/error feedback
- `theme/page.tsx` line 41: `handleSaveTheme()` calls `saveTheme()` with no loading/error feedback
- No use of `useToast()` or `useModal()` anywhere in the app

### 5. Save and Dirty State Tracking

**What exists:**
- Nothing

**What's missing:**
- ✗ No dirty/unsaved indicator
- ✗ No "saving..." state
- ✗ No "saved" confirmation
- ✗ No "save failed" error state
- ✗ No prevention of navigation with unsaved changes
- ✗ No autosave indicator

**Evidence:**
- Document editor has 3 state variables (`title`, `content`) but no tracking of whether they differ from `initialDocument`
- No visual indicator whether the document has unsaved changes
- No confirmation dialog before navigating away from a modified document

### 6. Form Validation and Error Feedback

**What exists:**
- Native HTML inputs (no validation)
- No form library (Zod, React Hook Form, etc.)

**What's missing:**
- ✗ No field-level validation feedback
- ✗ No error messages beside form inputs
- ✗ No validation on blur/change/submit
- ✗ No form-level error summary
- ✗ No disabled submit button when form is invalid
- ✗ No distinction between client-side and server errors

**Evidence:**
- Document editor title/content are unvalidated text inputs
- Theme preset name has no validation
- No `<input required>` or custom validation rules

### 7. Destructive Action Confirmations

**What exists:**
- Modal system infrastructure exists
- Nothing implemented

**What's missing:**
- ✗ No delete confirmation for documents
- ✗ No delete confirmation for dashboards
- ✗ No delete confirmation for theme presets
- ✗ No warning about consequences ("Deleting is permanent and cannot be undone")
- ✗ No pending state while deletion runs
- ✗ No error handling if deletion fails

### 8. Disabled and Unavailable Actions

**What exists:**
- Nothing explicit

**What's missing:**
- ✗ Create document/dashboard buttons disabled until implementation ready
- ✗ No `aria-disabled` or explanation for unavailable features
- ✗ No placeholder "Coming soon" state for unfinished sections
- ✗ Buttons that silently do nothing (no feedback)

**Evidence:**
- AddNewTrigger button (header) links to `/documents` but no document creation UI exists
- Theme assignment section shows "No saved assignments yet" but user has no way to create one

### 9. Status and Feedback Providers

**What exists:**
- `ToastRenderer` and `ModalRenderer` in root providers
- Fully functional toast and modal stores with hooks

**What's missing:**
- ✗ No usage of `useToast()` in any page or component
- ✗ No usage of `useModal()` in any page or component
- ✗ No hooks for save status, dirty state, or async operation feedback
- ✗ No integration points documented (developers don't know how to use what exists)

**Evidence:**
- `root-providers.tsx` imports and renders toast/modal components but they're never triggered
- No `useToast()` imports anywhere in `apps/web`
- No `useModal()` imports anywhere in `apps/web`

### 10. Accessibility

**What works:**
- `LoadingState` has `aria-busy="true"` and `aria-live="polite"`
- `ErrorState` has `role="alert"`
- Error boundary logs to console

**What's missing:**
- ✗ No `aria-busy` on pending buttons
- ✗ No `aria-pressed` or state indication on async operations
- ✗ Focus management after errors/confirmations (dialog shows but focus doesn't move)
- ✗ Announcement of save status changes
- ✗ No `role="status"` for success messages
- ✗ No reduced-motion preferences respected on feedback animations

---

## Current User Flows and Their Feedback Gaps

### Flow: View Documents
**Current state:** ✓ Shows loading skeleton, error state if load fails, empty state if none exist  
**Gap:** None major for this flow

### Flow: View Dashboards
**Current state:** ✓ Shows loading skeleton, error state if load fails, empty state if none exist  
**Gap:** None major for this flow

### Flow: Edit Document
**Current state:** ✓ Can type in title/content  
**Gaps:**
- ✗ No indication whether changes are saved
- ✗ No "saving..." feedback when Save button is clicked
- ✗ No confirmation when save completes
- ✗ No error message if save fails
- ✗ No dirty indicator
- ✗ No disabled state while saving (users could click Save 10 times)

### Flow: Create Document
**Current state:** ✗ No UI exists yet  
**Gaps:**
- ✗ Button exists but does nothing meaningful
- ✗ No loading indicator while creating
- ✗ No success confirmation
- ✗ No error handling

### Flow: Create Theme Preset
**Current state:** ✓ Form exists and button clicks call handler  
**Gaps:**
- ✗ No "saving..." feedback while theme is created
- ✗ No confirmation when creation succeeds
- ✗ No error message if creation fails
- ✗ No disabled state while saving (users could click Create 10 times)
- ✗ No visual indication that the new theme is now selected

### Flow: Apply Theme to Scope
**Current state:** ✗ No UI exists yet  
**Gaps:**
- ✗ No "applying..." feedback
- ✗ No success confirmation
- ✗ No error handling

### Flow: Delete Document/Dashboard
**Current state:** ✗ No UI exists yet  
**Gaps:**
- ✗ No confirmation dialog
- ✗ No "deleting..." feedback
- ✗ No success confirmation
- ✗ No error handling
- ✗ No "Undo" window if implemented

---

## Root Causes

### 1. **Async operations are synchronous in demo**
The data layer (`loadDocuments()`, `updateDocument()`, `saveTheme()`) runs synchronously. Real async operations would need hooks like `useTransition()` or `useActionState()`. But even with sync operations, there should be visual feedback for state changes.

### 2. **No established patterns or conventions**
Developers don't know:
- Where to put loading feedback (before action? after? inline?)
- How to use `useToast()` or `useModal()` (examples needed)
- When to show which type of feedback
- How to handle state: pending, success, error, default

### 3. **Component layer vs. action layer**
Currently:
- **Component layer** handles page loading (route-level loading.tsx)
- **Action layer** is silent (no feedback on button clicks, form submissions)

There's no bridge between them. When a user clicks a button, nothing announces the state change.

### 4. **No save state concept**
Documents have no concept of "saved vs. unsaved". Users manually click Save, but there's no:
- Indication of whether they have unsaved changes
- Confirmation that a save worked
- Explanation of why a save might have failed

### 5. **No error recovery**
When something fails (if it ever does in the demo), there's no retry path. Error states don't have actions.

---

## What Needs to Happen (High Level)

### Phase 1: Design and Document System
1. **Define semantic feedback categories** that answer the design principles
2. **Design reusable patterns** (pending button, save status, form validation, etc.)
3. **Document usage conventions** so future features use consistent patterns
4. **Create integration points** in existing components

### Phase 2: Build Reusable Primitives
1. **AsyncButton** — button that shows pending state, handles disabled/error
2. **SaveStatus** — compact status indicator (idle → saving → saved → error)
3. **ConfirmActionDialog** — confirmation modal for destructive actions
4. **FormError** — field-level or form-level error display
5. **Hooks for state management:**
   - `useSaveStatus()` — for documents, themes
   - `useDirtyState()` — tracking unsaved changes
   - `usePendingAction()` — for async operations

### Phase 3: Integrate into Existing Flows
1. Add pending state to document save
2. Add pending state to theme creation
3. Add save/dirty state tracking to document editor
4. Add confirmation to delete operations (when UI exists)
5. Add error handling and retry to all async operations

### Phase 4: Document Patterns
Write INTEGRATION_PATTERNS.md for future developers

---

## Severity and Priority

| Finding | Severity | Impact | Priority |
|---------|----------|--------|----------|
| No save/dirty state | HIGH | Users don't know if changes are saved | 1 |
| No pending button feedback | HIGH | Users think app is broken; click multiple times | 1 |
| No async error handling | HIGH | Failures are silent; data loss risk | 1 |
| No validation feedback | MEDIUM | Users submit invalid forms | 2 |
| No destructive confirmations | HIGH | Accidental deletions possible | 1 |
| No disabled/unavailable UX | MEDIUM | Confusing unfinished features | 2 |
| No form-level patterns | MEDIUM | Inconsistent error handling | 2 |
| No accessibility for feedback | MEDIUM | Screen reader users don't get feedback | 3 |

---

## Design Principles That Are Violated

From PRODUCT.md:

1. ❌ **"Make state legible before making the interface clever"**  
   → Save status, dirty state, pending actions are invisible

2. ❌ **"Separate authoring from assignment"**  
   → Theme can be "created" and "applied" but user has no feedback on either

3. ❌ **"Reveal complexity contextually"**  
   → Errors don't explain what failed or how to fix it

4. ❌ **"Preserve keyboard speed and reversible actions"**  
   → Destructive actions have no confirmation; no undo window

---

## Existing Feedback Infrastructure Summary

### ✅ Available and Ready to Use

**State Components** (`@workspace/ui/components`):
- `LoadingState` — conditional render skeleton vs. children
- `ErrorState` — error message + action
- `EmptyState` — no content + action
- `ErrorBoundary` — catches render errors
- Pre-built skeletons for common layouts

**Toast System** (`@workspace/feedback`):
- `useToast()` — trigger toasts
- `ToastRenderer` — renders active toasts
- `ToastOptions` interface with title, message, intent, action, duration, dismissible

**Modal System** (`@workspace/feedback`):
- `useModal()` — trigger confirm/alert dialogs
- `ModalRenderer` — renders active modals
- ConfirmOptions and AlertOptions interfaces

### ❌ Missing and Need to Build

**Pattern Components:**
- `AsyncButton` / `PendingButton` — button with pending state
- `SaveStatus` — compact status display (idle/saving/saved/error)
- `ConfirmActionDialog` — destructive action confirmation
- `FormError` — field and form-level validation feedback
- `DirtyStateIndicator` — shows unsaved changes

**Hooks:**
- `useSaveStatus()` — manage save state for a resource
- `useDirtyState()` — track unsaved changes
- `usePendingAction()` — manage async operation pending state
- `useFormValidation()` — orchestrate form validation and submission

**Integration Points:**
- Document editor: add save status, dirty indicator, pending button
- Theme settings: add pending button, save feedback
- All future async operations

---

## Next Steps

1. **Design the complete feedback system** (system design document)
2. **Build the missing primitives** (AsyncButton, SaveStatus, hooks)
3. **Integrate into document editor** (pilot with save/dirty/pending)
4. **Extend to theme settings** (theme creation, save feedback)
5. **Add destructive confirmations** (when delete UI exists)
6. **Document the patterns** (INTEGRATION_PATTERNS.md for future devs)
7. **Test all feedback flows** (manual verification + automated tests)

---

## Deliverables Needed

- [ ] Feedback system architecture design
- [ ] Reusable component/hook library
- [ ] Integration into at least 3 real flows (document save, theme create, one more)
- [ ] Test coverage for feedback behavior
- [ ] INTEGRATION_PATTERNS.md documentation
- [ ] Before/after screenshots showing integrated feedback

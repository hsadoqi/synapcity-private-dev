# Synapcity Theme Experience

Status: Design specification, pre-implementation  
Register: Product  
Accessibility target: WCAG 2.2 AA

## 1. Product decision

Rebuild theming as two connected but independent workflows:

1. **Authoring** creates and modifies reusable saved theme records in a dedicated builder.
2. **Assignment** explicitly applies an already-saved theme to a scope or removes that assignment so the scope inherits.

The UI must never use selection, loading, saving, previewing, or palette generation as a proxy for assignment. Appearance mode remains a user preference outside the saved theme record.

## 2. Mental model

Use nouns for durable objects and verbs for transitions.

| Concept | Meaning | UI representation |
| --- | --- | --- |
| Saved theme | Persisted reusable record with a stable theme ID | Library row and builder source label |
| Selected theme | Library item with keyboard or pointer focus | Selection highlight only; no side effect |
| Editing theme | Saved record loaded as the builder baseline | Builder title and source metadata |
| Draft | Editable working copy, equal to or different from baseline | Persistent draft status in builder chrome |
| Previewed theme | Current draft rendered inside the preview boundary | “Previewing draft” label on the canvas |
| Applied theme | Saved theme explicitly assigned to a scope | Assignment status with scope name |
| Inherited theme | Effective parent styling when no assignment exists | “Inherited from …” status and parent theme name |
| Appearance mode | Light, dark, or system preference | Separate segmented control or menu |
| Scope | Root, dashboard, document, or future supported target | Scope picker and assignment breadcrumb |

The word **active** is prohibited in theming UI and state APIs unless it is qualified. Replace it with `selected`, `editing`, `previewed`, `assigned`, or `effective`.

## 3. State ownership

Keep five state domains separate:

| Domain | Persistence | Owner | May affect application CSS? |
| --- | --- | --- | --- |
| Theme library | Persistent | Theme repository/store | No |
| Builder session | In-memory with optional recovery | Builder state | Preview subtree only |
| Assignments | Persistent | Assignment repository/store | Yes, at the assigned scope boundary |
| Appearance mode | Persistent user preference | Appearance provider | Yes, semantic mapping only |
| Library selection/navigation | Ephemeral | Route/UI state | No |

### Builder session model

The builder session should contain:

- `editingThemeId: ThemeId | null`
- `baseline: ThemeRecord | null`
- `draft: ThemeDraft`
- `dirtyFields: Set<ThemeFieldPath>` or an equivalent derived diff
- `previewMode: light | dark | system-following`
- `inspectorMode: design | palette | accessibility`

Dirty state is derived from a normalized comparison of `draft` and `baseline`; timestamps and other server-owned metadata do not make a draft dirty.
Accent field presence participates in equality: absent accent and an explicitly authored accent equal to `DEFAULT_NEUTRAL_ACCENT` are different authored states.

### Theme record corrections

- `colors.accent` is optional in persisted records and drafts. Its presence means the user explicitly authored an accent.
- Resolved compiler seeds always contain primary, accent, and `accentSource: "authored" | "neutral-default"` (or an equivalent repository-specific representation).
- Appearance mode must be removed from the saved theme record.
- Assignment records store the persisted **theme record ID**, never a dashboard or document ID in `themeId`.
- Scope identity is represented separately as `{ scopeType, scopeId }`.
- Palette generation is a pure deterministic projection of a draft or saved record.
- New themes begin without an authored accent. The compiler resolves an absent authored accent to `DEFAULT_NEUTRAL_ACCENT` without persisting that fallback. Existing authored accent seeds are preserved. Resolved accent output and generated accent variables are always complete.
- Field presence preserves intent: an explicitly authored accent equal in value to `DEFAULT_NEUTRAL_ACCENT` remains authored and must not be normalized away.

## 4. State transitions and safeguards

| User action | Result | Must not happen |
| --- | --- | --- |
| Select library theme | Update selection and details | Load, preview, save, or apply it |
| Open/Edit theme | Set baseline and draft from saved record | Change any assignment |
| Change a control | Update draft and isolated preview | Change saved record or application theme |
| Revert | Restore draft from baseline | Delete or re-fetch theme unnecessarily |
| Save | Persist over the same theme ID and reset baseline | Apply the theme |
| Save as new | Persist a new theme ID, then edit that new record | Reassign scopes using the source theme |
| Apply | Assign a selected saved theme to a chosen scope | Apply an unsaved draft |
| Remove assignment | Delete the scope assignment | Generate or attach replacement palette variables |
| Delete theme | Confirm impact, delete record, resolve affected assignments explicitly | Silently orphan or rewrite assignments |

When navigation, theme switching, or closing the builder would discard a dirty draft, offer **Save**, **Discard**, and **Cancel**. Browser unload protection is a final fallback, not the primary interaction.

## 5. Information architecture

### Primary routes

```text
/settings/themes                         Theme library
/settings/themes/new                     New-theme builder
/settings/themes/[themeId]               Existing-theme builder
```

Palette, accessibility, usage, and assignment are panels or restorable builder states in V0, not standalone routes. The core editor remains one dedicated page.

### Theme library

The library is the entry point for managing records, not a gallery of decorative cards.

Structure:

- Header: “Themes”, concise explanation, **New theme** action.
- Toolbar: search, filters (`All`, `In use`, `Unused`), sort, compact/list view if needed.
- Theme list: swatch strip, name, optional description, updated time, use count, and scope summary.
- Row actions: Edit, Duplicate, Rename, Manage assignments, Delete.
- Optional details pane on wide screens: metadata, palette summary, and usage for the focused row.

Status vocabulary:

- “Used by 4 scopes” or “Not in use” rather than “Active”.
- Root use receives a clear `Root` label; other use is summarized by scope type.
- Selection is ephemeral focus or interaction state, expressed by the standard row treatment rather than a prominent badge.

Empty state teaches the model: “Themes are reusable records. Create one, preview it safely, then apply it to the app or a specific surface.”

### Theme builder

Use a restrained three-region workspace, influenced by Figma and shadcn/studio but optimized for theme authoring.

```text
┌──────────────────────────────── builder command bar ───────────────────────────────┐
│ Back  Theme name  Draft status        Revert  Save ▾                 More actions │
├───────────────┬──────────────────────────────────────────┬──────────────────────────┤
│ Section nav   │ Preview toolbar                           │ Contextual inspector     │
│ Colors        ├──────────────────────────────────────────┤ Design controls          │
│ Typography    │         isolated live preview            │ or accessibility results │
│ Shape         │                                          │                          │
│ Accessibility │                                          │                          │
│ Advanced      │                                          │                          │
└───────────────┴──────────────────────────────────────────┴──────────────────────────┘
```

Command bar behavior:

- Theme name is editable in place.
- Status is persistent text: `Saved`, `Unsaved changes`, `Saving…`, `Saved just now`, or `Save failed`.
- Primary action is **Save** only when editing an existing record.
- Save menu contains **Save as new**; new themes use **Create theme**.
- Applying is absent from the primary save cluster. A secondary **Manage assignment** action may open assignment context only after the record is saved.
- `Cmd/Ctrl+S` saves. `Cmd/Ctrl+Shift+S` opens Save as new. Announce results in a polite live region.

Section navigation is compact and persistent. Do not make users traverse one long form. The right inspector shows controls for the chosen section; the center preview remains stable so comparisons retain spatial continuity.

### Editing sections

Theme name and description live in builder chrome or a compact details surface, not a large Overview section.

1. **Colors** — required primary seed and optional authored accent. **Customize accent** adds an explicit seed; **Reset to neutral default** removes it from the draft so compilation falls back without persisting the neutral value.
2. **Typography** — heading font, body font, and scale with representative text in preview.
3. **Shape** — base radius with numeric input, step controls, and representative controls.
4. **Accessibility** — contrast results and preview stress modes.
5. **Advanced** — raw OKLCH, generated variables, version metadata, and copy/export tools. Advanced output is inspectable, never the default editing language.

### Isolated live preview

The preview is the visual center of gravity and the only subtree receiving draft variables.

Preview toolbar:

- Surface scenario: Document, Dashboard, Editor, Components.
- Appearance: Light, Dark, System preview mapping.
- Viewport: responsive width presets plus Fit.

System follows the user's current system appearance preference. Zoom, reset, diagnostics, and secondary tools live in overflow or the contextual inspector.

Representative scenarios should use real Synapcity patterns rather than a component catalogue. The default **Document** scenario contains navigation context, an editable-looking title, prose, links, a callout, metadata, form controls, and a small data region. Dashboard and editor scenarios test density and hierarchy without becoming metric-card demos.

The preview frame always displays:

- `Previewing unsaved draft` when dirty.
- `Previewing saved theme` when draft equals baseline.
- Theme name and preview appearance mode.

No draft CSS variable may be attached to `html`, `body`, the application root, or a real scope provider.

The preview boundary resolves its own fallback accent and writes the complete resolved accent variables locally. A primary-only preview must not inherit `--accent-*` values from the surrounding application.

### Palette inspector

Palette inspection is a contextual mode, not a second full page of forms.

Primary and resolved accent scales are always inspectable. When authored accent is absent, the accent inspector labels the generated scale **Using neutral default**. **Customize accent** adds an authored seed; **Reset to neutral default** removes it.

Palette and accessibility output label the fallback scale **Default neutral accent** or **Resolved fallback**. Authored-data views and exports omit the fallback; generated/runtime views may include it.

For each 50–950 step expose:

- Swatch and step label.
- Full OKLCH value and copy action.
- Intended semantic uses, when mapped.
- Contrast against preview background and foreground with numeric ratio and AA result text.

Semantic roles are shown separately from raw scales because light and dark modes may map steps differently. Provide a role table for background, foreground, primary, primary foreground, muted, muted foreground, border, focus ring, destructive, and accent roles. Warnings identify the failing pair and remediation direction; they are never color-only.

Accessibility inspection mode overlays or lists contrast failures, focus visibility checks, and text-scale stress cases for the current preview scenario. It is diagnostic, not a promise of automated WCAG certification.

### Theme assignment

V0 assignment is a contextual panel opened from a document, dashboard, root context, or saved theme. A global assignment manager is deferred until usage volume demonstrates a need.

The assignment control has two explicit states:

- **Inherited**: no assignment exists; show the parent and effective theme.
- **Explicit**: a saved theme ID is assigned; show the saved theme and assignment target.

Changing the theme picker only stages a choice. **Apply theme** commits it. **Use inherited theme** removes the assignment after a concise confirmation when the visual result will change materially.

An unsaved draft cannot be applied. If invoked from a dirty builder, explain: “Save this draft before applying it,” with **Save and continue** and **Cancel**.

Deleting a theme that is in use opens an `AlertDialog` listing affected scope counts and offers a deliberate resolution:

- Cancel.
- Reassign affected scopes to another saved theme, then delete.
- Remove affected assignments so those scopes inherit, then delete.

Never silently remove assignments during theme deletion.

### Quick theme popover

The header popover is a quick switcher, not an editor.

Contents:

- Current root assignment: theme name or `Inherited` if root inheritance is supported by the domain.
- Appearance mode segmented control: Light, Dark, System.
- Searchable compact list of saved themes with a selected candidate state.
- Explicit **Apply to root** button, disabled when the candidate is already assigned.
- Links: **Open theme library** and **Edit this theme**.

Selecting a list item does not apply it. The popover preserves the candidate until Apply or dismissal; dismissal makes no change. Use a compact `Popover` on desktop and `Sheet` on narrow screens. A command-style list is appropriate if theme counts justify search.

## 6. Responsive behavior

- **Wide desktop (≥1280px):** persistent section rail, preview, and inspector.
- **Narrow desktop/tablet (768–1279px):** section rail reduces to a compact tab/toolbar; inspector becomes a resizable or fixed-width side sheet while preview remains primary.
- **Mobile (<768px):** builder becomes a deliberate two-mode workflow: **Preview** and **Edit** tabs. Controls use a full-height sheet; save status and actions remain sticky. Do not squeeze three columns into one viewport.
- At 200% zoom, use the same structural fallback as a narrow viewport rather than hiding actions.
- Preview viewport simulation must never force the builder page itself into horizontal scrolling.

## 7. Component and design-system mapping

Reuse owned shadcn primitives and extend behavior compositionally:

| Need | Primitive/pattern |
| --- | --- |
| Builder sections | `Tabs` or semantic navigation with roving focus |
| Theme selection/search | `Command` inside `Popover`; `Sheet` on small screens |
| Save-as and row actions | `DropdownMenu` |
| Assignment context | `Sheet` or inline pane, not a modal by default |
| Destructive deletion | `AlertDialog` |
| Mode selection | `ToggleGroup` or `RadioGroup` with visible labels |
| Metadata separation | `Separator` |
| Long inspector content | `ScrollArea` with native keyboard behavior retained |
| Loading | Structure-matched `Skeleton` |
| Help | `Tooltip` only for supplementary text; never required instructions |

Avoid raw bespoke buttons, selects, and popovers where the project primitive already provides focus management and state semantics. Avoid Card as the default section wrapper: rails, panes, dividers, toolbars, and lists are the primary composition vocabulary.

### Token layers

Keep three layers explicit:

1. **Palette outputs:** deterministic `primary-50…950` and complete resolved `accent-50…950`, using `DEFAULT_NEUTRAL_ACCENT` when authored accent is absent.
2. **Semantic tokens:** background, foreground, surface, muted, border, ring, primary action, destructive, and other roles mapped per appearance mode.
3. **Component tokens/variants:** button, input, preview canvas, inspector, selected row, warning, and focus behavior consume semantic roles only.

Builder chrome must use the currently applied application theme. Only the preview boundary consumes draft palette and shape/type tokens. This separation should be visible in provider and DOM boundaries during implementation.

Do not use the theme accent as the sole indicator for builder selection, dirty state, warnings, or accessibility results; user-authored accent colors cannot be trusted to satisfy chrome contrast.

## 8. Interaction and accessibility contract

- Logical keyboard order follows command bar → section navigation → preview toolbar/content → inspector.
- Section navigation supports arrow keys; standard Tab behavior still reaches each region.
- Icon-only controls have accessible names and practical target sizes.
- Sliders always pair with numeric inputs or stepper buttons.
- Focus is never trapped outside true dialogs/sheets; closing returns focus to the invoker.
- Status changes use a polite live region; destructive failures use assertive announcements only when necessary.
- Dirty, saved, previewed, assignment, and inheritance changes are announced with the affected theme or scope name.
- Validation associates messages with fields and summarizes blocking errors near Save.
- Swatches expose text labels, values, and contrast results.
- Motion is limited to 150–250ms state transitions and disabled or reduced under `prefers-reduced-motion`.
- Every workflow remains usable at 200% zoom and with browser text enlargement.

## 9. Critical implementation boundaries

- `ThemeRepository`: create, update, duplicate, rename, delete, list.
- `AssignmentRepository`: assign, unassign, list by theme, list by scope.
- `ThemeBuilderSession`: baseline/draft/diff/revert/save orchestration; never owns application assignment.
- `ThemeCompiler`: pure deterministic palette and semantic-variable generation.
- `ThemePreviewBoundary`: accepts draft plus preview mode and attaches variables only to its own element.
- `ThemeScopeBoundary`: resolves explicit assignment or inherits without attaching palette variables when unassigned.
- `AppearanceProvider`: light/dark/system preference independent of theme records.

The UI should consume capability-oriented APIs (`saveDraft`, `assignSavedTheme`, `removeAssignment`) rather than directly mutating a shared theme store. This makes prohibited transitions difficult to express.

## 10. Acceptance criteria

1. Selecting or opening a theme never changes any assignment.
2. Editing any field changes only the builder draft and isolated preview.
3. The UI can simultaneously show four different theme identities: selected, editing, previewed, and applied.
4. Save preserves the editing theme ID; Save as new creates a new ID.
5. Save never applies; Apply accepts only a persisted theme ID.
6. Authored accent is optional in records and drafts. The compiler always resolves a valid accent; neutral fallback is never persisted as authored data, and reset removes the explicit seed.
7. An unassigned scope attaches no primary or accent palette variables and inherits through CSS cascade.
8. Palette generation is deterministic and creates neither a record nor an ID.
9. Appearance mode remains independent of the saved theme.
10. Deleting an applied theme requires explicit resolution for affected assignments.
11. The header popover contains no authoring controls.
12. Dirty, save, preview, apply, and inheritance transitions are conveyed visually and announced accessibly.
13. The builder is keyboard complete, usable at 200% zoom, and structurally functional at narrow desktop widths.
14. Contrast results are numeric and textual; warnings never rely on hue alone.
15. Draft variables cannot be found on the document root or any real application scope outside the preview boundary.
16. Authored export and persistence preserve accent field presence: absent stays absent, while an explicitly authored value equal to the neutral default remains authored.
17. A primary-only preview resolves and owns its neutral accent variables locally; surrounding application accent values cannot leak into it.

## 11. Recommended delivery sequence

1. Correct the record, appearance, assignment, and draft domain contracts.
2. Establish repository and compiler boundaries with transition-level tests.
3. Build the isolated preview boundary and prove variable containment.
4. Build theme library and record-management flows.
5. Build builder shell, draft lifecycle, and section inspectors.
6. Add palette and accessibility inspection.
7. Build contextual assignment panels; defer a global assignment manager.
8. Replace the header editor with the quick switcher.
9. Validate keyboard paths, announcements, zoom, narrow layouts, contrast, and destructive flows.

No visual polish phase should begin until the transition rules in the acceptance criteria are enforced by the state model.

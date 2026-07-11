# Synapcity Theme V0 Implementation Plan

Status: Repository-grounded, pre-implementation  
Authoritative design inputs: `theme-experience-design-spec.md`, `theme-interface-composition-spec.md`  
Scope: `/settings/themes`, `/settings/themes/new`, `/settings/themes/[themeId]`

## 1. Current-state architecture summary

The current implementation is a client-side theme module backed by `localStorage` and a hand-built external store using `useSyncExternalStore`; it is not currently Zustand.

### Data and persistence

- `modules/theme/types.ts` defines `ThemeRecord`, `ThemeAssignment`, `ThemeResolution`, palette types, and appearance mode. `ThemeRecord.seeds.accent` is currently required, but the corrected authored model makes it optional; `ThemeRecord.mode` incorrectly embeds appearance in the saved record.
- `modules/theme/constants.ts` owns storage keys, palette steps, and `DEFAULT_THEME_RECORD`. The default record includes a required accent and `mode: "system"`.
- `modules/theme/storage/theme-storage.ts` performs low-level `localStorage` reads/writes. It normalizes radius, type scale, and fonts, but does not fully validate record shape, assignment referential integrity, accent validity, or schema migrations.
- `modules/theme/store/theme-store.ts` owns the theme collection, assignments, hydration, save, delete, assignment mutation, and an `activeThemeId`. `saveTheme()` changes `activeThemeId`; `deleteTheme()` silently removes every assignment that references the deleted record.
- `useThemes()` and `useThemeAssignment()` are thin mutation facades over the store. `useResolvedTheme()` separately implements fallback-based resolution instead of using `resolveThemeAssignment()`.

### Compilation and application

- `engine/oklch.ts` provides strict parsing, normalization, formatting, and clamping.
- `engine/generate-palette.ts` deterministically generates the 50–950 scale from one OKLCH seed using stable lightness and chroma curves.
- `engine/build-theme-vars.ts` compiles primary, accent, radius, type scale, and font variables. It currently assumes authored accent exists and has no explicit authored-to-resolved fallback boundary.
- `packages/ui/src/styles/globals.css` maps runtime palette variables to semantic shadcn/Tailwind variables for light and dark appearances. This CSS-first semantic mapping is reusable.
- `ThemeRootProvider` uses `useResolvedTheme("global", "root")`, compiles the resolved theme, and mutates `<html>` variables and `data-theme-*` attributes in an effect.
- `ThemeScopeProvider` wraps document/dashboard surfaces. It only attaches inline variables when `useResolvedTheme()` reports `assigned`, which is the correct containment shape for genuinely unassigned scopes. However, missing assignments are silently replaced with the default theme by `useResolvedTheme()`, so missing-theme integrity is obscured.
- `resolveThemeAssignment()` already implements the stricter reusable result contract: `unassigned`, `assigned`, or `missing-theme`. It is not used by the providers.

### UI and routes

- The only route is `app/(app)/settings/theme/page.tsx`; it renders `ThemeSettingsPage` as one long editing/settings page.
- `ThemeSettingsPage` owns ephemeral selection, renders the full `ThemeEditor`, a saved-record palette panel, and root assignment together.
- `ThemeEditor` owns a local `ThemeRecord` draft, dirty comparison, validation, Save, Save as new, and immediate delete. It edits name, description, colors, shape, and type in a long form.
- `ThemeEditor`'s small “live preview” only applies radius and inline font sizes. It does not call `buildThemeVars(draft)` and therefore is not a real isolated theme preview.
- `ThemeAssignmentPanel` mutates assignment immediately when its native select changes and also offers `Apply selected`; selection and commit are therefore conflated.
- `header-actions.tsx` embeds the full `ThemeEditor` inside a 720px popover. Appearance is a separate binary light/dark icon toggle and does not expose System.
- `app/layout.tsx` mounts `ThemeRootProvider` through `root-providers.tsx`; `next-themes` owns the `.light`/`.dark` class, although `<html>` begins with a hard-coded `light` class.
- Document and dashboard detail routes correctly use route params as `scopeId` while assignments store a separate theme record ID.
- `AppProviders` owns `SidebarProvider`; its uncontrolled state and cookie persistence are reusable, but there is no builder-specific automatic collapse/restore controller.

### Existing verification surface

- There are no theme unit, component, or end-to-end tests.
- The workspace has build, lint, and typecheck scripts only. No Vitest, Testing Library, or Playwright configuration is present.
- Existing UI primitives include Button, Input, Textarea, Popover, Sheet, Dialog, DropdownMenu, Command, Combobox, RadioGroup, ToggleGroup, Collapsible, Resizable, ScrollArea, Separator, Skeleton, Sidebar, and Tooltip. There is no local Field, Tabs, Alert, AlertDialog, Badge, Empty, Select, Slider, or toast primitive in the current inventory.

## 2. Gap analysis against the approved acceptance criteria

| # | Acceptance criterion | Current evidence | Gap / required disposition |
| ---: | --- | --- | --- |
| 1 | Selecting/opening never changes assignment | Library does not exist; `ThemeEditor` select only changes local selection. | Preserve this behavior, move selection to library/navigation, and test that open/select never calls assignment APIs. |
| 2 | Editing changes only draft and isolated preview | `ThemeEditor.updateDraft()` is local, but preview does not compile draft vars. | Reuse local draft principle; create builder session and preview boundary. Assert no root/scope mutation during edits. |
| 3 | Selected, editing, previewed, and applied identities may differ | Current page collapses selected/editing; preview identity is implicit; applied identity is adjacent. | Add explicit derived labels in command bar, preview footer, and contextual usage panel without promoting ephemeral selection. |
| 4 | Save preserves ID; Save as new creates ID | `saveCurrentTheme()` preserves ID; `saveAsNewTheme()` uses `crypto.randomUUID()`. | Reuse ID behavior. Move ID creation into a testable repository/store command and navigate to the new route after creation. |
| 5 | Save never applies; Apply accepts persisted ID | Save does not write assignment, but it mutates `activeThemeId`; assignment accepts any string. | Remove `activeThemeId`; validate `themeId` exists before assignment; keep Save and Apply APIs/components separate. |
| 6 | Authored accent is optional; resolved accent is required | `ThemeRecord.seeds.accent`, validation, and compiler currently require an authored value. | Make persisted/draft accent optional, preserve existing explicit seeds, initialize new drafts without one, resolve absence to `DEFAULT_NEUTRAL_ACCENT` only inside compilation, and always emit complete accent variables. |
| 7 | Unassigned scope adds no palette vars and inherits | `ThemeScopeProvider` omits style for `inherited`, but `useResolvedTheme()` fabricates fallback results; root always writes vars. | Route both providers through strict resolution. Scoped unassigned remains wrapper/no style. Define root fallback separately from explicit assignment and do not describe it as assigned. |
| 8 | Palette generation is deterministic and creates no ID | `generatePalette()` is pure/deterministic and unrelated to persistence. | Reuse unchanged initially; add deterministic fixture tests before UI work. |
| 9 | Appearance is independent | `next-themes` is separate at runtime, but `ThemeRecord.mode` and default record duplicate ownership; quick toggle omits System. | Remove/migrate record mode; retain `next-themes` as sole owner; add Light/Dark/System controls and resolved System label. |
| 10 | Deleting in-use requires explicit resolution | `themeStore.deleteTheme()` silently filters assignments. `ThemeEditor` deletes immediately. | Replace delete command with impact query plus explicit `reassign`, `inherit`, or cancel resolution; use confirmation UI. |
| 11 | Header popover has no authoring controls | `ThemeFormPopover` embeds the full `ThemeEditor`. | Remove that composition and replace with quick switcher only. |
| 12 | State transitions are visual and announced | Dirty badge exists visually; no live region; assignment is immediate; no saving/error state. | Add builder status state and polite announcements; ensure inheritance/apply changes are named. |
| 13 | Keyboard, 200% zoom, narrow desktop | Native controls provide a partial baseline; current long page and popover are not approved composition. | Build fixed desktop shell, container-driven collapse, independent scroll regions, shortcuts, focus return, and later mobile-compatible structure. |
| 14 | Contrast is numeric/textual | Swatches show raw values only; `getStepLabelColor()` uses a lightness threshold, not contrast calculation. | Add known semantic-pair contrast evaluator and diagnostic output; do not claim complete WCAG automation. |
| 15 | Draft vars never escape preview | Draft is not currently compiled at all; root compiles persisted fallback/assignment only. | Create an isolated preview element that owns `style={buildThemeVars(draft)}`. Add DOM tests proving draft values are absent from `<html>` and real scope wrappers. |

## 3. File-by-file recommendations

### Reuse with little or no behavioral change

| File / symbol | Recommendation | Reason |
| --- | --- | --- |
| `engine/oklch.ts` | **Reuse**, extend tests only. | Parsing/normalization are pure and suitable for draft validation. |
| `engine/generate-palette.ts::generatePalette` | **Reuse**, add fixtures. | Deterministic generation already matches the required engine boundary. |
| `font-registry.ts` | **Reuse**. | Curated IDs and CSS value resolution are compatible with V0. |
| `resolution/resolve-theme-assignment.ts::resolveThemeAssignment` | **Reuse as canonical resolver**. | It already preserves `unassigned` and `missing-theme` without fallback. |
| `packages/ui/src/styles/globals.css` semantic light/dark mapping | **Reuse**, modify only where builder structural tokens require it. | Semantic roles correctly stay CSS-owned and separate from generated palette values; accent palette variables remain structurally available. |
| `ThemeScopeProvider` wrapper/data attributes | **Reuse shape**, modify its resolution source. | Inline vars are already omitted for non-assigned status. |
| `ColorPicker` conversion utilities and `rgba-oklch.ts` | **Reuse conversion logic**, replace overlay composition. | Color conversion works; focus/portal behavior of the hand-rolled absolute popover does not. |
| `PaletteScalePreview` / `ThemeSwatch` generation display | **Reuse engine integration**, refactor presentation and optionality. | They already render generated steps and accessible raw-value labels. |
| Shared shadcn primitives listed above | **Reuse** before adding missing primitives. | Existing Radix/Lyra behavior supports most approved overlays, navigation, scrolling, and controls. |

### Modify

| File / symbol | Required change |
| --- | --- |
| `types.ts::ThemeRecord` | Change authored data to `seeds.accent?: string`; remove `mode`; introduce `ThemeDraft` with optional authored accent and a resolved compiler representation whose accent is required; add typed delete-resolution inputs/results. |
| `constants.ts::DEFAULT_THEME_RECORD` | Remove `mode`; export `DEFAULT_NEUTRAL_ACCENT` for compiler resolution only. New-theme authored data omits accent. Preserve existing default/custom theme accent values when they were explicitly stored. |
| `storage/theme-storage.ts` | Add version-aware parsing/migration for `mode` removal and optional authored accent. Preserve every valid existing explicit accent. Missing accent remains omitted; invalid explicit accent is rejected or omitted according to the normalization policy, never replaced and persisted as the neutral fallback. Validate assignments and expose injectable storage for tests if feasible. |
| `store/theme-store.ts` | Remove `activeThemeId`; keep library and assignment snapshots; add named commands for create/update/duplicate/rename, impact inspection, resolved deletion, and validated assignment. Never cascade assignment deletion implicitly. Export a store factory for isolated tests. |
| `hooks/use-themes.ts` | Expose capability-oriented commands and lookup selectors rather than generic save/delete only. |
| `hooks/use-theme-assignment.ts` | Separate staged UI choice from mutation; hook exposes current assignment and explicit `applySavedTheme(themeId)` / `useInheritedTheme()`. Validate persisted ID in store command. |
| `hooks/use-resolved-theme.ts` | Replace fallback implementation with a thin reactive wrapper around `resolveThemeAssignment()`. Return the canonical `ThemeResolution`. Do not fabricate `assigned`. |
| `engine/build-theme-vars.ts::buildThemeVars` | Add an explicit resolution step: `authoredAccent ?? DEFAULT_NEUTRAL_ACCENT`. Compile complete accent variables unconditionally from the resolved representation without mutating or persisting authored data. |
| `providers/theme-root-provider.tsx` | Split appearance provider from root assignment effects. Use strict root resolution; clear stale variables/attributes when assignment changes or is removed. Treat any application visual fallback as an explicit baseline owned by CSS, not a stored assignment. |
| `providers/theme-scope-provider.tsx` | Use canonical resolver; preserve no-style inheritance; expose `missing-theme` in data attributes without compiling fallback vars. |
| `pages/theme-settings/theme-settings-page.tsx` | Replace with route-specific library shell or remove after routes land. It must stop combining authoring, output, and assignment. |
| `header-actions.tsx` | Replace `ThemeFormPopover` with `ThemeQuickSwitcher`; expose Light/Dark/System; update links to `/settings/themes`. |
| `app-sidebar.tsx`, `app-route-context.ts`, `get-route-kind.ts`, `app/page.tsx`, `app-header.tsx` | Change singular `/settings/theme` recognition/links to the three-route `/settings/themes` family without altering unrelated shell behavior. |
| `AppProviders` / `SidebarProvider` integration | Add a builder-aware controller that can temporarily close the global sidebar at constrained builder widths and restore the exact previous open state on unmount/route exit. Do not bake theme-route logic into the generic primitive. |
| `app/(app)/layout.tsx` | Allow theme builder routes to opt into edge-to-edge, non-page-root scrolling without changing document/dashboard layout. Prefer a nested settings/themes layout or route-aware content wrapper. |

### Replace or delete after consumers move

| File / symbol | Disposition |
| --- | --- |
| `components/theme-editor.tsx::ThemeEditor` | **Replace composition**, retaining pure normalization/dirty logic after extracting it. The long form, embedded preview, native controls, and inline delete do not fit V0. Delete the old component once new builder consumers land. |
| `components/theme-assignment-panel.tsx` | **Replace** with contextual usage/assignment panel that stages a candidate and commits only on explicit action. |
| `ThemeFormPopover` in `header-actions.tsx` | **Delete** after `ThemeQuickSwitcher` is wired. |
| `app/(app)/settings/theme/page.tsx` | **Delete or redirect** after `/settings/themes` ships. Prefer a temporary redirect for existing local links/bookmarks during migration, then remove when safe. |
| `ThemeState.activeThemeId` and all fallback logic based on it | **Delete**. It has no approved domain meaning. |

### Create for V0

| Proposed file | Responsibility |
| --- | --- |
| `modules/theme/model/theme-draft.ts` | Editable projection, normalization, validation, equality/diff, and `revertPersistedFields()` helpers. |
| `modules/theme/engine/resolve-theme-seeds.ts` | Pure authored-to-resolved conversion returning required primary/accent plus `accentSource`; preserve the source object and field-presence intent. Exact filename may follow existing conventions. |
| `modules/theme/store/create-theme-store.ts` or exported factory in current store | Isolated store construction for unit tests; keep current infrastructure rather than forcing Zustand. |
| `modules/theme/hooks/use-theme-builder-session.ts` | Baseline/draft/save status/section/preview preferences. Revert changes persisted fields only and preserves scenario, viewport, preview appearance, and section. |
| `modules/theme/engine/build-preview-vars.ts` (optional thin alias) | If useful, make draft-to-vars intent explicit while delegating to corrected compiler; do not duplicate compilation. |
| `modules/theme/engine/contrast.ts` | Relative luminance/contrast for known semantic-token pairs and typed diagnostic results. Use `culori` already installed. |
| `modules/theme/components/theme-library/*` | Editorial index, toolbar, row, palette signature, empty/loading states, usage trigger. |
| `modules/theme/components/theme-builder/*` | Builder shell, command bar, section navigation, preview toolbar/frame, inspector host, section panels, status live region. |
| `modules/theme/components/theme-preview/*` | Isolated boundary and real Document/Dashboard/Editor/Components scenarios. |
| `modules/theme/components/theme-usage/*` | Usage summary, contextual assignment sheet/panel, delete impact/resolution UI. |
| `modules/theme/components/theme-quick-switcher.tsx` | Root summary, appearance control, candidate list, explicit Apply, builder/library links. |
| `app/(app)/settings/themes/page.tsx` | Library route entry. |
| `app/(app)/settings/themes/new/page.tsx` | New builder route entry. |
| `app/(app)/settings/themes/[themeId]/page.tsx` | Saved builder route entry; await params per current Next 16 convention and render not-found for unknown IDs after hydration strategy is resolved. |
| `app/(app)/settings/themes/layout.tsx` | Builder-compatible region wrapper and route-scoped layout behavior if needed; do not create additional URLs. |
| `modules/theme/**/*.test.ts(x)` plus test setup | Unit/component coverage described below. |

### Defer

- Global assignment-manager route or scope tree.
- Standalone palette or accessibility routes.
- Full mobile theme authoring polish; preserve the Preview/Edit architecture and accessible fallback, but complete desktop/narrow-desktop first.
- Arbitrary user-created preview scenarios.
- Complete WCAG crawler/automation; V0 diagnostics cover known semantic pairs, focus visibility, and text-scale stress cases.
- Backend/database persistence, collaboration, import/export registry, and cross-device sync.

## 4. Proposed state ownership after refactoring

| State | Owner | Persistence | Notes |
| --- | --- | --- | --- |
| `themes` | Existing external theme store | `localStorage` | Records only; no active/selected ID. |
| `assignments` | Existing external theme store | `localStorage` | Mutation only through validated explicit commands. |
| `baseline` and `draft` | `useThemeBuilderSession` | Session memory; optional recovery deferred | Name and description included. Baseline refreshes after successful save. |
| `saveStatus` / validation | Builder session | Ephemeral | Drives command bar and live announcements. |
| `section` | Builder session, restorable UI state | Prefer URL query or session storage without new route | Colors/Typography/Shape/Accessibility/Advanced. |
| `scenario`, `viewport`, `previewAppearance` | Builder preview state | Session/restorable UI state | Revert must not reset these. `system` resolves through next-themes/system preference. |
| Library focus/selection | Library component | Ephemeral | Never stored globally and never shown as a domain badge. |
| Quick-switcher candidate | Quick switcher component | Ephemeral | Apply commits; dismissal discards. |
| Appearance preference | `next-themes` | Its existing storage | Sole owner of Light/Dark/System. |
| Global sidebar open state | Existing `SidebarProvider` | Existing cookie/user state | Builder controller temporarily overrides only when cramped, then restores prior value. |

The existing store may remain custom or be migrated to Zustand later; V0 correctness depends on mutation boundaries, not library choice.

## 5. Proposed route and component tree

```text
app/(app)/layout.tsx
└─ AppShell
   ├─ AppHeader
   │  └─ ThemeQuickSwitcher
   ├─ AppContextToolbarBridge
   └─ MainSidebarContainer
      ├─ AppSidebar
      └─ SidebarInset
         └─ settings/themes/layout.tsx
            └─ ThemeWorkspaceBoundary
               ├─ BuilderSidebarCoordinator (builder routes only)
               └─ route content
                  ├─ /settings/themes
                  │  └─ ThemeLibraryPage
                  │     ├─ ThemeLibraryHeader
                  │     ├─ ThemeLibraryToolbar
                  │     └─ ThemeLibraryList
                  │        └─ ThemeLibraryRow
                  ├─ /settings/themes/new
                  │  └─ ThemeBuilderPage mode="create"
                  └─ /settings/themes/[themeId]
                     └─ ThemeBuilderPage mode="edit"
                        ├─ ThemeBuilderSessionProvider/hook owner
                        └─ ThemeBuilderShell
                           ├─ ThemeCommandBar (fixed)
                           ├─ ThemeSectionNavigation
                           ├─ ThemePreviewRegion
                           │  ├─ ThemePreviewToolbar (fixed)
                           │  ├─ ThemePreviewWorkbench (scroll owner)
                           │  │  └─ ThemePreviewBoundary style=draftVars
                           │  │     └─ scenario component
                           │  └─ ThemePreviewStatus
                           └─ ThemeInspector (independent scroll owner)
                              ├─ ColorsInspector
                              ├─ TypographyInspector
                              ├─ ShapeInspector
                              ├─ AccessibilityInspector
                              ├─ AdvancedInspector
                              └─ contextual ThemeUsageAssignmentPanel
```

Use a shared `ThemeBuilderPage` component for create/edit modes, but keep the route entries separate so URL semantics, loading, not-found, and post-save navigation remain explicit. The route entry can remain a Server Component; the interactive builder subtree is the client boundary.

## 6. Provider and CSS-variable containment structure

```text
<html class="light|dark" data-theme-id? style="persisted root vars only">
  ThemeModeProvider (next-themes; appearance owner)
    ThemeRootAssignmentEffect (strict global/root resolution)
      AppShell (uses persisted root assignment or CSS baseline)
        ThemeScopeProvider scope=document|dashboard
          assigned  -> wrapper style contains persisted assigned theme vars
          unassigned -> wrapper has no palette style; CSS cascade inherits
          missing    -> wrapper has no palette style; integrity status exposed

        ThemeBuilderShell (uses normal app chrome vars)
          ThemePreviewWorkbench (neutral chrome)
            ThemePreviewBoundary
              style = buildThemeVars(draft)
              data-preview-theme-id = editing ID or "new-draft"
              scenario subtree consumes draft vars
```

Implementation rules:

1. `ThemePreviewBoundary` is the only draft-variable writer.
2. Root assignment effects receive only persisted records selected by an explicit root assignment. When the root assignment disappears, remove every previously written theme variable and `data-theme-id`; CSS baseline variables remain from `globals.css`.
3. Scope providers never call the compiler for `unassigned` or `missing-theme`.
4. Every valid authored record and draft resolves to a compiler input with a required accent and emits `--accent-50…950`. New drafts omit authored accent; reset removes it; neither operation persists `DEFAULT_NEUTRAL_ACCENT` as user-authored data.
5. Appearance changes semantic mappings via `.light`/`.dark`; they do not alter the draft or saved record.
6. Test containment against actual DOM style properties, not only component props.
7. The preview boundary calls the pure seed resolver for its own draft and writes every resolved `--accent-*` variable locally, preventing inheritance from root/application accent variables.

## 7. Data-flow diagrams

### Opening a saved theme

```text
Library row / Edit link
  -> navigate /settings/themes/[themeId]
  -> route validates param shape
  -> builder reads persisted record from hydrated theme store
  -> create baseline = normalized persisted fields
  -> create draft = clone(baseline)
  -> initialize section/preview preferences independently
  -> render command bar + isolated draft preview
  X no assignment mutation
  X no root/scope CSS mutation
```

### Editing a draft

```text
Inspector field event
  -> builderSession.updateDraft(fieldPath, value)
  -> validate editable projection
  -> derive dirty from normalized baseline vs draft
  -> update command-bar status/live region
  -> recompute preview vars
  X no repository/store mutation
```

### Previewing

```text
draft + previewAppearance + scenario + viewport
  -> resolveThemeSeeds(draft.seeds)
       -> authored accent present: preserve value + source="authored"
       -> authored accent absent: DEFAULT_NEUTRAL_ACCENT + source="neutral-default"
  -> buildThemeVars(resolved draft)
  -> ThemePreviewBoundary inline custom properties
  -> selected scenario consumes semantic tokens inside boundary
  -> accessibility evaluator checks known pairs for resolved appearance
  X document.documentElement unchanged
  X real ThemeScopeProvider wrappers unchanged
```

### Saving

```text
Save / Cmd+S
  -> validate draft
  -> normalize persisted fields
  -> themeStore.updateTheme(existingThemeId, payload)
  -> storage replaces same ID
  -> store snapshot emits
  -> builder baseline = persisted result
  -> draft = persisted editable projection
  -> status Saved + polite announcement
  X no assignment command
```

### Saving as new

```text
Save as new
  -> validate + normalize draft
  -> themeStore.createTheme(new UUID, copied fields, new timestamps)
  -> storage appends record
  -> navigate /settings/themes/[newThemeId]
  -> baseline/draft initialize from new record
  X source assignments unchanged
  X new theme not applied
```

### Applying

```text
Quick switcher or contextual panel chooses candidate
  -> component stores candidateThemeId ephemerally
  -> user invokes Apply
  -> themeStore.assignSavedTheme(scope, scopeId, candidateThemeId)
  -> command verifies candidate exists in current persisted themes
  -> assignment storage updates one scope key
  -> provider resolves assigned record
  -> provider writes persisted theme vars at that scope only
```

### Removing assignment

```text
User invokes Use inherited theme
  -> confirm when effective appearance materially changes
  -> themeStore.removeAssignment(scope, scopeId)
  -> assignment record removed
  -> provider resolves unassigned
  -> provider clears/removes prior inline vars and theme ID
  -> normal CSS cascade supplies parent values
```

### Deleting an in-use theme

```text
Delete action
  -> themeStore.getThemeUsage(themeId)
  -> if usage = 0: confirm -> delete record
  -> if usage > 0: show affected count/scopes
       -> Cancel: no mutation
       -> Reassign: validate replacement ID
          -> atomically rewrite affected assignments
          -> delete record
       -> Use inherited: remove affected assignments
          -> delete record
  -> emit one coherent snapshot
  -> navigate to library if deleting current editing record
  X never silently remove or orphan assignments
```

## 8. Ordered implementation sequence and dependencies

### Phase 0 — Test harness and characterization

Dependencies: none.

1. Add a unit/component test runner compatible with React 19 and the workspace (prefer Vitest + jsdom + Testing Library unless repository constraints discovered during implementation require another choice).
2. Export/create injectable store and storage seams without changing behavior.
3. Characterize palette generation, resolver states, current storage normalization, and provider DOM behavior.

Completion tests:

- Fixed palette snapshots/explicit step assertions for representative low/high chroma seeds.
- `resolveThemeAssignment()` tests for assigned, unassigned, and missing theme.
- Storage round-trip tests using an isolated storage implementation.
- Baseline provider test documenting current root variable writes before correction.

No screenshot checkpoint; no UI changes.

### Phase 1 — Correct domain and persistence contracts

Depends on Phase 0.

1. Make authored accent optional, introduce the required resolved compiler representation and neutral fallback contract, and remove saved appearance mode.
2. Add a pure `resolveThemeSeeds()` equivalent; field presence, not value equality, determines `accentSource`.
3. Add migration/normalization for existing local records.
4. Remove `activeThemeId`.
5. Add explicit create/update/duplicate/rename, usage inspection, resolved delete, validated assignment, and removal commands.
6. Make the strict assignment resolver canonical.

Completion tests:

- New records/drafts omit authored accent; valid existing custom accents load, save, duplicate, export, and round-trip unchanged.
- Missing authored accent remains omitted through save/export. Invalid explicit accent never causes the neutral fallback to be persisted as authored data.
- Compiler resolution returns `DEFAULT_NEUTRAL_ACCENT` for missing authored accent without mutating the source object.
- An explicitly authored accent equal to `DEFAULT_NEUTRAL_ACCENT` resolves with `accentSource: "authored"` and survives round-trip/export as an authored field.
- Draft equality treats absent accent and explicitly authored neutral-default accent as different states; Customize adds the field and Reset removes it.
- Legacy records with `mode` load without appearance ownership leaking into the model.
- Save/update preserves ID; create/duplicate generates a distinct ID.
- Assign rejects missing theme IDs.
- Delete with usages refuses an unresolved delete; reassign/inherit paths update assignments correctly.
- Saving never changes assignments.

No screenshot checkpoint; state transitions must be green before visual work.

### Phase 2 — Compiler, provider, and containment correction

Depends on Phase 1.

1. Add authored-to-resolved accent compilation and canonical-neutral fallback behavior.
2. Wire providers to canonical resolution.
3. Clear stale root/scope variables when assignments are removed or become missing.
4. Separate `ThemeModeProvider` from root assignment effect while retaining `next-themes`.
5. Create `ThemePreviewBoundary` and containment tests using a draft fixture.

Completion tests:

- Every valid record and draft compiles all `--accent-50…950` keys whether authored accent exists or not.
- Resetting a customized accent removes `seeds.accent`; the compiler then regenerates the deterministic neutral fallback scale without persisting the fallback.
- A primary-only preview overrides every surrounding `--accent-*` variable with its locally resolved neutral scale.
- Root unassigned state is not labeled assigned and stale runtime vars are cleared.
- Scoped unassigned/missing states add no inline primary/accent vars.
- Assigned scope writes the persisted theme record ID to `data-theme-id`.
- Editing/rendering draft vars changes only preview boundary styles.
- Light/dark/system changes do not mutate theme records.

No screenshot checkpoint until all DOM containment assertions pass.

### Phase 3 — V0 routes and library

Depends on Phase 1; may proceed alongside late Phase 2 after store APIs stabilize.

1. Update route metadata and all singular theme links.
2. Add `/settings/themes`, `/new`, and `/[themeId]` entries plus loading/not-found behavior.
3. Build the editorial theme index, palette signature, filters, usage trigger, and record actions.
4. Keep existing `/settings/theme` as a temporary redirect only if desired for local continuity.

Completion tests:

- Route-context tests classify all three routes as theme settings/builder surfaces.
- Library row activation navigates only; assignments remain unchanged.
- Usage trigger does not activate the row or apply a theme.
- Library palette signature shows primary only when authored accent is absent and never includes the resolved fallback as an authored color.
- Empty, loading, search, and filter states are keyboard operable.
- Duplicate/rename/delete-zero-usage commands render updated rows.

Screenshot checkpoint A:

- Review `/settings/themes` at 1440×900, 1024×768, and 390×844 against “Composition,” “Library and quick switcher,” and “Visual restraint” checklist groups.

### Phase 4 — Builder session and desktop shell

Depends on Phases 1–3 and preview boundary from Phase 2.

1. Extract draft normalization/validation/dirty comparison from old `ThemeEditor`.
2. Build create/edit builder session with independent preview preferences and section state.
3. Implement fixed command bar, 176px section rail, flexible preview, 336px inspector, and independent scroll owners.
4. Add Colors, Typography, and Shape inspectors first.
5. Implement Save, Save as new, Create, Revert, dirty-navigation guard, shortcuts, and live announcements.
6. Ensure Revert preserves section, scenario, viewport, and preview appearance.

Completion tests:

- Draft changes do not mutate store until Save/Create.
- Name/description participate in dirty comparison and persistence.
- Revert restores every persisted field only.
- Save updates same ID and resets baseline; Save as new navigates to new ID.
- Keyboard shortcuts call correct commands and respect validation.
- Command/preview toolbars remain outside scroll owners.
- Preview and inspector scroll independently; page root is not the desktop scroll owner.

Screenshot checkpoint B:

- Review saved and new builders at 1440×900 and 1280×800 only after transition/containment tests pass.
- Check composition dominance, fixed regions, density, no long-form behavior, and preview containment.

### Phase 5 — Narrow desktop and sidebar coordination

Depends on Phase 4.

1. Add builder container queries and section-rail-to-tab transformation.
2. Implement inspector dock/close/sheet behavior at documented widths.
3. Add builder sidebar coordinator using `useSidebar()`: snapshot open state on entry, automatically close only when builder container would fall below its essential minimum, and restore the snapshot on unmount/route exit.
4. Preserve manual user sidebar intent where it can be distinguished; never write a permanent collapsed preference merely because the builder temporarily required space.

Completion tests:

- Coordinator closes an initially open sidebar at cramped width and restores it on exit.
- Initially collapsed sidebar remains collapsed after exit.
- Wide builder does not modify sidebar state.
- Essential preview minimum precedes inspector/rail collapse according to spec.
- No horizontal page scrolling at 1024px and 200% zoom.

Screenshot checkpoint C:

- Review at 1024×768, 768×1024, and 200% zoom.
- Confirm sidebar collapse order, horizontal section navigation, preview utility, inspector discoverability, fixed toolbars, and independent scroll.

### Phase 6 — Accessibility and advanced inspectors

Depends on compiler/provider correction and builder shell.

1. Add known semantic-pair contrast evaluator for resolved Light/Dark/System appearance.
2. Add failing-pairs-first Accessibility inspector, focus visibility diagnostic, and text-scale stress controls.
3. Add Advanced raw values/variables/generation metadata as collapsible expert content.
4. Show `Using neutral default` when authored accent is absent and `Customized` when present; keep the resolved accent scale visible in both states; Customize adds a seed and Reset removes it.

Completion tests:

- Contrast fixtures return numeric ratios and AA pass/fail for known pairs.
- System preview evaluates the currently resolved system appearance.
- Palette and accessibility inspectors label an absent-authored-accent scale `Default neutral accent` or `Resolved fallback`.
- Diagnostics never modify draft or application appearance.
- Focus/text-scale controls affect only preview diagnostic state.
- Fallback and customized accent states are labeled textually; both show complete resolved accent palette rows and variables, while exported authored data omits an uncustomized accent.

Screenshot checkpoint D:

- Review Accessibility and Advanced sections at 1440×900 and 1024×768, including failing and all-passing fixtures.

### Phase 7 — Contextual assignment, deletion resolution, and quick switcher

Depends on Phases 1–3; UI integration is safest after Phase 4.

1. Build usage/assignment panel with staged candidate and explicit Apply/Use inherited.
2. Build deletion impact/resolution flow.
3. Replace header `ThemeFormPopover` with 360px quick switcher.
4. Expose Light/Dark/System from `next-themes`; keep candidate/apply state separate.
5. Remove old editor/assignment compositions and update exports.

Completion tests:

- Candidate selection does not assign; Apply does.
- Dismissing switcher discards candidate.
- Appearance changes immediately and does not alter theme/assignment records.
- Inherit removes assignment and clears scope vars.
- In-use delete cannot complete without resolution.
- Reassign/inherit delete paths name and update affected scopes.
- Header contains no authoring inputs.

Screenshot checkpoint E:

- Review quick switcher and usage/assignment panel at desktop and narrow desktop.
- Review destructive dialogs with zero, one, and multiple affected scopes.

### Phase 8 — Responsive preservation, regression, and removal

Depends on all earlier phases.

1. Preserve the approved mobile Preview/Edit structure and basic operability without pursuing full mobile authoring polish.
2. Delete old `ThemeEditor`, `ThemeAssignmentPanel`, and obsolete settings page once no imports remain.
3. Run typecheck, lint, build, unit/component tests, and browser flows.
4. Inspect DOM variables during real browser interactions.

Completion tests:

- All 15 acceptance criteria have direct automated or documented browser evidence.
- Mobile route is operable with Save/Create reachable and no squeezed three-column layout.
- No old singular links or authoring popover remain.
- No unrelated app-shell behavior regresses on documents/dashboards.

Screenshot checkpoint F:

- Full checklist at 1440×900, 1280×800, 1024×768, 768×1024, 390×844, and 200% zoom.

## 9. Test matrix required by layer

### Pure unit tests

- OKLCH parse/normalize boundaries.
- Palette deterministic outputs and invalid-seed fallback characterization.
- Authored-to-resolved compiler output for absent and customized accent seeds.
- Resolver intent tests: absent accent reports `neutral-default`; an explicitly authored neutral-default value reports `authored`.
- Theme draft normalization, validation, dirty equality, and persisted-only revert.
- Dirty equality distinguishes absent accent from an explicitly authored accent equal to `DEFAULT_NEUTRAL_ACCENT`.
- Canonical assignment resolution.
- Contrast ratios for known semantic pairs.
- Storage migration and malformed-data fallback.

### Store command tests

- Hydration and snapshot stability.
- Create/update/duplicate/rename.
- Save does not assign.
- Validated assignment and explicit removal.
- Usage lookup.
- Delete without use; delete refused with unresolved use; delete with reassign; delete with inherit.
- One coherent snapshot emission for multi-record delete resolution.

### Component/DOM tests

- Preview boundary style containment.
- Primary-only preview fallback overrides surrounding root/application accent variables.
- Root/scope variable clearing.
- Builder dirty/save/revert/live-region behavior.
- Library keyboard navigation and row action isolation.
- Quick-switcher staging vs Apply.
- Assignment panel staging vs Apply/Use inherited.
- Dirty navigation confirmation and focus return.
- System resolved appearance labels.

### Browser tests

- Open/edit/preview/save without root visual change.
- Save as new and confirm source assignments unchanged.
- Apply saved theme at root and document/dashboard scope.
- Remove scope assignment and confirm computed inheritance plus absence of inline palette vars.
- Delete in-use theme through both resolution choices.
- Sidebar auto-collapse/restore entering and leaving builder.
- Fixed command/preview bars with independently scrolling preview/inspector.
- Keyboard-only critical paths and 200% zoom.

## 10. Risks and likely regression areas

1. **Local storage migration:** existing records have required accent and `mode`. A destructive parse fallback could erase user-created themes; migration tests must precede type changes.
2. **Stale root inline properties:** removing an assignment without enumerating and clearing previously written keys will leave the old theme visually active.
3. **Default visual baseline:** current root fallback conflates baseline and assignment. CSS baseline must remain usable while explicit root metadata/vars disappear.
4. **Missing-theme handling:** assignments may reference deleted/malformed records from existing storage. Do not silently compile the default; surface integrity state and allow repair.
5. **Next-themes hydration:** `<html class="light">`, `suppressHydrationWarning`, and client resolution can flash or mislabel System. Verify current Next 16 and next-themes behavior before changing layout markup.
6. **Sidebar persistence:** using `setOpen(false)` writes the cookie. Temporary builder collapse could overwrite user preference unless the coordinator restores it reliably or the primitive gains a non-persisting temporary override.
7. **Route migration:** routing helpers and multiple navigation surfaces hard-code `/settings/theme`; partial replacement will misclassify builder routes or leave dead links.
8. **Independent scrolling:** `SidebarInset` already has `overflow-hidden`, while app layout adds padded `<main>`. Theme routes need a scoped height/overflow strategy without breaking document/dashboard scroll.
9. **Preview font variables:** draft font values reference variables declared on `<html>`. Confirm they remain resolvable inside the preview boundary without writing new global draft values.
10. **Authored/resolved leakage:** if compiler fallback is written back during normalization, save, reset, or export, the system falsely records user intent and the library shows a color the user never authored. Keep one canonical compiler constant and test source objects for non-mutation and omission.
11. **Color picker accessibility:** the current absolutely positioned picker lacks portal/focus-management semantics and precise keyboard alternatives. Recomposition may expose limitations in `react-colorful`.
12. **No existing test infrastructure:** harness setup is a prerequisite and may uncover React 19/jsdom compatibility details.
13. **Dirty working tree:** app-shell, routing, UI primitives, and theme files already contain user changes. Implementation must diff before every edit and avoid reverting or overwriting those changes.

## 11. Final implementable task list

The following is the coding-agent handoff order. Each task is complete only when its stated tests pass.

1. **Add theme test infrastructure.** Update `apps/web/package.json` and create test setup/config; add characterization tests for `generatePalette`, `resolveThemeAssignment`, storage, root provider, and scope provider.
2. **Separate authored and resolved accent.** Make authored `seeds.accent` optional in `types.ts`, remove mode, add the compiler-only neutral constant and resolved type, update storage migration without materializing fallback, and prove existing custom accents survive unchanged.
3. **Refactor store commands.** Remove `activeThemeId` from `theme-store.ts`; export a store factory; add create/update/duplicate/rename, usage lookup, validated assignment/removal, and resolved deletion commands; update `useThemes`/`useThemeAssignment`.
4. **Canonicalize resolution.** Make `use-resolved-theme.ts` call `resolveThemeAssignment()` and return all three statuses; remove fallback-as-assigned behavior.
5. **Resolve accent during compilation.** Add a pure `resolveThemeSeeds()` equivalent and update `build-theme-vars.ts` to consume its required resolved accent; test absent/customized/explicit-neutral cases, source non-mutation, authored export omission, intent preservation, and complete `--accent-50…950` output.
6. **Correct providers.** Split appearance ownership from root assignment effect; clear stale `<html>` vars/attributes; update `ThemeScopeProvider` to compile only `assigned`; add DOM containment tests.
7. **Create draft model/session.** Extract normalization, validation, dirty comparison, and revert semantics from `ThemeEditor`; create `useThemeBuilderSession`; test name/description persistence, Customize adding accent, Reset removing accent, authored-neutral intent equality, and preview-state-preserving Revert.
8. **Create preview boundary and scenarios.** Build `ThemePreviewBoundary` plus Document/Dashboard/Editor/Components scenarios; prove draft vars exist only on the boundary.
9. **Migrate routes.** Create the three plural theme routes; update `app-route-context.ts`, `get-route-kind.ts`, sidebar/header/home links; add temporary singular redirect if retained; test route classification.
10. **Build library.** Implement the editorial index using current primitives, palette signatures, usage summary, filters, row actions, empty/loading states; test navigation has no assignment side effects; complete screenshot checkpoint A.
11. **Build desktop builder shell.** Implement fixed command bar, section rail, preview toolbar/workbench, inspector host, and independent scroll containers according to exact widths; wire Colors/Typography/Shape; complete transition tests and checkpoint B.
12. **Wire persistence actions.** Implement Save, Create, Save as new, Revert, shortcuts, validation, dirty-navigation protection, live announcements, and post-create navigation; verify Save/Apply separation.
13. **Coordinate global sidebar.** Add a theme-route-specific controller above builder shell; automatically collapse before essential builder regions; restore prior state on exit; test initial open/closed cases; complete checkpoint C.
14. **Add diagnostics.** Implement known semantic-pair contrast, focus visibility, text-scale stress, and Advanced output; keep all diagnostics inside preview/session state; complete checkpoint D.
15. **Build contextual usage/assignment.** Replace immediate select mutation with staged candidate and explicit Apply/Use inherited; wire root and scoped contexts; test no palette vars on inheritance.
16. **Build deletion resolution.** Add impact inspection and explicit reassign/inherit confirmation; remove direct `ThemeEditor` deletion; test every affected-scope path.
17. **Replace header authoring popover.** Build the 360px quick switcher with Root summary, Light/Dark/System, candidate list, Apply, and links; remove `ThemeFormPopover`; complete checkpoint E.
18. **Remove obsolete compositions.** Delete old `ThemeEditor`, `ThemeAssignmentPanel`, and singular settings page only after import search is empty; clean `modules/theme/index.ts` exports.
19. **Preserve mobile architecture.** Add basic Preview/Edit transformation and sticky Save/Create without full mobile polish; verify 390px operability.
20. **Run final verification.** Execute unit/component tests, typecheck, lint, build, browser transition flows, DOM variable inspection, sidebar restoration checks, and screenshot checkpoint F. Record evidence against all 15 acceptance criteria.

Do not begin task 10 visual composition until tasks 1–6 establish transition safety and draft-variable containment.

# Synapcity Theme Interface Composition

Status: Approved-direction design pass, pre-implementation  
Scope: Concrete composition and visual hierarchy only  
V0 routes: `/settings/themes`, `/settings/themes/new`, `/settings/themes/[themeId]`

## 1. Theme library directions

### Direction L1 — Editorial index

A full-width, compact index with a restrained title band, one toolbar, and a ruled list. The list carries the page; there are no theme cards and no permanent details pane.

```text
┌─ Themes ─────────────────────────────────────────────── [New theme] ─┐
│ Reusable visual systems for Synapcity surfaces.                     │
├─ [Search themes…………] [All | In use | Unused]          [Sort ▾] ────┤
│ SWATCH  Graphite       Quiet neutral system      Root + 3   2d  [⋯] │
│ SWATCH  Cobalt Notes   Editorial blue            2 scopes   8d  [⋯] │
│ SWATCH  Paper Mono     Dense writing theme       Not used  14d  [⋯] │
└──────────────────────────────────────────────────────────────────────┘
```

Strengths: fastest scanning, lowest visual noise, scales to many themes, strongest Linear/Raycast character. Trade-off: less immediate palette detail; users open a row or its overflow to inspect more.

### Direction L2 — Index with focus pane

A list occupies the main column; focusing a row populates a narrow read-only details pane with larger palette samples, usage summary, metadata, and Edit. The pane is supplementary and disappears below wide desktop.

```text
┌─ Themes ─────────────────────────────────────────────── [New theme] ─┐
├─ Search / filters ───────────────────────────────────────────────────┤
│ Theme index, min 560                    │ Focus pane, 320             │
│ Graphite          Root + 3          [⋯] │ Graphite                    │
│ Cobalt Notes      2 scopes          [⋯] │ primary / accent scales     │
│ Paper Mono        Not used          [⋯] │ Used by Root, Research…     │
│                                         │ [Edit] [Usage]              │
└─────────────────────────────────────────┴────────────────────────────┘
```

Strengths: supports comparison and usage inspection without navigation. Trade-off: increases selection significance, consumes preview width, and risks making ephemeral focus feel like a durable product state.

### Direction L3 — Grouped operational list

The same compact rows are grouped into `Root`, `Used in scopes`, and `Unused`. A theme used in several groups appears once under its most important usage, with a count for the rest.

```text
ROOT
Graphite        Applied to root · 3 inherited scopes               [⋯]

USED IN SCOPES
Cobalt Notes    2 explicit assignments                              [⋯]

UNUSED
Paper Mono      Updated 14 days ago                                 [⋯]
```

Strengths: makes operational usage immediately legible. Trade-off: grouping shifts attention from reusable records toward assignment, complicates sorting, and becomes unstable as usage changes.

### Library recommendation

Choose **L1 — Editorial index** for V0. It gives saved themes a calm, durable home without inventing a gallery or over-promoting ephemeral selection. Borrow one feature from L2: open a non-modal usage/details sheet from the row overflow or `Usage` text. Defer L3 unless assignment management becomes the dominant user job.

## 2. Full builder directions

### Direction B1 — Fixed canvas, right inspector

The command bar spans the builder. A 176px section rail sits left, the preview owns the flexible center, and a 336px contextual inspector sits right.

```text
┌─ command bar ────────────────────────────────────────────────────────┐
├─ 176 nav ─┬──────────── preview, min 520 ────────────┬─ 336 inspect ┤
│ Colors    │ scenario / appearance / viewport         │ Primary      │
│ Type      │                                           │ seed/control │
│ Shape     │              live surface                 │ palette      │
│ Access.   │                                           │ mappings     │
│ Advanced  │                                           │              │
└───────────┴───────────────────────────────────────────┴──────────────┘
```

Strengths: clearest tool/artifact separation, stable preview, natural contextual editing, strong Figma/shadcn-studio logic. Trade-off: needs disciplined collapse behavior below 1180px and careful inspector scrolling.

### Direction B2 — Top sections, split canvas

Sections become a horizontal strip below the command bar. Preview occupies roughly two thirds and inspector one third.

```text
┌─ command bar ────────────────────────────────────────────────────────┐
├─ Colors  Typography  Shape  Accessibility  Advanced ───────────────┤
├────────────── preview, min 620 ─────────────┬─ inspector 360 ───────┤
│                                            │                        │
└────────────────────────────────────────────┴────────────────────────┘
```

Strengths: uses horizontal space efficiently and survives medium widths longer. Trade-off: section navigation competes with the preview toolbar, produces two stacked toolbars, and feels more like settings than a creative workspace.

### Direction B3 — Canvas with floating inspector sheet

The preview spans nearly the full workspace. Sections live in a compact left toolbar; choosing one opens a non-modal floating or dockable inspector.

```text
┌─ command bar ────────────────────────────────────────────────────────┐
├─ 56 tools ┬──────────────────── full preview ───────────────────────┤
│ color     │                                      ┌─ inspector ───┐ │
│ type      │                                      │ controls      │ │
│ shape     │                                      └───────────────┘ │
└───────────┴─────────────────────────────────────────────────────────┘
```

Strengths: maximum canvas emphasis and strongest “builder” feeling. Trade-off: icon-only navigation is harder to learn, floating panels can obscure preview content, and keyboard/focus behavior becomes more complex.

### Builder recommendation

Choose **B1 — Fixed canvas, right inspector**. It communicates the interaction model immediately and keeps the preview spatially stable. Use B2’s horizontal section strip only as the narrow-desktop transformation. Do not use B3 in V0; its canvas gain does not justify the discoverability and overlay costs.

## 3. Exact desktop geometry

Measurements describe the content area after the existing Synapcity application sidebar.

### Builder

| Region | Preferred | Minimum | Maximum | Behavior |
| --- | ---: | ---: | ---: | --- |
| Command bar | 56px high | 56px | 64px | One row at ≥960px; title truncates before actions wrap |
| Section rail | 176px | 160px | 192px | Fixed at ≥1180px content width |
| Preview region | `1fr` | 520px | none | Owns all surplus width |
| Inspector | 336px | 320px | 384px | Fixed; internal content scrolls |
| Region separators | 1px | 1px | 1px | Semantic border token; no panel shadows |

The recommended three-column builder needs **1018px minimum content width**: 160 + 1 + 520 + 1 + 336. With 24px outer application gutters, use the full three-region form only when the available content container is at least **1066px**. Prefer a container query on the builder shell because the application sidebar can change the usable width independently of the viewport.

At content widths above 1440px, the inspector remains 336px and section rail 176px; extra space belongs to the preview. The preview surface itself caps at the chosen simulated viewport rather than stretching its internal layout unnaturally.

### Library

| Region | Preferred | Minimum | Maximum |
| --- | ---: | ---: | ---: |
| Main page measure | 1040px | 640px | 1120px |
| Header | 72px content height | 64px | 88px |
| Toolbar | 44px | 44px | 52px |
| Theme row | 64px | 60px | 72px |
| Swatch rail | 88px | 72px | 112px |
| Name/description | `minmax(220px, 1fr)` | 220px | none |
| Usage | 176px | 144px | 220px |
| Updated | 96px | 80px | 112px |
| Actions | 40px | 40px | 40px |

The library centers within the application content area with 24px desktop side padding. It becomes full-width inside the shell below 960px.

## 4. Command bar

### Existing theme

Left cluster, in order:

1. Back to Themes icon button with tooltip and accessible name.
2. Editable theme name, 16px semibold, maximum 320px.
3. Description/details trigger, quiet icon or text action.
4. Save status text: `Saved`, `Unsaved changes`, `Saving…`, `Save failed`.

Right cluster, in order of priority:

1. **Save** — primary action; enabled only for a valid dirty draft.
2. Save chevron menu — **Save as new**.
3. **Revert** — secondary text/ghost action, visible only when dirty.
4. Overflow — Usage and assignment, Duplicate, Rename/details, Delete, keyboard shortcuts.

Do not place Apply beside Save. Usage and assignment open a contextual sheet/panel from overflow. On save failure, keep Save in place and show the error next to status; do not rely only on a toast.

### New theme

Left: Back, editable `Untitled theme`, optional description trigger, `Not created`. Right: **Create theme**, overflow with reset and shortcuts. `Save as new`, Revert, Usage, Assignment, and Delete are absent until creation.

### Compression priority

At constrained widths, truncate theme name first, move Revert into overflow second, collapse status to an icon plus accessible text third, and preserve Back + Save/Create at all times. The command bar never becomes two rows on desktop; mobile receives a separate composition.

## 5. Section navigation

Desktop uses a text rail, not icon-only tabs. Each item is 36px high with 12px horizontal inset and a 6px gap between icon and label if icons are retained. Labels are Colors, Typography, Shape, Accessibility, Advanced. The current section uses a semantic selected surface, stronger text, and `aria-current`; it does not use a colored side stripe or prominent badge.

The rail begins 12px below the command bar. A short keyboard hint may sit at the bottom only if shortcuts ship. Section changes replace inspector content while preserving the preview. Arrow keys move within the section list; Tab leaves the list.

At 768–1065px container width, replace the rail with a 44px horizontal tab strip directly below the command bar. It scrolls horizontally only as a last resort; labels remain visible at 768px. At mobile widths, sections become the top of the Edit view and use the same horizontal treatment.

## 6. Contextual inspector

The inspector is one bounded surface with stable anatomy:

```text
Inspector header, 52px
  Section title                         [section actions]
  one-line purpose when needed
────────────────────────────────────────────────────────
Primary controls
  compact FieldGroup, 16px section padding
────────────────────────────────────────────────────────
Derived output / contextual detail
  collapsible only when secondary
────────────────────────────────────────────────────────
Footer/status, only when action or warning must remain visible
```

Inspector content rules:

- Use one 16px inset and a 20px gap between conceptual groups.
- Controls within a group use 12px gaps; label-to-control gap is 6px.
- Group related inputs with `FieldSet`/`FieldLegend`; do not manufacture mini cards.
- Use `Separator` between conceptual groups, not a border around each group.
- Long generated output scrolls inside the inspector; the header remains fixed.
- Warnings use `Alert`; blocking validation stays adjacent to its field and is summarized near Save.

Section contents:

- **Colors:** Primary seed controls always first; compact generated scale immediately below. Accent identifies `Using neutral default` when no authored seed exists and offers **Customize accent**. An authored accent is labeled `Customized` and offers **Reset to neutral default**, which removes the explicit seed. The resolved scale remains visible in both states; semantic-role mapping is collapsed by default.
- **Typography:** Body font, heading font, scale; sample metadata below each choice; advanced font identifiers collapsed.
- **Shape:** Radius numeric input and stepper, then a single representative control strip; no full component gallery.
- **Accessibility:** Current appearance contrast summary, failing pairs first, focus-preview control, text-scale stress control; passing details collapsible. When accent is resolved from fallback, diagnostic rows label it **Default neutral accent** or **Resolved fallback**.
- **Advanced:** raw OKLCH, generated CSS variables, deterministic generation metadata, copy/export; organized with accordions because this entire section is expert-facing.

Usage/assignment opens as a 360px desktop sheet or replaces the inspector if the panel is already docked. It must have a title, current use summary, scope picker, and explicit Apply/Use inherited action.

## 7. Preview frame and toolbar

The preview region uses a neutral workbench surface distinct from both app chrome and preview theme. It is flat, not decorative: no grid background, glass, or large shadow. The simulated surface uses a 1px border and at most a 4px restrained elevation when separation is otherwise insufficient.

### Toolbar

One 44px row, ordered by frequency:

1. **Scenario** combobox: Document, Dashboard, Editor, Components.
2. Separator.
3. **Appearance** toggle group: Light, Dark, System. System follows the user's current system preference and shows the resolved result in accessible description text.
4. Separator.
5. **Viewport** toggle/menu: Fit, Desktop, Tablet, Mobile.
6. Flexible spacer.
7. Overflow: zoom, reset preview state, diagnostics, keyboard shortcuts.

Use text labels for Scenario and the currently chosen Viewport; do not reduce all three controls to ambiguous icons. On narrow desktop, each control becomes a compact trigger and Appearance may move into a popover while remaining one action away.

### Frame

- Preview canvas has 24px workbench padding on wide desktop, 16px on narrow desktop, and 8px on mobile.
- Simulated frame starts at 100% of available height and the chosen viewport width, centered horizontally.
- Desktop preset: 1280px logical width, scaled to fit without making preview text unreadably small.
- Tablet preset: 768px logical width.
- Mobile preset: 390px logical width.
- Fit uses the actual available frame width and is the default.
- Frame radius follows builder chrome, not the draft, so the containment boundary remains visually stable. Draft radius appears only inside the preview content.
- A quiet footer label inside the workbench, not over the preview, reads `Previewing draft · Graphite · Dark` or `Previewing saved theme · Graphite · System → Light`.

Default Document scenario anatomy: compact app header, contextual sidebar fragment, editable-looking title, 60–70ch prose column, link, inline callout, metadata, one input/action group, and a small structured data fragment. It should look like a believable Synapcity surface rather than a specimen sheet.

The preview frame owns a complete resolved accent scale even when authored accent is absent. Its fallback variables are written on the preview boundary so root or application accent variables cannot leak into the scenario.

## 8. Theme-library row anatomy

Each row is a single interactive record line with a separate overflow action. The row itself opens the builder; keyboard focus and hover use the standard subtle row surface.

1. **Palette signature, 88px:** five adjoining rectangular swatches sampled only from explicitly authored theme colors. Primary is always represented; accent is included only when authored. The compiler fallback is not presented as a theme color. Text alternatives distinguish `Primary violet, using neutral default accent` from `Primary violet, authored blue accent`.
2. **Identity, flexible:** theme name on first line; description on second line truncated to one line. No selected badge.
3. **Usage, 176px:** `Root + 3 scopes`, `2 scopes`, or `Not in use`. This opens the usage sheet without changing row selection.
4. **Updated, 96px:** relative date with exact timestamp available contextually.
5. **Overflow, 40px:** Edit, Duplicate, Rename/details, Usage and assignment, Delete.

Root application use may receive a compact neutral `Root` badge within the usage cell. Avoid a collection of status pills. Applied/in-use meaning is always textual.

## 9. Quick switcher anatomy

Desktop popover width: **360px**, maximum height **520px**. Mobile uses a bottom drawer or full-width sheet.

```text
Theme
Root: Graphite                                      [Edit]
Appearance       [Light | Dark | System]
────────────────────────────────────────────────────────
[Search themes…]
○ Graphite          Root theme
○ Cobalt Notes      2 scopes
○ Paper Mono        Not in use
────────────────────────────────────────────────────────
Candidate: Cobalt Notes                   [Apply to root]
[Open theme library]
```

An item click stages the candidate with a radio/check treatment; it does not apply. The current root theme is identified in secondary text, not by hijacking selection styling. The footer remains visible while the list scrolls. If there are fewer than seven saved themes, omit search. `Edit` opens `/settings/themes/[themeId]`; the library link opens `/settings/themes`.

Appearance is independent and applies immediately because it is a user preference, not a saved-theme mutation. `System` describes its resolved appearance to assistive technology.

## 10. Narrow-desktop and mobile transformations

### Narrow desktop: 768–1065px builder-container width

- Command bar remains 56px.
- Section rail becomes a 44px horizontal tab strip.
- Preview remains visible and receives all width not occupied by the inspector.
- Inspector is **320px** when docked and may be toggled closed. When closed, an `Edit <section>` button in the preview toolbar restores it.
- Below **860px**, inspector becomes a non-modal 360px sheet over the right edge so the preview retains at least 520px when possible.
- Preview toolbar compacts Scenario and Viewport to triggers; Appearance remains visible if space permits.
- Library hides description first, then Updated. Usage remains visible until below 720px.

### Mobile: below 768px viewport width

Builder:

- Top bar is 52px: Back, truncated name/status, overflow.
- Bottom sticky action bar is 56px: Preview/Edit mode toggle plus Save/Create.
- Preview and Edit are sibling modes, never squeezed columns.
- Preview mode contains the 40px compact toolbar and full-height workbench.
- Edit mode contains the horizontal section strip and inspector content in normal document flow.
- Usage/assignment opens a titled full-height sheet.
- Dirty navigation protection uses a dialog; Save remains reachable without scrolling.

Library:

- Header becomes two rows: title and New theme, then search/filter.
- Rows become 76px two-line records: 64px palette signature, identity, overflow. Usage moves below the description as concise metadata; Updated disappears into overflow/details.
- Filters use a popover or sheet rather than wrapping five toolbar controls.

Quick switcher:

- Use a bottom drawer when the theme list is short and a full-height sheet when search is present.
- Appearance remains above the list; Apply remains sticky at the bottom.

## 11. Visual hierarchy and density

### Typography

Use the application sans for all builder chrome; mono is reserved for OKLCH values, variable names, IDs, and numeric technical output.

| Role | Size / line height | Weight | Notes |
| --- | --- | --- | --- |
| Page title | 24 / 32 | 600 | Library only; no display treatment |
| Builder theme name | 16 / 24 | 600 | Editable; one line |
| Inspector/section title | 14 / 20 | 600 | Stable hierarchy anchor |
| Row/theme name | 14 / 20 | 500–600 | Prefer 500 unless emphasis is needed |
| Body/control | 14 / 20 | 400–500 | Default product density |
| Secondary/meta | 12 / 16 | 400–500 | Must retain AA contrast |
| Technical output | 12 / 18 | 400 mono | Values and variables only |

Do not use uppercase tracked eyebrows. Section titles and group legends provide enough structure. No fluid type in the product UI.

### Spacing rhythm

Use a 4px base with a restrained sequence: 4, 6, 8, 12, 16, 20, 24, 32. Controls are predominantly 32–36px high on desktop, but icon-only pointer targets should use at least a 40px interaction box where practical. Page gutters are 24px desktop, 16px tablet, 12px mobile.

Density target: compact-comfortable. The interface should fit the primary color controls and their generated scale inside a 768px-high desktop viewport without making the preview or Save action scroll away.

### Borders, radius, elevation

- Use 1px semantic separators to define command bar, rails, workbench, and inspector.
- Builder chrome radius: 8–10px for popovers, menus, and contained controls; 6–8px for inputs/buttons according to the existing Lyra preset.
- Preview frame: 10–12px maximum, independent of draft radius.
- Library rows have no individual outer radius; the list boundary may have 10–12px radius.
- Avoid borders around every inspector group.
- Menus/popovers may use the primitive’s restrained elevation. Main regions use no shadow.
- Never pair a decorative wide shadow with a 1px card border.

### Color strategy

Builder chrome is neutral-first. The currently applied application theme may influence semantic tokens, but workbench, focus, warning, and selection states must remain legible regardless of the draft accent. User theme color is concentrated inside the preview and palette signatures, not sprayed across the editing chrome.

## 12. Information visibility matrix

| Always visible | Contextual | Collapsible | Advanced only |
| --- | --- | --- | --- |
| Theme name | Description/details | Semantic color mappings | Raw CSS variables |
| Save/create action | Current section controls | Passing contrast pairs | Full OKLCH tuples by step |
| Dirty/save status | Generated scale for active color | Usage list beyond first items | Generation metadata/version |
| Section navigation | Assignment panel when invoked | Help/explanations | Copy/export payloads |
| Preview | Field validation | Resolved fallback scale and accent reset explanation | Theme record ID/timestamps |
| Scenario, appearance, viewport | Accessibility failures | Secondary preview tools | Diagnostic implementation output |

Usage count is always visible in the library row; the complete scope list is contextual. Applied theme information is always visible in the quick switcher, but assignment controls appear only after a candidate or scope action.

## 13. Approved-surface wireframes

### `/settings/themes` — library

```text
App shell
└─ Main, max 1120
   ├─ Header, 72
   │  ├─ Themes + one-line purpose
   │  └─ New theme
   ├─ Toolbar, 44
   │  ├─ Search
   │  ├─ All / In use / Unused
   │  └─ Sort
   └─ Ruled theme index
      └─ Repeated row, 64
         ├─ Palette signature
         ├─ Name + description
         ├─ Usage
         ├─ Updated
         └─ Overflow
```

### `/settings/themes/new` — new builder

```text
Builder shell
├─ Command bar, 56
│  ├─ Back / Untitled theme / Not created
│  └─ Create theme / overflow
├─ Section rail, 176
│  └─ Colors / Typography / Shape / Accessibility / Advanced
├─ Preview region, flexible min 520
│  ├─ Toolbar, 44: Scenario / Appearance / Viewport / overflow
│  ├─ Workbench
│  │  └─ Isolated Synapcity preview
│  └─ Preview status
└─ Inspector, 336
   └─ Controls for current section
```

### `/settings/themes/[themeId]` — saved-theme builder

```text
Same builder shell
├─ Command bar
│  ├─ Back / editable name / details / save status
│  └─ Save + Save as new / Revert / overflow
├─ Same section rail and preview
└─ Inspector or contextual replacement panel
   ├─ Design section
   ├─ Accessibility section
   ├─ Advanced section
   └─ Usage and assignment when invoked
```

### Header quick switcher

```text
Popover 360 × ≤520
├─ Root theme summary + Edit
├─ Appearance toggle
├─ Optional search
├─ Scrollable theme candidate list
└─ Sticky footer
   ├─ Candidate summary + Apply to root
   └─ Open theme library
```

### Contextual usage and assignment panel

```text
Titled sheet / docked inspector, 360
├─ Theme + current usage count
├─ Scope context and effective source
├─ Saved-theme picker
├─ Explicit Apply or Use inherited action
└─ Affected-scope explanation / destructive resolution if needed
```

## 14. Screenshot review checklist

Review at 1440×900, 1280×800, 1024×768, 768×1024, 390×844, and 200% browser zoom.

### Composition

- [ ] The preview is visually dominant without the controls feeling detached.
- [ ] Command bar, section navigation, preview toolbar, and inspector read as four levels, not four competing headers.
- [ ] No region looks like a generic card stack or long settings form.
- [ ] The library reads as an editorial index, not a template gallery.
- [ ] Extra-wide screens give surplus space to the preview, not inflated side panels.
- [ ] Narrow layouts transform structurally; they do not merely shrink type and gaps.

### Hierarchy and density

- [ ] Save/Create is the clearest action; Apply is not visually coupled to it.
- [ ] Theme name and dirty status remain visible in every builder screenshot.
- [ ] Section labels are readable without icon interpretation.
- [ ] Inspector groups are separated by rhythm and dividers rather than nested boxes.
- [ ] Metadata is quieter but still meets contrast requirements.
- [ ] Primary controls and preview fit a 768px-high desktop without hiding essential actions.

### Preview integrity

- [ ] Draft styling is visibly confined to the simulated surface.
- [ ] A primary-only draft uses locally resolved neutral accent variables rather than inheriting the surrounding application accent.
- [ ] Workbench chrome remains neutral and legible under extreme draft palettes.
- [ ] Document, dashboard, and editor previews resemble real Synapcity work.
- [ ] Light, dark, and System resolved appearance are unmistakable in text.
- [ ] Desktop/tablet/mobile viewport presets do not cause builder-page horizontal scroll.
- [ ] Draft radius changes content inside the frame, not the frame itself.

### Library and quick switcher

- [ ] Library rows expose name, palette signature, usage, and actions at a glance.
- [ ] Focus/hover does not look like an applied or durable selected state.
- [ ] `Using neutral default` and `Customized` accent states are understandable from text, not color alone, and the library does not misrepresent fallback as authored color.
- [ ] An explicitly authored accent equal to the neutral default still appears as authored/customized rather than being collapsed into fallback state.
- [ ] Quick-switcher candidate and current root theme remain distinguishable.
- [ ] Selecting a quick-switcher item does not visually imply it was already applied.
- [ ] The Apply action and library link remain visible when the list scrolls.

### Responsive and accessibility

- [ ] At 1024px, the preview retains useful width and inspector behavior is obvious.
- [ ] At 390px, Preview/Edit is a deliberate mode switch with Save always reachable.
- [ ] At 200% zoom, actions remain available and no text overlaps or clips.
- [ ] Focus rings are visible on workbench, preview toolbar, rows, swatches, and icon actions.
- [ ] Status, contrast, usage, and inheritance are not communicated by color alone.
- [ ] Pointer targets are practical and dense controls retain keyboard alternatives.
- [ ] Destructive confirmation clearly names affected themes and scopes.

### Visual restraint

- [ ] No gradient text, decorative grids, glass panels, oversized radii, or wide ghost shadows.
- [ ] Accent color is concentrated in the user-created preview, not the builder shell.
- [ ] There are no repeated uppercase eyebrows or decorative numbered sections.
- [ ] Borders form a coherent structural system and do not outline every group.
- [ ] Motion, if later added, explains state change and has a reduced-motion equivalent.

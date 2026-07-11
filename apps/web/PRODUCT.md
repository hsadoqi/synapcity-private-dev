# Product

## Register

product

## Users

Synapcity serves people who build and maintain a personal knowledge and composition workspace across documents, dashboards, editors, and other scoped surfaces. They need to create reusable visual systems, preview changes safely, and control where those systems apply without interrupting the work already in progress.

## Product Purpose

Synapcity is a serious creative tool for composing knowledge and structured work. Its theming experience lets users author reusable saved themes, inspect and preview deterministic design-system output, and explicitly assign saved themes to the root application or supported scopes. Success means users always understand what is saved, unsaved, previewed, applied, or inherited, and can change any one of those states without accidentally changing another.

## Brand Personality

Calm, technical, editorial. The interface should feel restrained, structured, neutral-first, and confident: quiet around the work, compact without becoming cramped, and capable without resembling an administrative settings panel.

Reference qualities:

- Linear: restraint, hierarchy, disciplined density, compact controls, and clear active states.
- Figma: persistent central preview, edge-mounted controls, contextual inspectors, and separation between the edited artifact and its tools.
- Raycast: keyboard-first, command-oriented clarity and compact popovers.
- Notion: calm editing, low-friction writing, and in-place title or content editing.
- shadcn/studio: three-region builder structure, fixed canvas, toolbar placement, and contextual side panels.
- shadcn theme generator: breadth of theme controls and separation of color, typography, and shape.

## Anti-references

- Generic SaaS analytics dashboards, oversized metric cards, and decorative admin shells.
- Loose, generic page composition or excessive whitespace that weakens information density.
- Block-library website builders or direct visual copies of shadcn/studio.
- Long scrolling settings forms with raw token editing as the primary workflow.
- Decorative gradients, glass effects, nested cards, and effects that compete with the work.
- Interfaces that conflate selecting, editing, previewing, saving, or applying a theme.

## Design Principles

1. Make state legible before making the interface clever: saved, dirty, previewed, applied, and inherited must remain distinct.
2. Keep the workspace quiet around the artifact: controls support a persistent preview rather than competing with it.
3. Separate authoring from assignment: editing and saving a theme never silently changes where it is applied.
4. Reveal complexity contextually: common theme decisions stay direct; generated palettes, raw values, and implementation output remain inspectable without dominating the builder.
5. Preserve keyboard speed and reversible actions: every major workflow has a clear, accessible, non-drag alternative and destructive consequences are explicit.

## Accessibility & Inclusion

Target WCAG 2.2 AA. All controls, dialogs, popovers, tabs, lists, and preview actions must be keyboard operable with clear visible focus. State, selection, validation, contrast, and inheritance cannot rely on color alone, and state changes must be announced to assistive technology. The builder must support reduced motion, 200% zoom, browser text enlargement, and narrow desktop widths without losing functionality. Palette contrast results must be textual; preview tooling should offer an accessibility inspection mode. Sliders require numeric or stepped alternatives, practical target sizes should follow WCAG 2.2 guidance, and destructive actions must explain their consequences, especially when a theme is in use.

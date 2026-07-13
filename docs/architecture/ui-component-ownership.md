# UI component ownership

This document records the ownership boundary stabilized by the contextual-panel
work. It is a current contract, not authorization for broader cleanup.

## Contextual-panel contract

- `AppShell` owns the desktop and mobile containers plus resize and collapse
  behavior. Collapsed desktop mode renders only the Expand control.
- `ContextPanelSlotProvider` owns one opaque active registration and performs
  identity-aware cleanup.
- `DesktopContextPanel` and `ContextPanelSheet` render the registered metadata
  and body, or shared fallback content when nothing is registered.
- `DocumentWorkspace` registers the document contextual content.
- `DocumentContextPanel` owns document section ids, controlled selection, and
  the Outline, Properties, and Related bodies.
- Shared contextual-panel code must not import feature section
  implementations. Registered bodies remain opaque to the shell.

The dependency direction is therefore feature to shell contract: a document
feature may use the registration hook, while shared hosts do not know how the
document body is organized.

## Follow-up planning boundaries

The source inventory and classifications live in the approved
[UI component architecture cleanup plan](../superpowers/plans/2026-07-13-ui-component-architecture-cleanup.md).
Future plans must re-check the relevant inventory rather than treating these
items as approved implementation work.

- **Component decomposition:** gather responsibility, independent-test, reuse,
  and current import evidence before splitting `DocumentWorkspace`, document
  contextual sections, app-shell files, header actions, or theme previews.
  Re-run exact import checks before proposing deletion of sidebar files.
- **Deduplication:** gather stable behavior and semantics from each consumer.
  Similar list cards, route states, or icon buttons are insufficient evidence;
  a shared icon-button policy needs at least three stable consumers with the
  same loading, tooltip, and pressed-state requirements.
- **Naming and organization:** compare the panel's informational, action,
  selection, and cross-feature roles with `PRODUCT.md` and current feature
  plans. Approve terminology before renaming or moving files, and include
  import-cycle analysis before moving app-shell components.
- **shadcn adoption:** identify a scoped migration that consumes each missing
  primitive and verify its interaction and accessibility contract. Keep editor
  internals opaque, and retain native controls whose specialized browser or
  preview behavior is intentional.
- **Theme cleanup:** characterize overlap among `ThemeForm`,
  `ThemeFormPopover`, and `ThemeFormSheet`, and distinguish product controls
  from specimen controls before migration. Preserve the proven scope rule:
  no assignment means inherit, with no palette variables generated or applied
  for unassigned scopes.

Until that evidence is gathered and a focused plan is approved, decomposition,
deduplication, renaming, file moves, shadcn adoption, and theme cleanup remain
candidate refactors (or naming candidates), not backlog implementation tasks.

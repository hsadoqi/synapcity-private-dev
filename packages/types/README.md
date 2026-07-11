# @workspace/types

Shared domain types for documents, dashboards, and widgets — the shapes
that used to be defined independently (and, for `WidgetInstance`,
duplicated verbatim) inside each of `modules/documents`,
`modules/dashboards`, and `modules/widgets`.

See `synapcity-private-dev/ROADMAP.md`, Phase 1, for why this exists and
what it deliberately does *not* do yet (no generic/polymorphic Node type —
that's still deferred until more entity types exist).

This package is synced across the four isolated forks
(`synapcity-theme`, `synapcity-documents`, `synapcity-dashboard`,
`synapcity-private`) by `scripts/sync-shared-packages.sh`, the same as
`packages/ui`. Treat `synapcity-theme/packages/types` as the source of
truth; edit it there, then re-run the sync script.

Each module's own `types.ts` is now a thin re-export of this package
(e.g. `export type { DocumentRecord } from "@workspace/types"`) so existing
imports elsewhere in the app (`from "../types"`, `from "@/modules/.../types"`)
keep working unchanged.

# @workspace/feedback

Toast notifications and promise-based confirm/alert modals. Hook-based API
(`useToast`, `useModal`), Zustand-backed stores, renderers mounted once at
the app root (`ToastRenderer`, `ModalRenderer` in `app/root-providers.tsx`).

## Why this exists, and what it deliberately isn't

This is a from-scratch rebuild, not a port, of `synapcity-monorepo`'s
`@synapcity/domain-feedback` package. That package's *API shape* — hooks,
promise-based `confirm()`, context-grouped alerts — is genuinely good and
worth borrowing. The package itself wasn't worth porting as-is:

- It depends on `@synapcity/platform-types` and
  `@synapcity/platform-async-managers`, packages that don't exist in this
  workspace's `@workspace/*` convention.
- Its `src/types.ts` had commented-out, `@deprecated` exports — a
  migration frozen mid-flight.
- ~6,500 lines (incl. tests) for four subsystems (toast/modal/alert/status)
  plus metrics, a debug panel, and health scoring — none of which anything
  in this workspace currently needs.

So: toast + modal only, for now. Inline alerts and status tracking
(loading/error/dirty flags) are deliberately deferred — see
`synapcity-theme/packages/ui/src/components/patterns/states` for the
loading/error/empty *presentational* wrappers, which cover a lot of the
same ground for read-only UI without needing a global store. If a real,
recurring need for imperative alert grouping or global status tracking
shows up later, add it then — don't build it speculatively now.

No metrics, no debug panel, no dedup windows, no health scoring. If toast
volume or debugging feedback state ever becomes a real problem, that's
the point at which that complexity earns its place.

## Sync

Synced across the four isolated forks (`synapcity-theme`,
`synapcity-documents`, `synapcity-dashboard`, `synapcity-private`) by
`scripts/sync-shared-packages.sh`, same as `packages/types` and
`packages/ui`. `synapcity-theme/packages/feedback` is the source of
truth — edit it there, then re-run the sync script.

`ToastRenderer` and `ModalRenderer` are only mounted in each fork's own
`app/root-providers.tsx`, not synced automatically — mounting is an
app-level decision each fork makes for itself.

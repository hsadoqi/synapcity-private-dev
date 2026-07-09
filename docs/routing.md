# Routing Strategy

Synapcity keeps route awareness as a small, typed layer instead of a global
route store.

## Route Context

`apps/web/modules/routing/app-route-context.ts` is the source of truth for
pathname-derived UI context.

It answers:

- Which route section is active.
- Whether the route points at an entity.
- Which entity type and ID are present.
- Which navigation items should render.
- Which nav item should be active.

This is intentionally derived from the pathname. Server pages that need real
entity data should still read route params and load the record for that route.

## Navbar

The app header uses `usePathname()` only inside the small client header
component. It passes the current pathname into `getAppRouteContext()`.

This means contextual navbar content can change by route without introducing a
duplicated router state source.

Examples:

- `/documents` resolves to the documents section.
- `/documents/doc-1` resolves to a document entity route with `entityId =
"doc-1"`.
- `/dashboards/db-1` resolves to a dashboard entity route with `entityId =
"db-1"`.
- `/settings/theme` resolves to theme settings.

## Proxy

Next 16 uses `proxy.ts`; the old `middleware.ts` convention is deprecated.

`apps/web/proxy.ts` is limited to low-cost request work:

- classify the current route,
- set request-observation headers,
- set baseline security headers.

It must not load workspace data, theme records, or user records. Auth and data
authorization should still be enforced at the route handler, server action, or
data boundary that performs the sensitive operation.

## Loading, Error, Not Found

Special route files share one component:

`apps/web/modules/routing/components/route-state-view.tsx`

Supported states:

- `loading`
- `error`
- `not-found`

Route files stay tiny, while visual treatment and copy stay consistent across
root routes and the app route group.

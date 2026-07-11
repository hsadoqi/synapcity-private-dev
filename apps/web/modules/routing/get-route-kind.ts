import { getAppRouteContext, type AppRouteSection } from "./app-route-context"

// Previously this reimplemented its own copy of the pathname → section
// matching logic, independently of getAppRouteContext. That let the two
// diverge (this file still matched /settings/themes after
// app-route-context.ts was changed to the singular /settings/theme route
// this fork actually has). getAppRouteContext is the single source of
// truth for route classification; this is a thin convenience wrapper.
export function getRouteKind(pathname: string): AppRouteSection {
  return getAppRouteContext(pathname).section
}

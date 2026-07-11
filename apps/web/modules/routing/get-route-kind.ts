import { getAppRouteContext, type AppRouteSection } from "./app-route-context"

// This used to reimplement its own copy of the pathname → section matching
// logic, independently of getAppRouteContext. Two copies of the same
// classification logic drift apart silently (that's what happened in the
// synapcity-documents fork). getAppRouteContext is the single source of
// truth for route classification; this is a thin convenience wrapper.
export function getRouteKind(pathname: string): AppRouteSection {
  return getAppRouteContext(pathname).section
}

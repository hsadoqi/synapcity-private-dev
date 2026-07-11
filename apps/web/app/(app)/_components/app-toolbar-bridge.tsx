"use client"

import { usePathname } from "next/navigation"

import { getAppRouteContext } from "@/modules/routing"
import { AppContextToolbar } from "./header-actions"

export function AppContextToolbarBridge() {
  const pathname = usePathname()
  const routeContext = getAppRouteContext(pathname)

  return <AppContextToolbar routeContext={routeContext} />
}

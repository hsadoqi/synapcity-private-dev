import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getRouteKind } from "./modules/routing"

export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  response.headers.set("x-synapcity-pathname", pathname)
  response.headers.set("x-synapcity-route-kind", getRouteKind(pathname))
  response.headers.set("x-content-type-options", "nosniff")
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin")

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
}

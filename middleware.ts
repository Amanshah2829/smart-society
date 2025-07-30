
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/backend/lib/auth"

const protectedRoutes = {
  "/admin": "admin",
  "/resident": "resident",
  "/security": "security",
  "/receptionist": "receptionist",
  "/accountant": "accountant",
  "/superadmin": "superadmin",
}

function getRequiredRoleForPath(path: string): string | undefined {
  for (const route in protectedRoutes) {
    if (path.startsWith(route)) {
      return protectedRoutes[route as keyof typeof protectedRoutes]
    }
  }
  return undefined
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  // Check if user is authenticated
  const userPayload = token ? verifyToken(token) : null

  // If user is trying to access login page while already logged in, redirect to their dashboard
  if (userPayload && pathname === "/login") {
    const role = userPayload.role || "login"
    const url = request.nextUrl.clone()
    url.pathname = `/${role}`
    return NextResponse.redirect(url)
  }
  
  // Specific redirect for /superadmin to /superadmin/dashboard
  if (pathname === '/superadmin') {
      const url = request.nextUrl.clone()
      url.pathname = '/superadmin/dashboard'
      return NextResponse.redirect(url)
  }


  // Check if the route is protected
  const requiredRole = getRequiredRoleForPath(pathname)

  if (requiredRole) {
    // If user is not logged in and trying to access a protected route, redirect to login
    if (!userPayload) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirectedFrom", pathname)
      return NextResponse.redirect(url)
    }

    // If user is logged in but trying to access a route for a different role, redirect to their own dashboard
    if (userPayload.role !== requiredRole) {
      const url = request.nextUrl.clone()
      url.pathname = `/${userPayload.role}`
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

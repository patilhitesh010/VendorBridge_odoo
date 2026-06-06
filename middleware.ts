import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isApiRoute = nextUrl.pathname.startsWith("/api")
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup")

  if (isApiRoute && !nextUrl.pathname.startsWith("/api/auth")) {
    if (!isLoggedIn) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl))
  }

  return
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

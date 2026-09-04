import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"])

// Session tasks (e.g. `choose-organization`) run on a *pending* session, which
// `auth.protect()` treats as signed out — protecting them would bounce the user
// back to /sign-in, which in turn redirects here again.
const isSessionTaskRoute = createRouteMatcher(["/choose-organization(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request) && !isSessionTaskRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|monitoring|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

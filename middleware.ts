import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that require an authenticated Clerk session.
// Middleware enforces this server-side (using the Clerk session cookie),
// which avoids race conditions between client-side `useUser()` and
// the <SignIn> component — the cause of the /profile <-> /login bounce
// when using Clerk production keys on a custom Frontend API domain.
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/onboarding(.*)',
  // 3D print ordering flow — customers must be signed in so we can link
  // orders to a Clerk userId for history & tracking.
  '/service/3d-printing(.*)',
  '/api/print/orders(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

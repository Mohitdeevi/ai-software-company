import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/projects', '/settings'];

// Routes that are always public
const publicRoutes = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route
  );

  // Allow public routes and non-protected routes (e.g., static files, API routes) without auth
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // For protected routes, check for auth cookie presence
  const authCookie =
    request.cookies.get('refreshToken') || request.cookies.get('auth-token');

  if (!authCookie) {
    // Redirect to login with a return URL so users can be sent back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is under the admin route or a protected user route
  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedUserRoute = pathname.startsWith('/orders');

  console.log('Middleware running for path:', pathname);

  // Skip middleware for non-protected routes
  if (!isAdminRoute && !isProtectedUserRoute) {
    return NextResponse.next();
  }

  // Get auth cookie (server-side cookie specifically set for middleware)
  const authCookie = request.cookies.get('auth-server-cookie');
  console.log('Auth cookie found:', authCookie ? 'yes' : 'no');

  let isAuthenticated = false;
  let isAdmin = false;

  try {
    if (authCookie) {
      // Parse auth data from the cookie value
      const authData = JSON.parse(authCookie.value);
      console.log('Auth data from cookie:', JSON.stringify(authData, null, 2));

      isAuthenticated = !!authData.isAuthenticated;
      isAdmin = !!authData.user?.isAdmin;

      console.log('Parsed auth state:', { isAuthenticated, isAdmin });
    } else {
      console.log('No auth cookie found');
    }
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
  }

  console.log('Final auth state:', { isAuthenticated, isAdmin, pathname });

  // If trying to access admin routes
  if (isAdminRoute) {
    if (!isAuthenticated) {
      console.log('Redirecting: Not authenticated for admin route');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (!isAdmin) {
      console.log('Redirecting: Not an admin user');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    console.log('Access granted to admin route');
  }
  // If trying to access protected user routes
  else if (isProtectedUserRoute && !isAuthenticated) {
    console.log('Redirecting: Not authenticated for protected route');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  console.log('Middleware allowing access to:', pathname);
  return NextResponse.next();
}

// Only run middleware on these paths
export const config = {
  matcher: ['/admin/:path*', '/orders/:path*'],
};

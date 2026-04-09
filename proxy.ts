import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

/**
 * Proxy function replaces the deprecated 'middleware'
 * in Next.js 16.0.0+
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Path check is technically handled by the matcher, 
  // but we keep it here for extra safety in local dev
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/dashboard') || 
    request.nextUrl.pathname.startsWith('/api/cards') ||
    request.nextUrl.pathname.startsWith('/api/analytics');

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Strictly scope the proxy to only necessary routes for performance
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/api/cards/:path*', 
    '/api/analytics/:path*'
  ],
};

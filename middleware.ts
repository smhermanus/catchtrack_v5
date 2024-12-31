import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequestMiddleware } from './lib/middleware-auth';

export async function middleware(request: NextRequest) {
  const { user } = await validateRequestMiddleware(request);
  const isAuth = !!user;
  const isAuthPage =
    request.nextUrl.pathname.startsWith('/auth/login') ||
    request.nextUrl.pathname.startsWith('/auth/register') ||
    request.nextUrl.pathname.startsWith('/auth/forgot-password');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return null;
  }

  if (!isAuth) {
    let callbackUrl = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      callbackUrl += request.nextUrl.search;
    }
    
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, request.url)
    );
  }

  return null;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/monitor/:path*',
    '/skipper/:path*',
    '/rightsholder/:path*',
    '/system-admin/:path*',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ],
};

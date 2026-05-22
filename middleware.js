import { NextResponse } from 'next/server';

const COOKIE_NAME = 'st_token';
const PROTECTED = ['/dashboard', '/sessions', '/goals', '/reminders', '/uploads', '/profile', '/admin', '/pomodoro', '/analytics'];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|favicon.ico|uploads|api).*)'] };

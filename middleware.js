import { NextResponse } from 'next/server'

export function middleware() {
  return NextResponse.next()
}

export const config = {
  // Exclude cron routes, static files, and login from any middleware processing
  matcher: [
    '/((?!api/cron|_next/static|_next/image|favicon.ico|login).*)',
  ],
}

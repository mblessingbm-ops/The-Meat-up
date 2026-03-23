import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Root path redirect only — all auth checking is done server-side
  // in app/(dashboard)/layout.tsx via createServerClient + getUser()
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}

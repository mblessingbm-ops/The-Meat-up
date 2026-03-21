import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = ['/auth/login', '/auth/callback', '/api/auth']

// The Meat Up — single owner, all routes accessible to owner
// No role-based route restrictions in The Meat Up
const ROUTE_ACCESS: Record<string, string[]> = {}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // ── Dev-mode bypass ──────────────────────────────────────────────────────
  // When Supabase isn't configured, honour the dev session cookie set by the login route
  const isDevMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

  if (isDevMode) {
    // Accept either old cookie name or new one for smooth transition
    const devSession = req.cookies.get('meatup-dev-session') ?? req.cookies.get('kingsport-dev-session')
    if (!devSession && pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Dev session present — allow through
    return NextResponse.next()
  }

  // ── Production: Supabase auth ────────────────────────────────────────────
  let response = NextResponse.next({ request: req })
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await sb.auth.getUser()

  // Not authenticated → redirect to login
  if (!user && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  if (user) {
    const { data: profile } = await sb.from('users').select('role').eq('auth_id', user.id).single()
    const userRole = profile?.role as string | undefined

    for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
      if (pathname.startsWith(routePrefix) && userRole && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?access_denied=1', req.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

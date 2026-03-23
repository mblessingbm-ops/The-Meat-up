import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * createSupabaseServerClient — server-side Supabase client utility.
 *
 * Uses SUPABASE_URL and SUPABASE_ANON_KEY (no NEXT_PUBLIC_ prefix).
 * Server-only env vars are read from process.env at runtime — they are
 * never baked into the bundle at build time, so they always reflect the
 * current values set on Vercel regardless of when they were added.
 *
 * Do NOT use this in 'use client' components — use createBrowserClient
 * with NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY instead.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — cookie mutations handled by middleware response
          }
        },
      },
    }
  )
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
// AUDIT FIX (March 2026): Added CookieOptions type annotation to fix TS7006/7031 implicit any
// on cookiesToSet and destructured {name, value, options} in the setAll cookie handler.

// Server component / API route client (reads cookies for session)
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Admin client — service role, bypasses RLS (server only)
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Write an audit log entry
export async function writeAudit({
  supabase,
  userId,
  userName,
  userRole,
  module,
  action,
  recordType,
  recordId,
  recordLabel,
  beforeData,
  afterData,
}: {
  supabase: ReturnType<typeof createSupabaseAdmin>
  userId: string
  userName: string
  userRole: string
  module: string
  action: string
  recordType: string
  recordId: string
  recordLabel: string
  beforeData?: Record<string, unknown>
  afterData?: Record<string, unknown>
}) {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    user_name: userName,
    user_role: userRole,
    module,
    action,
    record_type: recordType,
    record_id: recordId,
    record_label: recordLabel,
    before_data: beforeData ?? null,
    after_data: afterData ?? null,
  })
}

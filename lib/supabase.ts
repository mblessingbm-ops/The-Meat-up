import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
// AUDIT FIX (March 2026): Added singleton `supabase` export used by useRealtime.ts and
// other client components that use `import { supabase } from '@/lib/supabase'`.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (for client components)
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton browser client — used by hooks (e.g. useRealtime) that need a stable reference
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Admin client (server-side only — never expose to browser)
export function createSupabaseAdminClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

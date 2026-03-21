import { NextRequest, NextResponse } from 'next/server'

// Dev-mode credentials (no Supabase required locally)
const DEV_USERS = [
  {
    email: 'admin@kingsport.com',
    password: 'kingsport2026',
    name: 'Blessing Moyo',
    role: 'executive',
    department: 'Management',
  },
  {
    email: 'sales@kingsport.com',
    password: 'kingsport2026',
    name: 'James Moyo',
    role: 'sales_manager',
    department: 'Sales',
  },
  {
    email: 'hr@kingsport.com',
    password: 'kingsport2026',
    name: 'Chipo Ndlovu',
    role: 'hr_manager',
    department: 'Human Resources',
  },
]

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // ── Dev bypass (when Supabase isn't configured) ─────────────────────────
    const isDevMode =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

    if (isDevMode) {
      const match = DEV_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      if (!match) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
      }

      const res = NextResponse.json({
        user: { name: match.name, email: match.email, role: match.role },
      })
      // Set a dev session cookie that middleware will honour
      res.cookies.set('kingsport-dev-session', match.role, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
        sameSite: 'lax',
      })
      return res
    }

    // ── Production: Supabase auth ────────────────────────────────────────────
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('name, role')
      .eq('auth_id', authData.user.id)
      .single()

    return NextResponse.json({
      user: { name: profile?.name ?? email, email, role: profile?.role },
    })
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

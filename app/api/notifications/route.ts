export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const sb = createSupabaseAdmin()
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ notifications: [] })

  const { data, error } = await sb.from('in_app_notifications')
    .select('id, type, title, message, is_read, created_at, action_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return NextResponse.json({ notifications: [] })
  return NextResponse.json({ notifications: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  const sb = createSupabaseAdmin()
  const body = await req.json()
  const { user_id, notification_id, mark_all } = body

  if (mark_all) {
    await sb.from('in_app_notifications')
      .update({ is_read: true })
      .eq('user_id', user_id)
    return NextResponse.json({ updated: 'all' })
  }

  if (notification_id) {
    await sb.from('in_app_notifications')
      .update({ is_read: true })
      .eq('id', notification_id)
    return NextResponse.json({ updated: notification_id })
  }

  return NextResponse.json({ error: 'Provide notification_id or mark_all' }, { status: 400 })
}

// System endpoint to push notifications
export async function POST(req: NextRequest) {
  const sb   = createSupabaseAdmin()
  const body = await req.json()
  const { user_ids, type, title, message, action_url } = body

  if (!user_ids?.length) return NextResponse.json({ error: 'user_ids required' }, { status: 400 })

  const rows = user_ids.map((uid: string) => ({
    user_id: uid, type, title, message, action_url,
    is_read: false, created_at: new Date().toISOString(),
  }))

  const { data, error } = await sb.from('in_app_notifications').insert(rows).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ created: data?.length ?? 0 })
}

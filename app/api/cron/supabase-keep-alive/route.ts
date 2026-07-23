import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')

  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: 'CRON_SECRET is not configured' },
      { status: 503, headers: NO_STORE_HEADERS }
    )
  }

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401, headers: NO_STORE_HEADERS }
    )
  }

  try {
    const supabase = getSupabaseClient()
    const tables = ['governorates', 'cities', 'prayer_times'] as const

    // A few tiny reads each day create real database activity without changing data.
    await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) throw new Error(`${table}: ${error.message}`)
      })
    )

    return NextResponse.json(
      {
        ok: true,
        service: 'supabase',
        checked_at: new Date().toISOString(),
        queries: tables.length,
      },
      { headers: NO_STORE_HEADERS }
    )
  } catch (error) {
    console.error('Supabase keep-alive failed:', error)

    return NextResponse.json(
      { ok: false, error: 'Supabase keep-alive failed' },
      { status: 503, headers: NO_STORE_HEADERS }
    )
  }
}

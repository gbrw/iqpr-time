import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  const startTime = Date.now()
  const checks: Record<string, unknown> = {}

  // Check database connectivity
  let dbStatus = 'ok'
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('app_settings')
      .select('key')
      .limit(1)

    if (error) {
      dbStatus = 'error'
      checks.db_error = error.message
    }
  } catch (err: any) {
    dbStatus = 'error'
    checks.db_error = err?.message ?? 'Unknown error'
  }

  checks.database = dbStatus

  const status = dbStatus === 'ok' ? 'healthy' : 'degraded'
  const responseTime = Date.now() - startTime

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      version: 'v1',
      checks,
    },
    {
      status: status === 'healthy' ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  )
}

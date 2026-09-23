import { NextResponse } from 'next/server'
import { getCachedAppSettings } from '@/lib/db/prayer-times'

export interface SuccessResponse<T = unknown> {
  success: true
  source: {
    name: string
    official_affiliation: false
    notice: string
  }
  data: T
  meta: {
    version: number
    timezone: string
    last_updated: string
  }
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

const SOURCE_INFO = {
  name: 'ديوان الوقف السني',
  official_affiliation: false as const,
  notice:
    'هذه الخدمة مشروع تقني مستقل وغير تابعة رسمياً لديوان الوقف السني.',
}

/**
 * Build a success response with standard envelope
 */
export async function successResponse<T>(
  data: T,
  status = 200,
  version?: number,
  lastUpdated?: string
): Promise<NextResponse<SuccessResponse<T>>> {
  let meta = {
    version: version ?? 1,
    timezone: 'Asia/Baghdad',
    last_updated: lastUpdated ?? new Date().toISOString(),
  }

  // Try to enrich meta from DB settings
  try {
    const settings = await getCachedAppSettings()
    meta = {
      version: parseInt(settings.active_data_version ?? '1', 10),
      timezone: 'Asia/Baghdad',
      last_updated: settings.data_last_updated ?? new Date().toISOString(),
    }
  } catch {
    // Use defaults if DB unavailable
  }

  return NextResponse.json(
    {
      success: true,
      source: SOURCE_INFO,
      data,
      meta,
    },
    {
      status,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}

/**
 * Build an error response
 */
export function errorResponse(
  code: string,
  message: string,
  status = 400
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}

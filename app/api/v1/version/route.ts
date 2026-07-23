import { NextRequest } from 'next/server'
import { getAppSettings } from '@/lib/db/prayer-times'
import { getCityCount } from '@/lib/db/cities'
import { getAllGovernorates } from '@/lib/db/governorates'
import { successResponse, errorResponse } from '@/lib/api/response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'

export async function GET(_request: NextRequest) {
  try {
    const [settings, cityCount, govs] = await Promise.all([
      getAppSettings(),
      getCityCount(),
      getAllGovernorates(),
    ])

    return successResponse({
      data_version: parseInt(settings.active_data_version ?? '1', 10),
      data_year: settings.data_year ?? '2026',
      last_updated: settings.data_last_updated ?? null,
      source: {
        name_ar: settings.source_name_ar,
        name_en: settings.source_name_en,
        notice_ar: settings.source_notice_ar,
        notice_en: settings.source_notice_en,
      },
      stats: {
        governorates_count: govs.length,
        cities_count: cityCount,
      },
    })
  } catch (err) {
    console.error('[/api/v1/version]', err)
    return errorResponse(ErrorCodes.DATABASE_ERROR, ErrorMessages.DATABASE_ERROR, 500)
  }
}

import { NextRequest } from 'next/server'
import { findCity } from '@/lib/db/cities'
import { getPrayerTimesForDay, getTodayBaghdad } from '@/lib/db/prayer-times'
import { successResponse, errorResponse } from '@/lib/api/response'
import { buildPrayerResponse } from '@/lib/api/prayer-response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'
import { CityIdentifierSchema, parseDateParam } from '@/lib/validation/schemas'

// GET /api/v1/prayer-times/{city}/{date}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ city: string; date: string }> }
) {
  const { city: cityParam, date: dateParam } = await params

  // Resolve date (supports 'today' and YYYY-MM-DD)
  const date = parseDateParam(dateParam)
  if (!date) {
    return errorResponse(ErrorCodes.INVALID_DATE, ErrorMessages.INVALID_DATE, 400)
  }

  const cityResult = CityIdentifierSchema.safeParse(decodeURIComponent(cityParam))
  if (!cityResult.success) {
    return errorResponse(ErrorCodes.INVALID_PARAMS, ErrorMessages.INVALID_PARAMS, 400)
  }

  try {
    const city = await findCity(cityResult.data)
    if (!city) {
      return errorResponse(ErrorCodes.CITY_NOT_FOUND, ErrorMessages.CITY_NOT_FOUND, 404)
    }

    const times = await getPrayerTimesForDay(city.id, date)
    if (!times) {
      return errorResponse(
        ErrorCodes.PRAYER_TIMES_NOT_FOUND,
        ErrorMessages.PRAYER_TIMES_NOT_FOUND,
        404
      )
    }

    return successResponse(buildPrayerResponse(city, times))
  } catch (err) {
    console.error('[/api/v1/prayer-times/[city]/[date]]', err)
    return errorResponse(ErrorCodes.DATABASE_ERROR, ErrorMessages.DATABASE_ERROR, 500)
  }
}

import { NextRequest } from 'next/server'
import { findCity } from '@/lib/db/cities'
import { getPrayerTimesForDay, getTodayBaghdad } from '@/lib/db/prayer-times'
import { successResponse, errorResponse } from '@/lib/api/response'
import { buildPrayerResponse } from '@/lib/api/prayer-response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'
import { CityIdentifierSchema } from '@/lib/validation/schemas'

// GET /api/v1/prayer-times/today?city=baghdad
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const cityParam = searchParams.get('city')

  if (!cityParam) {
    return errorResponse(ErrorCodes.MISSING_CITY, ErrorMessages.MISSING_CITY, 400)
  }

  const cityResult = CityIdentifierSchema.safeParse(cityParam)
  if (!cityResult.success) {
    return errorResponse(ErrorCodes.INVALID_PARAMS, ErrorMessages.INVALID_PARAMS, 400)
  }

  const today = getTodayBaghdad()

  try {
    const city = await findCity(cityResult.data)
    if (!city) {
      return errorResponse(ErrorCodes.CITY_NOT_FOUND, ErrorMessages.CITY_NOT_FOUND, 404)
    }

    const times = await getPrayerTimesForDay(city.id, today)
    if (!times) {
      return errorResponse(
        ErrorCodes.PRAYER_TIMES_NOT_FOUND,
        ErrorMessages.PRAYER_TIMES_NOT_FOUND,
        404
      )
    }

    return successResponse(buildPrayerResponse(city, times))
  } catch (err) {
    console.error('[/api/v1/prayer-times/today]', err)
    return errorResponse(ErrorCodes.DATABASE_ERROR, ErrorMessages.DATABASE_ERROR, 500)
  }
}

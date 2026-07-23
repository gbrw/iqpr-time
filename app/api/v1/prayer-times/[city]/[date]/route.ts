import { NextRequest } from 'next/server'
import { findCity } from '@/lib/db/cities'
import { getPrayerTimesForDay, getTodayBaghdad } from '@/lib/db/prayer-times'
import { successResponse, errorResponse } from '@/lib/api/response'
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

    return successResponse({
      city: {
        id: city.id,
        name_ar: city.name_ar,
        name_en: city.name_en,
        slug: city.slug,
        governorate: {
          name_ar: city.governorate_name_ar,
          name_en: city.governorate_name_en,
          slug: city.governorate_slug,
        },
      },
      date: times.date,
      prayer_times: {
        fajr: times.fajr,
        sunrise: times.sunrise,
        dhuhr: times.dhuhr,
        asr: times.asr,
        maghrib: times.maghrib,
        isha: times.isha,
      },
    })
  } catch (err) {
    console.error('[/api/v1/prayer-times/[city]/[date]]', err)
    return errorResponse(ErrorCodes.DATABASE_ERROR, ErrorMessages.DATABASE_ERROR, 500)
  }
}

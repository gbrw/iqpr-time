import { NextRequest } from 'next/server'
import { findCity } from '@/lib/db/cities'
import { getPrayerTimesForRange, getTodayBaghdad } from '@/lib/db/prayer-times'
import { successResponse, errorResponse } from '@/lib/api/response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'
import { CityIdentifierSchema, parseDateParam } from '@/lib/validation/schemas'


function startOfSundayWeek(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(Date.UTC(year, month - 1, day))
  const dayOfWeek = value.getUTCDay() // Sunday = 0 ... Saturday = 6
  value.setUTCDate(value.getUTCDate() - dayOfWeek)
  return value.toISOString().slice(0, 10)
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(Date.UTC(year, month - 1, day + days))
  return value.toISOString().slice(0, 10)
}

// GET /api/v1/prayer-times/week?city=ramadi&date=2026-01-01
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const cityParam = searchParams.get('city')
  const dateParam = searchParams.get('date')

  if (!cityParam) {
    return errorResponse(ErrorCodes.MISSING_CITY, ErrorMessages.MISSING_CITY, 400)
  }
  if (!dateParam) {
    return errorResponse(ErrorCodes.MISSING_DATE, ErrorMessages.MISSING_DATE, 400)
  }

  const cityResult = CityIdentifierSchema.safeParse(cityParam)
  if (!cityResult.success) {
    return errorResponse(ErrorCodes.INVALID_PARAMS, ErrorMessages.INVALID_PARAMS, 400)
  }

  const startDate = dateParam === 'today' ? getTodayBaghdad() : parseDateParam(dateParam)
  if (!startDate) {
    return errorResponse(ErrorCodes.INVALID_DATE, ErrorMessages.INVALID_DATE, 400)
  }
  const weekStart = startOfSundayWeek(startDate)
  const endDate = addDays(weekStart, 6)

  try {
    const city = await findCity(cityResult.data)
    if (!city) {
      return errorResponse(ErrorCodes.CITY_NOT_FOUND, ErrorMessages.CITY_NOT_FOUND, 404)
    }

    const days = await getPrayerTimesForRange(city.id, weekStart, endDate)
    if (!days.length) {
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
      start_date: weekStart,
      end_date: endDate,
      count: days.length,
      days,
    })
  } catch (err) {
    console.error('[/api/v1/prayer-times/week]', err)
    return errorResponse(ErrorCodes.DATABASE_ERROR, ErrorMessages.DATABASE_ERROR, 500)
  }
}

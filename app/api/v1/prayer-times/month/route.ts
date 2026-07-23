import { NextRequest } from 'next/server'
import { findCity } from '@/lib/db/cities'
import { getPrayerTimesForMonth } from '@/lib/db/prayer-times'
import { successResponse, errorResponse } from '@/lib/api/response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'
import { CityIdentifierSchema, MonthSchema, YearSchema } from '@/lib/validation/schemas'

// GET /api/v1/prayer-times/month?city=baghdad&month=7&year=2026
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const cityParam = searchParams.get('city')
  const monthParam = searchParams.get('month')
  const yearParam = searchParams.get('year')

  if (!cityParam) {
    return errorResponse(ErrorCodes.MISSING_CITY, ErrorMessages.MISSING_CITY, 400)
  }

  if (!monthParam) {
    return errorResponse(ErrorCodes.INVALID_MONTH, 'يجب تحديد رقم الشهر', 400)
  }

  const monthResult = MonthSchema.safeParse(monthParam)
  if (!monthResult.success) {
    return errorResponse(ErrorCodes.INVALID_MONTH, ErrorMessages.INVALID_MONTH, 400)
  }
  const month = monthResult.data

  // Default year: get from app settings or current year in Baghdad
  const year = yearParam
    ? parseInt(yearParam, 10)
    : parseInt(
        new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' }).split('-')[0],
        10
      )

  const yearResult = YearSchema.safeParse(year)
  const cityResult = CityIdentifierSchema.safeParse(cityParam)
  if (!yearResult.success || !cityResult.success) {
    return errorResponse(ErrorCodes.INVALID_PARAMS, 'السنة المُدخلة غير صالحة', 400)
  }

  try {
    const city = await findCity(cityResult.data)
    if (!city) {
      return errorResponse(ErrorCodes.CITY_NOT_FOUND, ErrorMessages.CITY_NOT_FOUND, 404)
    }

    const days = await getPrayerTimesForMonth(city.id, yearResult.data, month)
    if (!days || days.length === 0) {
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
      year: yearResult.data,
      month,
      count: days.length,
      days: days.map(d => ({
        date: d.date,
        fajr: d.fajr,
        sunrise: d.sunrise,
        dhuhr: d.dhuhr,
        asr: d.asr,
        maghrib: d.maghrib,
        isha: d.isha,
      })),
    })
  } catch (err) {
    console.error('[/api/v1/prayer-times/month]', err)
    return errorResponse(ErrorCodes.DATABASE_ERROR, ErrorMessages.DATABASE_ERROR, 500)
  }
}

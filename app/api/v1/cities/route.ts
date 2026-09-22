import { NextRequest } from 'next/server'
import { getCities } from '@/lib/db/cities'
import { getGovernorate } from '@/lib/db/governorates'
import { successResponse, errorResponse } from '@/lib/api/response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const governorateParam = searchParams.get('governorate')
  const governorateSlug = governorateParam?.trim().toLowerCase() || null
  const governorateIdStr = searchParams.get('governorate_id')

  try {
    let cities

    if (governorateSlug) {
      // Validate governorate exists
      const gov = await getGovernorate(governorateSlug)
      if (!gov) {
        return errorResponse(
          ErrorCodes.GOVERNORATE_NOT_FOUND,
          ErrorMessages.GOVERNORATE_NOT_FOUND,
          404
        )
      }
      cities = await getCities({ governorateSlug })
    } else if (governorateIdStr) {
      const govId = parseInt(governorateIdStr, 10)
      if (isNaN(govId) || govId < 1) {
        return errorResponse(
          ErrorCodes.INVALID_PARAMS,
          'governorate_id must be a positive integer',
          400
        )
      }
      const gov = await getGovernorate(govId)
      if (!gov) {
        return errorResponse(
          ErrorCodes.GOVERNORATE_NOT_FOUND,
          ErrorMessages.GOVERNORATE_NOT_FOUND,
          404
        )
      }
      cities = await getCities({ governorateId: govId })
    } else {
      cities = await getCities()
    }

    return successResponse({
      count: cities.length,
      cities: cities.map(c => ({
        id: c.id,
        name_ar: c.name_ar,
        name_en: c.name_en,
        slug: c.slug,
        governorate: {
          id: c.governorate_id,
          name_ar: c.governorate_name_ar,
          name_en: c.governorate_name_en,
          slug: c.governorate_slug,
        },
      })),
    })
  } catch (err) {
    console.error('[/api/v1/cities]', err)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages.DATABASE_ERROR,
      500
    )
  }
}

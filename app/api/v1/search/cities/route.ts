import { NextRequest } from 'next/server'
import { searchCities } from '@/lib/db/cities'
import { successResponse, errorResponse } from '@/lib/api/response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'
import { SearchLimitSchema, SearchQuerySchema } from '@/lib/validation/schemas'

// GET /api/v1/search/cities?q=بغداد
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const qParam = searchParams.get('q')
  const limitParam = searchParams.get('limit')

  if (!qParam) {
    return errorResponse(ErrorCodes.MISSING_QUERY, ErrorMessages.MISSING_QUERY, 400)
  }

  const queryResult = SearchQuerySchema.safeParse(qParam)
  const limitResult = SearchLimitSchema.safeParse(limitParam ?? 20)
  if (!queryResult.success || !limitResult.success) {
    return errorResponse(ErrorCodes.INVALID_PARAMS, ErrorMessages.INVALID_PARAMS, 400)
  }
  const q = queryResult.data
  const limit = limitResult.data

  try {
    const cities = await searchCities(q, limit)

    return successResponse({
      query: q,
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
    console.error('[/api/v1/search/cities]', err)
    return errorResponse(ErrorCodes.DATABASE_ERROR, ErrorMessages.DATABASE_ERROR, 500)
  }
}

import { NextRequest } from 'next/server'
import { getAllGovernorates } from '@/lib/db/governorates'
import { successResponse, errorResponse } from '@/lib/api/response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'

export async function GET(_request: NextRequest) {
  try {
    const governorates = await getAllGovernorates()

    return successResponse({
      count: governorates.length,
      governorates: governorates.map(g => ({
        id: g.id,
        name_ar: g.name_ar,
        name_en: g.name_en,
        slug: g.slug,
        cities_count: g.cities_count,
      })),
    })
  } catch (err) {
    console.error('[/api/v1/governorates]', err)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages.DATABASE_ERROR,
      500
    )
  }
}

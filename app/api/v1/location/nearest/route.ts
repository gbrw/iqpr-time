import { NextRequest, NextResponse } from 'next/server'
import { searchCities } from '@/lib/db/cities'

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .trim()
    .toLowerCase()
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'))
  const lon = Number(request.nextUrl.searchParams.get('lon'))

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_COORDINATES', message: 'Invalid coordinates' } }, { status: 400 })
  }

  // Fast boundary check to avoid sending obviously non-Iraqi coordinates for lookup.
  if (lat < 28.5 || lat > 38.5 || lon < 37.5 || lon > 49.5) {
    return NextResponse.json({ success: false, error: { code: 'OUTSIDE_IRAQ', message: 'Location is outside Iraq' } }, { status: 422 })
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lon))
    url.searchParams.set('zoom', '10')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('accept-language', 'ar,en')

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IQPR-Time/1.0 (https://iqpr-time-neon.vercel.app)',
        'Accept-Language': 'ar,en;q=0.8',
      },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error('Reverse geocoding failed')
    const place = await response.json()
    if (place?.address?.country_code && place.address.country_code !== 'iq') {
      return NextResponse.json({ success: false, error: { code: 'OUTSIDE_IRAQ', message: 'Location is outside Iraq' } }, { status: 422 })
    }

    const address = place?.address ?? {}
    const candidates = [
      address.city,
      address.town,
      address.village,
      address.municipality,
      address.suburb,
      address.county,
      address.state_district,
    ].filter((value): value is string => Boolean(value && typeof value === 'string'))

    for (const candidate of candidates) {
      const matches = await searchCities(candidate, 12)
      if (!matches.length) continue
      const target = normalize(candidate)
      const exact = matches.find(item => normalize(item.name_ar) === target || normalize(item.name_en) === target || normalize(item.slug) === target)
      const city = exact ?? matches[0]
      return NextResponse.json({
        success: true,
        data: {
          city: {
            id: city.id,
            name_ar: city.name_ar,
            name_en: city.name_en,
            slug: city.slug,
            governorate_id: city.governorate_id,
            governorate_name_ar: city.governorate_name_ar,
            governorate_name_en: city.governorate_name_en,
            governorate_slug: city.governorate_slug,
          },
          matched_locality: candidate,
        },
      }, { headers: { 'Cache-Control': 'no-store' } })
    }

    return NextResponse.json({ success: false, error: { code: 'CITY_NOT_FOUND', message: 'No matching city was found' } }, { status: 404 })
  } catch (error) {
    console.error('[location/nearest]', error)
    return NextResponse.json({ success: false, error: { code: 'LOCATION_LOOKUP_FAILED', message: 'Location lookup failed' } }, { status: 502 })
  }
}

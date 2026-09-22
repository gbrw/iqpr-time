import { NextRequest, NextResponse } from 'next/server'
import { getCities, type City } from '@/lib/db/cities'

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/محافظه/g, '')
    .replace(/governorate/gi, '')
    .replace(/province/gi, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
}

function uniqueGovernorates(cities: City[]) {
  const map = new Map<string, {
    slug: string
    name_ar: string
    name_en: string
  }>()

  for (const city of cities) {
    if (!map.has(city.governorate_slug)) {
      map.set(city.governorate_slug, {
        slug: city.governorate_slug,
        name_ar: city.governorate_name_ar,
        name_en: city.governorate_name_en,
      })
    }
  }

  return [...map.values()]
}

function detectGovernorateSlug(
  address: Record<string, unknown>,
  cities: City[]
): string | null {
  const values = [
    address.state,
    address.state_district,
    address.region,
    address.county,
  ].filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))

  const governorates = uniqueGovernorates(cities)

  for (const raw of values) {
    const target = normalize(raw)
    for (const gov of governorates) {
      const names = [gov.slug, gov.name_ar, gov.name_en].map(normalize)
      if (names.some(name => name === target || target.includes(name) || name.includes(target))) {
        return gov.slug
      }
    }
  }

  return null
}

function findCityInsideGovernorate(
  candidates: string[],
  governorateSlug: string,
  cities: City[]
): City | null {
  const scoped = cities.filter(city => city.governorate_slug === governorateSlug)

  // Exact match first.
  for (const candidate of candidates) {
    const target = normalize(candidate)
    const exact = scoped.find(city =>
      [city.name_ar, city.name_en, city.slug].some(value => normalize(value) === target)
    )
    if (exact) return exact
  }

  // Then a contained-name match, useful for values such as "الحبانية" matching
  // "الخالدية والحبانية", while still remaining inside the correct governorate.
  for (const candidate of candidates) {
    const target = normalize(candidate)
    if (target.length < 3) continue
    const partial = scoped.find(city => {
      const values = [city.name_ar, city.name_en, city.slug].map(normalize)
      return values.some(value => value.includes(target) || target.includes(value))
    })
    if (partial) return partial
  }

  // Safe governorate-centre fallback.  Never fall back to a city from another
  // governorate, which was the source of the Baghdad/Anbar mix-up.
  const centreByGovernorate: Record<string, string> = {
    baghdad: 'baghdad-center',
    anbar: 'ramadi',
    basra: 'basra',
    nineveh: 'mosul',
    erbil: 'erbil',
    sulaymaniyah: 'sulaymaniyah',
    duhok: 'duhok',
    kirkuk: 'kirkuk',
    diyala: 'baqubah',
    babylon: 'hillah',
    karbala: 'karbala',
    najaf: 'najaf',
    'al-qadisiyyah': 'diwaniyah',
    'al-muthanna': 'samawah',
    'dhi-qar': 'nasiriyah',
    maysan: 'amarah',
    wasit: 'kut',
    saladin: 'tikrit',
    halabja: 'halabja',
  }

  const centreSlug = centreByGovernorate[governorateSlug]
  return scoped.find(city => city.slug === centreSlug) ?? scoped[0] ?? null
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'))
  const lon = Number(request.nextUrl.searchParams.get('lon'))

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_COORDINATES', message: 'Invalid coordinates' } },
      { status: 400 }
    )
  }

  if (lat < 28.5 || lat > 38.5 || lon < 37.5 || lon > 49.5) {
    return NextResponse.json(
      { success: false, error: { code: 'OUTSIDE_IRAQ', message: 'Location is outside Iraq' } },
      { status: 422 }
    )
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
      return NextResponse.json(
        { success: false, error: { code: 'OUTSIDE_IRAQ', message: 'Location is outside Iraq' } },
        { status: 422 }
      )
    }

    const address = (place?.address ?? {}) as Record<string, unknown>
    const allCities = await getCities()
    const governorateSlug = detectGovernorateSlug(address, allCities)

    if (!governorateSlug) {
      return NextResponse.json(
        { success: false, error: { code: 'GOVERNORATE_NOT_FOUND', message: 'Could not identify governorate' } },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const candidates = [
      address.city,
      address.town,
      address.village,
      address.municipality,
      address.suburb,
      address.city_district,
      address.county,
      address.state_district,
    ].filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))

    const city = findCityInsideGovernorate(candidates, governorateSlug, allCities)

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: 'CITY_NOT_FOUND', message: 'No matching city was found' } },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

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
        matched_locality: candidates[0] ?? null,
      },
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[location/nearest]', error)
    return NextResponse.json(
      { success: false, error: { code: 'LOCATION_LOOKUP_FAILED', message: 'Location lookup failed' } },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

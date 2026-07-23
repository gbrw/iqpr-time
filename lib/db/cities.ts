import { getSupabaseClient } from '@/lib/supabase/server'

export interface City {
  id: number
  name_ar: string
  name_en: string
  slug: string
  governorate_id: number
  governorate_name_ar: string
  governorate_name_en: string
  governorate_slug: string
}

/**
 * Normalize Arabic text for comparison (remove diacritics, normalize alef)
 */
function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F]/g, '') // Remove tashkeel
    .replace(/[أإآ]/g, 'ا')          // Normalize alef
    .replace(/ة/g, 'ه')              // Normalize ta marbuta
    .trim()
    .toLowerCase()
}

const CITY_ALIASES: Record<string, string> = {
  baghdad: 'baghdad-center',
  basra: 'basra-city',
  erbil: 'erbil-city',
  kirkuk: 'kirkuk-city',
  najaf: 'najaf-city',
  karbala: 'karbala-city',
  sulaymaniyah: 'sulaymaniyah-city',
  duhok: 'duhok-city',
  halabja: 'halabja-city',
}

/**
 * Get all cities, optionally filtered by governorate slug or ID
 */
export async function getCities(options?: {
  governorateSlug?: string
  governorateId?: number
}): Promise<City[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('cities_with_governorate')
    .select('*')
    .order('name_en', { ascending: true })

  if (options?.governorateSlug) {
    query = query.eq('governorate_slug', options.governorateSlug)
  } else if (options?.governorateId) {
    query = query.eq('governorate_id', options.governorateId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data || []) as City[]
}

/**
 * Find a city by slug, Arabic name, or English name
 */
export async function findCity(identifier: string): Promise<City | null> {
  const supabase = getSupabaseClient()
  const trimmed = identifier.trim()
  const normalized = normalizeArabic(trimmed)
  const resolvedIdentifier = CITY_ALIASES[trimmed.toLowerCase()] ?? trimmed

  // Try slug first (most common case)
  const { data: bySlug } = await supabase
    .from('cities_with_governorate')
    .select('*')
    .eq('slug', resolvedIdentifier.toLowerCase())
    .single()

  if (bySlug) return bySlug as City

  // Try exact Arabic name
  const { data: byArExact } = await supabase
    .from('cities_with_governorate')
    .select('*')
    .eq('name_ar', trimmed)
    .single()

  if (byArExact) return byArExact as City

  // Try English name (case insensitive)
  const { data: byEn } = await supabase
    .from('cities_with_governorate')
    .select('*')
    .ilike('name_en', trimmed)
    .single()

  if (byEn) return byEn as City

  // Arabic fallback: support diacritics and common alef/ta-marbuta variants.
  if (/[؀-ۿ]/.test(trimmed)) {
    const { data } = await supabase
      .from('cities_with_governorate')
      .select('*')

    const match = (data ?? []).find(city => normalizeArabic(city.name_ar) === normalized)
    if (match) return match as City
  }

  return null
}

/**
 * Search cities by query string (Arabic, English, or slug)
 */
export async function searchCities(q: string, limit = 20): Promise<City[]> {
  const supabase = getSupabaseClient()
  const trimmed = q.trim()
  if (!trimmed) return []

  // PostgREST uses commas and parentheses as filter syntax. Removing only its
  // control characters keeps user text safe while preserving Arabic/English.
  const safeTerm = trimmed.replace(/[%_(),.]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!safeTerm) return []

  // Search across slug, name_ar, name_en using ilike
  const { data, error } = await supabase
    .from('cities_with_governorate')
    .select('*')
    .or(
      `slug.ilike.%${safeTerm}%,name_ar.ilike.%${safeTerm}%,name_en.ilike.%${safeTerm}%`
    )
    .order('name_en', { ascending: true })
    .limit(limit)

  if (error) throw new Error(error.message)
  if (data?.length || !/[؀-ۿ]/.test(safeTerm)) return (data || []) as City[]

  const { data: allCities, error: fallbackError } = await supabase
    .from('cities_with_governorate')
    .select('*')
    .order('name_en', { ascending: true })

  if (fallbackError) throw new Error(fallbackError.message)
  const normalizedTerm = normalizeArabic(safeTerm)
  return (allCities ?? [])
    .filter(city => normalizeArabic(city.name_ar).includes(normalizedTerm))
    .slice(0, limit) as City[]
}

/**
 * Get total city count
 */
export async function getCityCount(): Promise<number> {
  const supabase = getSupabaseClient()
  const { count } = await supabase
    .from('cities')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

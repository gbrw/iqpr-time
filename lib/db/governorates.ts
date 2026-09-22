import { getSupabaseClient } from '@/lib/supabase/server'

export interface Governorate {
  id: number
  name_ar: string
  name_en: string
  slug: string
  cities_count?: number
}

/**
 * Get all governorates with city counts
 */
export async function getAllGovernorates(): Promise<Governorate[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('governorates')
    .select(`
      id,
      name_ar,
      name_en,
      slug,
      cities(count)
    `)
    .order('name_en', { ascending: true })

  if (error) throw new Error(error.message)

  return (data || []).map((g: any) => ({
    id: g.id,
    name_ar: g.name_ar,
    name_en: g.name_en,
    slug: g.slug,
    cities_count: g.cities?.[0]?.count ?? 0,
  }))
}

/**
 * Get a single governorate by slug or id
 */
export async function getGovernorate(
  slugOrId: string | number
): Promise<Governorate | null> {
  const supabase = getSupabaseClient()

  const query = supabase.from('governorates').select('id, name_ar, name_en, slug')

  const { data, error } = typeof slugOrId === 'number'
    ? await query.eq('id', slugOrId).maybeSingle()
    : await query.ilike('slug', slugOrId.trim()).maybeSingle()

  if (error) {
    console.error('[getGovernorate]', { slugOrId, code: error.code, message: error.message })
    throw new Error(error.message)
  }

  if (!data) return null
  return data as Governorate
}

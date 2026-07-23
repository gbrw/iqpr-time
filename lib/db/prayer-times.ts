import { getSupabaseClient } from '@/lib/supabase/server'

export interface PrayerTime {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  prayer_date: string
  city_id: number
  data_version: number
}

export interface DayPrayerTime {
  date: string
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

/**
 * Get the active data version from app_settings
 */
export async function getActiveDataVersion(): Promise<number> {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'active_data_version')
    .single()
  return parseInt(data?.value ?? '1', 10)
}

/**
 * Get app_settings as a key-value map
 */
export async function getAppSettings(): Promise<Record<string, string>> {
  const supabase = getSupabaseClient()
  const { data } = await supabase.from('app_settings').select('key, value')
  const settings: Record<string, string> = {}
  for (const row of data ?? []) {
    settings[row.key] = row.value
  }
  return settings
}

/**
 * Get prayer times for a single day
 */
export async function getPrayerTimesForDay(
  cityId: number,
  date: string, // YYYY-MM-DD
  version?: number
): Promise<DayPrayerTime | null> {
  const supabase = getSupabaseClient()
  const dataVersion = version ?? (await getActiveDataVersion())

  const { data, error } = await supabase
    .from('prayer_times')
    .select('prayer_date, fajr, sunrise, dhuhr, asr, maghrib, isha')
    .eq('city_id', cityId)
    .eq('prayer_date', date)
    .eq('data_version', dataVersion)
    .single()

  if (error || !data) return null

  return {
    date: data.prayer_date,
    fajr: data.fajr,
    sunrise: data.sunrise,
    dhuhr: data.dhuhr,
    asr: data.asr,
    maghrib: data.maghrib,
    isha: data.isha,
  }
}

/**
 * Get prayer times for a month
 */
export async function getPrayerTimesForMonth(
  cityId: number,
  year: number,
  month: number,
  version?: number
): Promise<DayPrayerTime[]> {
  const supabase = getSupabaseClient()
  const dataVersion = version ?? (await getActiveDataVersion())

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0) // Last day of month
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('prayer_times')
    .select('prayer_date, fajr, sunrise, dhuhr, asr, maghrib, isha')
    .eq('city_id', cityId)
    .eq('data_version', dataVersion)
    .gte('prayer_date', startDate)
    .lte('prayer_date', endDateStr)
    .order('prayer_date', { ascending: true })

  if (error) throw new Error(error.message)

  return (data || []).map(r => ({
    date: r.prayer_date,
    fajr: r.fajr,
    sunrise: r.sunrise,
    dhuhr: r.dhuhr,
    asr: r.asr,
    maghrib: r.maghrib,
    isha: r.isha,
  }))
}

/**
 * Get prayer times for a full year
 */
export async function getPrayerTimesForYear(
  cityId: number,
  year: number,
  version?: number
): Promise<DayPrayerTime[]> {
  const supabase = getSupabaseClient()
  const dataVersion = version ?? (await getActiveDataVersion())

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const { data, error } = await supabase
    .from('prayer_times')
    .select('prayer_date, fajr, sunrise, dhuhr, asr, maghrib, isha')
    .eq('city_id', cityId)
    .eq('data_version', dataVersion)
    .gte('prayer_date', startDate)
    .lte('prayer_date', endDate)
    .order('prayer_date', { ascending: true })

  if (error) throw new Error(error.message)

  return (data || []).map(r => ({
    date: r.prayer_date,
    fajr: r.fajr,
    sunrise: r.sunrise,
    dhuhr: r.dhuhr,
    asr: r.asr,
    maghrib: r.maghrib,
    isha: r.isha,
  }))
}

/**
 * Get today's date in Asia/Baghdad timezone
 */
export function getTodayBaghdad(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Baghdad',
  })
}

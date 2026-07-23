import { z } from 'zod'

/**
 * Date string validation: YYYY-MM-DD
 */
export const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
).refine(
  (val) => {
    const [year, month, day] = val.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day
  },
  'Invalid date'
)

/**
 * Month validation: 1-12
 */
export const MonthSchema = z.coerce.number().int().min(1).max(12)

/**
 * Year validation: reasonable range
 */
export const YearSchema = z.coerce.number().int().min(2020).max(2100)

/**
 * City identifier: slug or Arabic/English name
 */
export const CityIdentifierSchema = z.string().min(1).max(100).trim()

/**
 * Governorate identifier: slug or numeric ID
 */
export const GovernorateIdentifierSchema = z.union([
  z.string().min(1).max(100).trim(),
  z.coerce.number().int().positive(),
])

/**
 * Search query
 */
export const SearchQuerySchema = z.string().min(1).max(100).trim()

export const SearchLimitSchema = z.coerce.number().int().min(1).max(50)

/**
 * Parse and validate a date string
 */
export function parseDate(input: string): string | null {
  const result = DateSchema.safeParse(input)
  return result.success ? result.data : null
}

/**
 * Parse a "today" or YYYY-MM-DD date
 */
export function parseDateParam(input: string): string | null {
  if (input === 'today') {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' })
  }
  return parseDate(input)
}

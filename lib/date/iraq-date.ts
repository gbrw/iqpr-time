const BAGHDAD_TIME_ZONE = 'Asia/Baghdad'

export function parseYmd(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return new Date(NaN)
  const [, y, m, d] = match
  // Noon UTC keeps the same civil date across supported display time zones.
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12, 0, 0))
}

export function formatGregorianYmd(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: BAGHDAD_TIME_ZONE }).format(parseYmd(value))
}

export function formatHijriYmd(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: BAGHDAD_TIME_ZONE }).format(parseYmd(value))
}

export function isFridayYmd(value: string): boolean {
  return parseYmd(value).getUTCDay() === 5
}

export function getDynamicDateBounds(todayYmd: string) {
  const year = Number(todayYmd.slice(0, 4)) || new Date().getUTCFullYear()
  return {
    min: `${year}-01-01`,
    max: `${year + 1}-12-31`,
  }
}

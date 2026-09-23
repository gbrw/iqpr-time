import type { City } from '@/lib/db/cities'
import type { DayPrayerTime } from '@/lib/db/prayer-times'

export function buildPrayerResponse(city: City, times: DayPrayerTime) {
  return {
    city: {
      id: city.id,
      name_ar: city.name_ar,
      name_en: city.name_en,
      slug: city.slug,
      governorate: {
        name_ar: city.governorate_name_ar,
        name_en: city.governorate_name_en,
        slug: city.governorate_slug,
      },
    },
    date: times.date,
    prayer_times: {
      fajr: times.fajr,
      sunrise: times.sunrise,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha,
    },
  }
}

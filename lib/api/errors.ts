/**
 * Standard API error codes
 */
export const ErrorCodes = {
  // 400 Bad Request
  INVALID_DATE: 'INVALID_DATE',
  INVALID_MONTH: 'INVALID_MONTH',
  MISSING_CITY: 'MISSING_CITY',
  MISSING_DATE: 'MISSING_DATE',
  MISSING_QUERY: 'MISSING_QUERY',
  INVALID_PARAMS: 'INVALID_PARAMS',

  // 404 Not Found
  CITY_NOT_FOUND: 'CITY_NOT_FOUND',
  GOVERNORATE_NOT_FOUND: 'GOVERNORATE_NOT_FOUND',
  PRAYER_TIMES_NOT_FOUND: 'PRAYER_TIMES_NOT_FOUND',
  DATE_OUT_OF_RANGE: 'DATE_OUT_OF_RANGE',

  // 429 Too Many Requests
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // 500 Internal Server Error
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export const ErrorMessages: Record<ErrorCode, string> = {
  INVALID_DATE: 'التاريخ المُدخل غير صالح. استخدم صيغة YYYY-MM-DD',
  INVALID_MONTH: 'رقم الشهر غير صالح. يجب أن يكون بين 1 و 12',
  MISSING_CITY: 'يجب تحديد اسم المدينة أو slug الخاص بها',
  MISSING_DATE: 'يجب تحديد التاريخ',
  MISSING_QUERY: 'يجب تحديد نص البحث (q)',
  INVALID_PARAMS: 'المعاملات المُدخلة غير صالحة',
  CITY_NOT_FOUND: 'المدينة المطلوبة غير موجودة',
  GOVERNORATE_NOT_FOUND: 'المحافظة المطلوبة غير موجودة',
  PRAYER_TIMES_NOT_FOUND: 'لا تتوفر أوقات صلاة للتاريخ أو المدينة المطلوبة',
  DATE_OUT_OF_RANGE: 'التاريخ خارج نطاق البيانات المتاحة',
  RATE_LIMIT_EXCEEDED: 'تجاوزت الحد المسموح به من الطلبات. حاول مجدداً بعد قليل.',
  INTERNAL_ERROR: 'حدث خطأ داخلي في الخادم',
  DATABASE_ERROR: 'حدث خطأ في قاعدة البيانات',
}

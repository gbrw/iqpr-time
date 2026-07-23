import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { errorResponse } from '@/lib/api/response'
import { ErrorCodes, ErrorMessages } from '@/lib/api/errors'

const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Powered-By': '',
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let rateLimitInfo: Awaited<ReturnType<typeof checkRateLimit>> = null

  // Handle CORS preflight for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
      },
    })
  }

  // Block non-GET methods on API routes (except OPTIONS handled above)
  if (pathname.startsWith('/api/v1/') && request.method !== 'GET') {
    return NextResponse.json(
      { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET requests are allowed' } },
      { status: 405, headers: { Allow: 'GET' } }
    )
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/v1/')) {
    rateLimitInfo = await checkRateLimit(request)
    if (rateLimitInfo && !rateLimitInfo.success) {
      const response = errorResponse(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        ErrorMessages.RATE_LIMIT_EXCEEDED,
        429
      )
      response.headers.set('Retry-After', String(rateLimitInfo.retryAfter))
      response.headers.set('X-RateLimit-Limit', String(rateLimitInfo.limit))
      response.headers.set('X-RateLimit-Remaining', '0')
      // Add CORS to rate limit response
      Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v))
      return response
    }
  }

  const response = NextResponse.next()

  // Apply security headers to all routes
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value) response.headers.set(key, value)
    else response.headers.delete(key)
  })

  // Apply CORS headers to API routes
  if (pathname.startsWith('/api/')) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    if (rateLimitInfo) {
      response.headers.set('X-RateLimit-Limit', String(rateLimitInfo.limit))
      response.headers.set('X-RateLimit-Remaining', String(rateLimitInfo.remaining))
      response.headers.set('X-RateLimit-Reset', String(rateLimitInfo.reset))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis/cloudflare'
import { NextRequest } from 'next/server'

let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Rate limiting disabled if Redis not configured
    return null
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
    prefix: 'iraq-prayer-times',
  })

  return ratelimit
}

/**
 * Check rate limit for incoming request.
 * Returns null if allowed, or an object with retry info if blocked.
 */
export async function checkRateLimit(
  request: NextRequest
): Promise<{ success: boolean; limit: number; remaining: number; reset: number; retryAfter: number } | null> {
  const rl = getRatelimit()
  if (!rl) return null // Rate limiting disabled

  // Use IP as identifier
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  const { success, limit, remaining, reset } = await rl.limit(ip)

  const retryAfter = success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  return { success, limit, remaining, reset, retryAfter }
}

import { Redis } from '@upstash/redis/cloudflare'

const TTL_SECONDS = 86_400
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>()
let redis: Redis | null | undefined

function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  return redis
}

export function getLocationCacheKey(lat: number, lon: number) {
  return `iqpr:location:${lat.toFixed(2)}:${lon.toFixed(2)}`
}

export async function getCachedLocation<T>(key: string): Promise<T | null> {
  const local = memoryCache.get(key)
  if (local && local.expiresAt > Date.now()) return local.value as T
  if (local) memoryCache.delete(key)

  const client = getRedis()
  if (!client) return null
  try {
    const value = await client.get(key) as T | null
    if (value != null) {
      memoryCache.set(key, { value, expiresAt: Date.now() + TTL_SECONDS * 1000 })
      return value
    }
  } catch (error) {
    console.warn('[location-cache/get]', error)
  }
  return null
}

export async function setCachedLocation<T>(key: string, value: T): Promise<void> {
  memoryCache.set(key, { value, expiresAt: Date.now() + TTL_SECONDS * 1000 })
  const client = getRedis()
  if (!client) return
  try {
    await client.set(key, value, { ex: TTL_SECONDS })
  } catch (error) {
    console.warn('[location-cache/set]', error)
  }
}

import { createClient } from '@supabase/supabase-js'

/**
 * Supabase anon client — safe to use in API routes for read-only operations.
 */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Singleton for API routes (reuse across requests)
let _client: ReturnType<typeof createAnonClient> | null = null

export function getSupabaseClient() {
  if (!_client) {
    _client = createAnonClient()
  }
  return _client
}

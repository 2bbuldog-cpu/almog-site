import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy client — only throws at runtime if env vars are missing, not at build time
let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Supabase env vars not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Convenience export for client components
export const supabase = {
  get client() { return getSupabase() }
}

// Server-side client with service role key (for API routes only)
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!url || !serviceKey) {
    throw new Error('Supabase service key not configured')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

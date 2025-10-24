import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Create a safe client even if envs are missing, to avoid blank screen on embed
// When not configured, network calls will fail but UI still renders.
export const supabase: SupabaseClient = createClient(
  url || 'https://example.com',
  anon || 'public-anon-key',
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  }
)

let restClient: SupabaseClient | null = null

// Helper to call Edge Functions
export async function callFunction<T = unknown>(name: string, body?: unknown, headers?: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke<T>(name, { body, headers })
  if (error) throw error
  return data as T
}

// Issue a short-lived visitor token with custom claim visitor_id
export async function ensureVisitorAuth(visitorId: string) {
  try {
    const data = await callFunction<{ token: string }>('issue-visitor-token', { visitorId })
    const token = data.token
    // Realtime needs this for socket auth
    supabase.realtime.setAuth(token)
    // Recreate a REST client that always sends our JWT
    restClient = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    })
  } catch (e) {
    // Fallback: rely on anon key only (limited features)
    console.warn('Failed to obtain visitor token, continuing anon', e)
  }
}

export function db(): SupabaseClient { return restClient ?? supabase }

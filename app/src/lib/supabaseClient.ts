import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase: SupabaseClient = createClient(url, anon, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
})

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

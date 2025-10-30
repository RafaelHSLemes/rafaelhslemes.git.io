import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let url = import.meta.env.VITE_SUPABASE_URL as string | undefined
let anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Runtime fallback for production if envs were not injected in build
// Safe: anon key é pública por design no Supabase
const FALLBACK_URL = 'https://atdhhnyzjlmqamxybexz.supabase.co'
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0ZGhobnl6amxtcWFteHliZXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgwODgsImV4cCI6MjA3Njg5NDA4OH0.G_5XGC9Qf__1yXgMdvLSzwrZ_F55kl4bJcTDsEO9xYU'

if (!url || url.includes('example.com')) url = FALLBACK_URL
if (!anon || anon === 'public-anon-key') anon = FALLBACK_ANON

// Create a safe client even if envs are missing, to avoid blank screen on embed
// When not configured, network calls will fail but UI still renders.
export const supabase: SupabaseClient = createClient(
  url || FALLBACK_URL,
  anon || FALLBACK_ANON,
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

// deno-lint-ignore-file no-explicit-any
import { createSigner } from 'https://deno.land/x/djwt@v3.0.2/mod.ts'

const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Supabase accepts JWTs signed with the service role secret (HS256)
// We mint a short-lived token with role=anon and a custom claim visitor_id

async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const { visitorId } = await req.json()
  if (!visitorId) return new Response('Bad Request', { status: 400 })

  const now = Math.floor(Date.now() / 1000)
  const payload: Record<string, any> = {
    aud: 'authenticated',
    role: 'anon',
    exp: now + 60 * 60, // 1h
    iat: now,
    visitor_id: visitorId,
  }

  const token = await signHS256(payload, serviceKey)
  return new Response(JSON.stringify({ token }), { headers: { 'content-type': 'application/json' } })
}

async function signHS256(payload: any, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const header = { alg: 'HS256', typ: 'JWT' }
  const enc = (obj: any) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj)))).replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_')
  const h = enc(header)
  const p = enc(payload)
  const data = new TextEncoder().encode(`${h}.${p}`)
  const sig = await crypto.subtle.sign('HMAC', key, data)
  const s = btoa(String.fromCharCode(...new Uint8Array(sig))).replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_')
  return `${h}.${p}.${s}`
}

Deno.serve(handler)


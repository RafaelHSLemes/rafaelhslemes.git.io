// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@3'

type Input = { conversationId: string; text: string }

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendKey = Deno.env.get('RESEND_API_KEY')!

const supabase = createClient(supabaseUrl, serviceKey)
const resend = new Resend(resendKey)

async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  const user = await getUser(token)
  if (!user) return new Response('Unauthorized', { status: 401 })

  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) return new Response('Forbidden', { status: 403 })

  const { conversationId, text } = (await req.json()) as Input
  if (!conversationId || !text) return new Response('Bad Request', { status: 400 })

  await supabase.from('messages').insert({ conversation_id: conversationId, author: 'admin', text })

  const { data: conv } = await supabase.from('conversations').select('email').eq('id', conversationId).maybeSingle()
  if (conv?.email) {
    await resend.emails.send({
      from: 'Portfolio <noreply@YOUR_DOMAIN>',
      to: conv.email,
      subject: 'Você recebeu uma resposta',
      html: `<p>Olá! Você recebeu uma resposta à sua conversa.</p>`
    })
  }
  await supabase.from('notifications').insert({ conversation_id: conversationId, type: 'admin_reply' })
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
}

async function getUser(jwt: string) {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: `Bearer ${jwt}` } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function checkIsAdmin(userId: string) {
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
  if (data) return true
  // Also allow explicit claim
  try {
    const payload = JSON.parse(atob((await getAuthJwt())?.split('.')[1] || ''))
    return Boolean(payload?.is_admin)
  } catch {
    return false
  }
}

async function getAuthJwt() {
  // Not strictly needed here since we hit admins via service key.
  return null
}

Deno.serve(handler)


// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@3'

type Input = { conversationId: string; preview: string; captchaToken?: string }

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendKey = Deno.env.get('RESEND_API_KEY')!
const adminEmail = Deno.env.get('ADMIN_EMAIL_DESTINATION')!
const siteBaseUrl = Deno.env.get('SITE_BASE_URL')!
const turnstileSecret = Deno.env.get('TURNSTILE_SECRET')

const supabase = createClient(supabaseUrl, serviceKey)
const resend = new Resend(resendKey)

async function verifyCaptcha(token?: string) {
  if (!turnstileSecret) return true
  if (!token) return false
  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: turnstileSecret, response: token }),
  })
  const data = await resp.json()
  return Boolean(data.success)
}

async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const { conversationId, preview, captchaToken } = (await req.json()) as Input
  if (!conversationId) return new Response('Bad Request', { status: 400 })

  const ok = await verifyCaptcha(captchaToken)
  if (!ok) return new Response('Captcha required', { status: 400 })

  // debounce 10 minutes for new_message
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('notifications')
    .select('id, sent_at')
    .eq('conversation_id', conversationId)
    .eq('type', 'new_message')
    .gte('sent_at', since)
  if (recent && recent.length) return new Response(JSON.stringify({ skipped: true }), { headers: { 'content-type': 'application/json' } })

  const link = `${siteBaseUrl}/#/admin?c=${conversationId}`
  await resend.emails.send({
    from: 'Portfolio <noreply@YOUR_DOMAIN>',
    to: adminEmail,
    subject: `Nova conversa (${conversationId.slice(0, 8)})`,
    html: `<div style="font-family:system-ui,Segoe UI,Arial">
      <h2>Nova conversa</h2>
      <p><strong>Prévia:</strong> ${escapeHtml(preview || '')}</p>
      <p><a href="${link}">Abrir no painel</a></p>
    </div>`,
  })

  await supabase.from('notifications').insert({ conversation_id: conversationId, type: 'new_message' })
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c])
}

Deno.serve(handler)


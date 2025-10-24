// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendKey = Deno.env.get('RESEND_API_KEY')!
const adminEmail = Deno.env.get('ADMIN_EMAIL_DESTINATION')!

const supabase = createClient(supabaseUrl, serviceKey)
const resend = new Resend(resendKey)

type Message = { id: string; conversation_id: string; author: 'visitor' | 'admin'; text: string; created_at: string }

async function digestWindowMinutes() {
  // 5 minutes by default; override via env if desired
  const v = Number(Deno.env.get('DIGEST_WINDOW_MINUTES') || '5')
  return Number.isFinite(v) && v > 0 ? v : 5
}

async function handler(_req: Request) {
  const windowMin = await digestWindowMinutes()
  const now = new Date()
  const since = new Date(now.getTime() - windowMin * 60000).toISOString()

  // Find conversations with messages in the last window
  const { data: recentMsgs, error: e1 } = await supabase
    .from('messages')
    .select('conversation_id, created_at')
    .gte('created_at', since)
  if (e1) return json({ ok: false, error: e1.message }, 500)

  const convIds = Array.from(new Set((recentMsgs || []).map((m) => m.conversation_id as string)))
  let sent = 0
  for (const cid of convIds) {
    // last digest time
    const { data: last } = await supabase
      .from('notifications')
      .select('sent_at')
      .eq('conversation_id', cid)
      .eq('type', 'digest')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sinceThis = last?.sent_at || since

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', cid)
      .gte('created_at', sinceThis)
      .order('created_at', { ascending: true })

    if (!msgs || msgs.length === 0) continue

    // Compose email
    const lines = msgs.map((m) => `${fmtTime(m.created_at)}  ${m.author}: ${m.text}`)
    const html = `<div style="font-family:system-ui,Segoe UI,Arial">
      <h2>Transcrição de ${windowMin} min — conversa ${cid.slice(0,8)}</h2>
      <pre style="white-space:pre-wrap;line-height:1.4">${escapeHtml(lines.join('\n'))}</pre>
    </div>`

    await resend.emails.send({
      from: 'Portfolio <noreply@YOUR_DOMAIN>',
      to: adminEmail,
      subject: `Transcrição (${windowMin} min) — ${cid.slice(0,8)}`,
      html,
    })

    await supabase.from('notifications').insert({ conversation_id: cid, type: 'digest' })
    sent += 1
  }

  return json({ ok: true, sent, windowMin })
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toISOString().substring(11, 16) // HH:MM
  } catch { return iso }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  } as any)[c])
}

function json(obj: any, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } }) }

Deno.serve(handler)


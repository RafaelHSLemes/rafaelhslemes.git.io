import { useEffect, useMemo, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import ChatWindow from '../components/ChatWindow'
import Composer from '../components/Composer'
import { db, supabase, ensureVisitorAuth, callFunction } from '../lib/supabaseClient'
import { subscribeToMessages, type Message } from '../lib/realtime'

function uuidv4() {
  return (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  }))
}

export default function Home() {
  const hasCaptcha = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)
  const [userReady, setUserReady] = useState(() => {
    try { return localStorage.getItem('chat_user_ready') === '1' } catch { return false }
  })
  const [authed, setAuthed] = useState(false)
  const [visitorId] = useState(() => {
    const k = 'visitor_id'
    const v = localStorage.getItem(k)
    if (v) return v
    const n = uuidv4()
    localStorage.setItem(k, n)
    return n
  })
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [requireCaptcha, setRequireCaptcha] = useState(hasCaptcha)
  const [lastSentAt, setLastSentAt] = useState<number>(0)
  const [email, setEmail] = useState<string>('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [authed, setAuthed] = useState(false)

  // lightweight fetch wrapper to attach Authorization if we minted a visitor token
  const rest = useMemo(() => ({
    async insertMessage(text: string, author: 'visitor' | 'admin', conversationId: string) {
      const { data, error } = await db().from('messages').insert([{ conversation_id: conversationId, author, text }]).select('*').single()
      if (error) throw error
      return data as Message
    }
  }), [])

  useEffect(() => {
    // If logged in via Supabase, skip the name gate
    const enableChat = () => {
      try {
        localStorage.setItem('chat_user_ready', '1')
        const n = localStorage.getItem('chat_user_name')
        if (!n) localStorage.setItem('chat_user_name', 'Usuário')
      } catch {}
      setUserReady(true)
    }
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const isAuthed = Boolean(user)
      setAuthed(isAuthed)
      if (isAuthed) enableChat()
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const isAuthed = Boolean(session?.user)
      setAuthed(isAuthed)
      if (isAuthed) enableChat()
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    ;(async () => {
      // auth state
      const { data: { user } } = await supabase.auth.getUser()
      setAuthed(Boolean(user))
      // obtain short-lived visitor token for RLS
      await ensureVisitorAuth(visitorId)
      // ensure conversation exists
      const { data: existing, error } = await db().from('conversations').select('id,email').eq('visitor_id', visitorId).limit(1).maybeSingle()
      if (error) console.warn(error)
      let cid = existing?.id as string | undefined
      if (!cid) {
        const { data: created, error: e2 } = await db().from('conversations').insert([{ visitor_id: visitorId }]).select('id').single()
        if (e2) console.error(e2)
        cid = created?.id
      }
      if (!cid) return
      setConversationId(cid)
      if (existing?.email) setEmail(existing.email as string)
      // If user is logged and no email set yet, store user's email
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const uEmail = user?.email || ''
        if (uEmail && !existing?.email) {
          await db().from('conversations').update({ email: uEmail }).eq('id', cid)
          setEmail(uEmail)
        }
      } catch {}
      // load messages
      const { data: msgs } = await db().from('messages').select('*').eq('conversation_id', cid).order('created_at', { ascending: true })
      setMessages(msgs as Message[] || [])
      // subscribe realtime
      const unsub = subscribeToMessages(cid, (m) => setMessages((prev) => [...prev, m]))
      return () => unsub()
    })()
  }, [visitorId])

  async function logout() {
    try {
      await supabase.auth.signOut()
      try { localStorage.removeItem('post_login_target'); localStorage.removeItem('chat_user_ready') } catch {}
      setAuthed(false)
      setUserReady(false)
    } catch {}
  }

  async function onSend(text: string, captchaToken?: string) {
    if (!conversationId) return
    const now = Date.now()
    const tooSoon = now - lastSentAt < 2000
    if (tooSoon) return
    setLastSentAt(now)

    // On first message or after idle, require captcha and notify
    const shouldNotify = !messages.length || (messages.length && now - (messages[messages.length - 1]?.created_at ? new Date(messages[messages.length - 1].created_at).getTime() : 0) > 10 * 60 * 1000)
    if (requireCaptcha && !captchaToken) return

    const inserted = await rest.insertMessage(text, 'visitor', conversationId)
    setMessages((prev) => [...prev, inserted])

    if (shouldNotify) {
      await callFunction('notify-new-message', {
        conversationId,
        preview: text.slice(0, 120),
        captchaToken,
      })
      setRequireCaptcha(false)
    }
  }

  async function saveEmail() {
    if (!conversationId) return
    setSavingEmail(true)
    try {
      const v = email.trim()
      if (!v) return
      await db().from('conversations').update({ email: v }).eq('id', conversationId)
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="font-semibold">Fale comigo</h1>
        <div className="flex items-center gap-2">
          <a className="text-sm underline" href="/">Página inicial</a>
          <a className="text-sm underline" href="#/admin">Admin</a>
          {authed && (
            <button className="text-sm px-2 py-1 rounded border" onClick={logout}>Sair</button>
          )}
          <ThemeToggle />
        </div>
      </header>
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
        {!userReady ? (
          <div className="w-full flex items-center gap-2">
            <input
              type="text"
              aria-label="Seu nome"
              placeholder="Digite seu nome para iniciar"
              className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const v = (e.target as HTMLInputElement).value.trim()
                  if (v) { try { localStorage.setItem('chat_user_ready', '1'); localStorage.setItem('chat_user_name', v) } catch {} ; setUserReady(true) }
                }
              }}
            />
            <button
              className="px-2 py-1 text-sm rounded border"
              onClick={() => {
                const el = (document.activeElement as HTMLInputElement)
                const v = (el?.value || '').trim()
                if (v) { try { localStorage.setItem('chat_user_ready', '1'); localStorage.setItem('chat_user_name', v) } catch {} ; setUserReady(true) }
              }}
            >Entrar</button>
          </div>
        ) : (
          <>
            <input
              type="email"
              inputMode="email"
              aria-label="Seu e-mail (opcional)"
              placeholder="Seu e-mail (opcional para cópia de respostas)"
              className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={saveEmail}
            />
            <button className="px-2 py-1 text-sm rounded border" disabled={savingEmail} onClick={saveEmail}>
              Salvar
            </button>
          </>
        )}
      </div>
      <ChatWindow messages={messages} />
      {userReady ? (
        <Composer onSend={onSend} requireCaptcha={requireCaptcha} />
      ) : (
        <div className="p-3 text-sm opacity-70">Entre com seu nome para habilitar o envio.</div>
      )}
    </div>
  )
}

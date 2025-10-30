import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatWindow from './ChatWindow'
import Composer from './Composer'
import { db, ensureVisitorAuth, callFunction, supabase } from '../lib/supabaseClient'
import { subscribeToMessages, type Message } from '../lib/realtime'

function uuidv4() {
  return (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  }))
}

export default function ChatWidget() {
  const supabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  const hasCaptcha = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY)
  const initialOpen = new URL(window.location.href).searchParams.get('open') === '1'
  const [open, setOpen] = useState(initialOpen)
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

  // Insert message via RLS (uses short-lived visitor JWT minted by Edge function)
  const rest = useMemo(() => ({
    async insertMessage(text: string, author: 'visitor' | 'admin', conversationId: string) {
      const { data, error } = await db().from('messages').insert([{ conversation_id: conversationId, author, text }]).select('*').single()
      if (error) throw error
      return data as Message
    }
  }), [])

  useEffect(() => {
    // Keep track of Supabase auth; if logged in, allow chatting without asking name
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const isAuthed = Boolean(user)
      setAuthed(isAuthed)
      if (isAuthed) setUserReady(true)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const isAuthed = Boolean(session?.user)
      setAuthed(isAuthed)
      if (isAuthed) setUserReady(true)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    // RLS: obtain a JWT carrying visitor_id so anon can access their own rows
    ;(async () => {
      await ensureVisitorAuth(visitorId)
      // Ensure conversation exists and load messages
      const { data: existing } = await db().from('conversations').select('id,email').eq('visitor_id', visitorId).limit(1).maybeSingle()
      let cid = existing?.id as string | undefined
      if (!cid) {
        const { data: created } = await db().from('conversations').insert([{ visitor_id: visitorId }]).select('id').single()
        cid = created?.id
      }
      if (!cid) return
      setConversationId(cid)
      if (existing?.email) setEmail(existing.email as string)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const uEmail = user?.email || ''
        if (uEmail && !existing?.email) {
          await db().from('conversations').update({ email: uEmail }).eq('id', cid)
          setEmail(uEmail)
        }
      } catch {}

      const { data: msgs } = await db().from('messages').select('*').eq('conversation_id', cid).order('created_at', { ascending: true })
      setMessages((msgs as Message[]) || [])
      // Realtime: subscribe to INSERTs for this conversation
      const unsub = subscribeToMessages(cid, (m) => setMessages((prev) => [...prev, m]))
      return () => unsub()
    })()
  }, [visitorId])

  async function onSend(text: string, captchaToken?: string) {
    if (!conversationId) return
    const now = Date.now()
    if (now - lastSentAt < 2000) return // rate-limit 1 msg/2s (front)
    setLastSentAt(now)

    const idle = !messages.length || (messages.length && now - (messages[messages.length - 1]?.created_at ? new Date(messages[messages.length - 1].created_at).getTime() : 0) > 10 * 60 * 1000)
    if (requireCaptcha && !captchaToken) return

    const inserted = await rest.insertMessage(text, 'visitor', conversationId)
    setMessages((prev) => [...prev, inserted])

    if (idle) {
      await callFunction('notify-new-message', { conversationId, preview: text.slice(0, 120), captchaToken })
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
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15 }}
            className="w-[22rem] md:w-[26rem] h-[28rem] md:h-[32rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-lg flex flex-col overflow-hidden"
            role="dialog" aria-label="Chat"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="font-medium">Fale comigo</div>
              <button className="text-sm px-2 py-1 rounded border" onClick={() => setOpen(false)} aria-label="Minimizar chat">–</button>
            </div>
            {!supabaseConfigured && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-800">
                Configuração necessária: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY e re‑publique.
              </div>
            )}
            <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
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
                    placeholder="Seu e-mail (opcional)"
                    className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={saveEmail}
                  />
                  <button className="px-2 py-1 text-sm rounded border" disabled={savingEmail} onClick={saveEmail}>Salvar</button>
                </>
              )}
            </div>
            <ChatWindow messages={messages} />
            {userReady ? (
              <Composer onSend={onSend} requireCaptcha={requireCaptcha} />
            ) : (
              <div className="p-3 text-sm opacity-70 border-t border-zinc-200 dark:border-zinc-800">Entre com seu nome para habilitar o envio.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <button
          className="rounded-full shadow-lg px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2"
          onClick={() => setOpen(true)}
          aria-label="Abrir chat"
        >
          Chat
        </button>
      )}
    </div>
  )
}

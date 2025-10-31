import { useEffect, useMemo, useState } from 'react'
import AuthGate from '../components/AuthGate'
import ThemeToggle from '../components/ThemeToggle'
import ChatWindow from '../components/ChatWindow'
import Composer from '../components/Composer'
import Metrics from '../components/Metrics'
import { supabase, callFunction } from '../lib/supabaseClient'
import { subscribeToMessages } from '../lib/realtime'
import type { Message } from '../lib/realtime'

type Conversation = { id: string; created_at: string; visitor_id: string | null; last_event_at: string | null; status: 'open' | 'closed'; email: string | null }

export default function Admin() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [q, setQ] = useState('')
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || '')
      await loadConversations()
    })()
  }, [filter, q])

  async function loadConversations() {
    let qry = supabase.from('conversations').select('*').order('last_event_at', { ascending: false })
    if (filter !== 'all') qry = qry.eq('status', filter)
    const { data } = await qry
    let list = (data || []) as Conversation[]
    if (q) list = list.filter((c) => c.id.includes(q) || c.visitor_id?.includes(q))
    setConversations(list)
  }

  async function openConversation(id: string) {
    setActiveId(id)
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true })
    setMessages((data || []) as Message[])
  }

  // Realtime: subscribe to new messages while a conversation is open
  useEffect(() => {
    if (!activeId) return
    const unsub = subscribeToMessages(activeId, (m) => {
      setMessages((prev) => [...prev, m])
    })
    return () => unsub()
  }, [activeId])

  async function sendAdmin(text: string) {
    if (!activeId) return
    try {
      await callFunction('admin-reply', { conversationId: activeId, text })
    } catch (error) {
      console.error(error)
    }
  }

  async function closeConversation(id: string) {
    await supabase.from('conversations').update({ status: 'closed' }).eq('id', id)
    await loadConversations()
  }

  async function logout() {
    try {
      await supabase.auth.signOut()
    } finally {
      try { localStorage.removeItem('post_login_target') } catch {}
      const basePath = (import.meta.env.VITE_BASE_PATH as string) || '/'
      const baseUrl = new URL(basePath.endsWith('/') ? basePath : basePath + '/', window.location.origin).toString()
      window.location.href = baseUrl
    }
  }

  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="font-semibold">Admin</h1>
          <div className="flex items-center gap-2">
            {userEmail && <span className="text-xs opacity-70">{userEmail}</span>}
            <a className="text-sm underline" href="#/">Visitante</a>
            <button className="text-sm px-2 py-1 rounded border" onClick={logout}>Sair</button>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 grid md:grid-cols-3">
          <aside className="border-r border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
            <div className="flex gap-2">
              <select aria-label="Filtro" className="border rounded px-2 py-1 bg-transparent" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                <option value="all">Todas</option>
                <option value="open">Abertas</option>
                <option value="closed">Fechadas</option>
              </select>
              <input aria-label="Busca" className="border rounded px-2 py-1 bg-transparent flex-1" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              {conversations.map((c) => (
                <button key={c.id} onClick={() => openConversation(c.id)} className={`w-full text-left p-2 rounded border ${activeId === c.id ? 'border-blue-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <div className="text-xs opacity-70">{c.status}</div>
                  <div className="font-mono text-sm truncate">{c.id}</div>
                </button>
              ))}
            </div>
            <Metrics />
          </aside>
          <section className="md:col-span-2 flex flex-col">
            {activeId ? (
              <>
                <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="font-mono text-sm">{activeId}</div>
                  <button className="px-2 py-1 text-sm rounded border" onClick={() => closeConversation(activeId!)}>Fechar conversa</button>
                </div>
                <ChatWindow messages={messages} />
                <Composer onSend={(t) => sendAdmin(t)} />
              </>
            ) : (
              <div className="flex-1 grid place-items-center">Selecione uma conversa</div>
            )}
          </section>
        </main>
      </div>
    </AuthGate>
  )
}

import { supabase } from './supabaseClient'

export type Message = {
  id: string
  conversation_id: string
  author: 'visitor' | 'admin'
  text: string
  created_at: string
}

export function subscribeToMessages(conversationId: string, onNew: (msg: Message) => void) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
      onNew(payload.new as Message)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}


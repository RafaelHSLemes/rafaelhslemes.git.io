import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { Message } from '../lib/realtime'

export default function ChatWindow({ messages }: { messages: Message[] }) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex-1 overflow-y-auto p-3" aria-label="Histórico de mensagens">
      {messages.map((m) => (
        <MessageBubble key={m.id} author={m.author} timestamp={m.created_at}>
          {m.text}
        </MessageBubble>
      ))}
      <div ref={endRef} />
    </div>
  )
}


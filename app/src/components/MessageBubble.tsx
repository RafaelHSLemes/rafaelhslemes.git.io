import { ReactNode } from 'react'

export default function MessageBubble({ author, children, timestamp }: { author: 'visitor' | 'admin'; children: ReactNode; timestamp?: string }) {
  const isVisitor = author === 'visitor'
  return (
    <div className={`flex ${isVisitor ? 'justify-start' : 'justify-end'} my-1`}>
      <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isVisitor ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-blue-600 text-white'}`}>
        <div className="opacity-80">{children}</div>
        {timestamp && <div className="text-[10px] opacity-60 mt-1">{new Date(timestamp).toLocaleTimeString()}</div>}
      </div>
    </div>
  )
}


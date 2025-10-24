import { useEffect, useRef, useState } from 'react'
import { loadTurnstile, renderTurnstile } from '../lib/captcha'

export default function Composer({ onSend, requireCaptcha }: { onSend: (text: string, captchaToken?: string) => Promise<void> | void; requireCaptcha?: boolean }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [captcha, setCaptcha] = useState<string | undefined>()
  const captchaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (requireCaptcha && captchaRef.current) {
      loadTurnstile().then(() => renderTurnstile(captchaRef.current!, import.meta.env.VITE_TURNSTILE_SITE_KEY, (t) => setCaptcha(t)))
    }
  }, [requireCaptcha])

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    if (busy) return
    setBusy(true)
    try {
      await onSend(trimmed, captcha)
      setText('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
      {requireCaptcha && <div ref={captchaRef} className="mb-2" aria-label="Captcha" />}
      <div className="flex gap-2">
        <textarea
          aria-label="Mensagem"
          className="flex-1 resize-none rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
          rows={2}
          maxLength={2000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={handleSend}
          disabled={busy || !text.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}


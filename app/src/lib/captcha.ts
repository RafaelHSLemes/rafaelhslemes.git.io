const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

export function loadTurnstile() {
  return new Promise<void>((resolve) => {
    if ((window as any).turnstile) return resolve()
    const s = document.createElement('script')
    s.src = TURNSTILE_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    document.head.appendChild(s)
  })
}

export function renderTurnstile(container: HTMLElement, siteKey: string, callback: (token: string) => void) {
  const win = window as any
  if (!win.turnstile) return
  win.turnstile.render(container, {
    sitekey: siteKey,
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    callback,
  })
}


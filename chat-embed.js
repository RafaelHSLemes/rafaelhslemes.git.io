(() => {
  const existing = document.getElementById('portfolio-chat-container')
  if (existing) return

  const configSrc = (function () {
    // Config priority: window.CHAT_WIDGET_SRC > script[data-src] > default placeholder
    const scripts = document.getElementsByTagName('script')
    const me = scripts[scripts.length - 1]
    const dataSrc = me?.getAttribute('data-src') || ''
    const winSrc = (window).CHAT_WIDGET_SRC || ''
    return (winSrc || dataSrc || '').trim()
  })()

  const container = document.createElement('div')
  container.id = 'portfolio-chat-container'
  container.style.position = 'fixed'
  container.style.bottom = '16px'
  container.style.right = '16px'
  container.style.zIndex = '9999'
  container.style.display = 'flex'
  container.style.flexDirection = 'column'
  container.style.alignItems = 'flex-end'

  const button = document.createElement('button')
  button.type = 'button'
  button.setAttribute('aria-label', 'Abrir chat')
  button.style.border = '0'
  button.style.borderRadius = '9999px'
  button.style.padding = '12px 16px'
  button.style.background = '#2563eb'
  button.style.color = '#fff'
  button.style.boxShadow = '0 10px 30px rgba(0,0,0,.2)'
  button.style.cursor = 'pointer'
  button.style.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial'
  button.textContent = 'Chat'

  const frameWrap = document.createElement('div')
  frameWrap.style.width = '360px'
  frameWrap.style.height = '520px'
  frameWrap.style.borderRadius = '12px'
  frameWrap.style.overflow = 'hidden'
  frameWrap.style.boxShadow = '0 10px 30px rgba(0,0,0,.2)'
  frameWrap.style.marginTop = '10px'
  frameWrap.style.display = 'none'
  frameWrap.style.border = '1px solid rgba(0,0,0,.1)'
  frameWrap.style.background = 'white'

  const iframe = document.createElement('iframe')
  iframe.title = 'Chat'
  iframe.style.border = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.allow = 'clipboard-read; clipboard-write;'

  if (configSrc) {
    iframe.src = configSrc
  } else {
    // Placeholder content when not configured
    const doc = iframe.contentWindow?.document
  }

  button.addEventListener('click', () => {
    const visible = frameWrap.style.display !== 'none'
    frameWrap.style.display = visible ? 'none' : 'block'
  })

  frameWrap.appendChild(iframe)
  container.appendChild(button)
  container.appendChild(frameWrap)
  document.body.appendChild(container)
})()


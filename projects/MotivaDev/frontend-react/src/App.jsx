import React, { useCallback, useEffect, useMemo, useState } from 'react'

const LOCAL_QUOTES = [
  { text: 'O código é como humor. Quando você precisa explicá-lo, é ruim.', author: 'Cory House' },
  { text: 'Programadores e artistas são os únicos profissionais que têm como hobby o próprio trabalho.', author: 'Rasmus Lerdorf' },
  { text: 'Simplicidade é a alma da eficiência.', author: 'Austin Freeman' },
  { text: 'Qualquer tolo pode escrever código que um computador entende. Bons programadores escrevem código que humanos entendem.', author: 'Martin Fowler' },
  { text: 'Primeiro, resolva o problema. Depois, escreva o código.', author: 'John Johnson' },
  { text: 'Antes de otimizar, meça.', author: 'Donald Knuth' },
  { text: 'A única maneira de ir rápido, é ir bem.', author: 'Robert C. Martin' }
]

function randomLocalQuote() {
  return LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)]
}

function useRandomGradient(seed) {
  return useMemo(() => {
    const hue = Math.floor(Math.random() * 360)
    const hue2 = (hue + 60 + Math.floor(Math.random() * 120)) % 360
    return `linear-gradient(135deg, hsl(${hue} 80% 20%), hsl(${hue2} 70% 30%))`
  }, [seed])
}

export default function App() {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bgSeed, setBgSeed] = useState(0)

  const apiUrl = import.meta.env.VITE_API_URL || '/api/quote'

  const fetchQuote = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data || !data.text) throw new Error('Resposta inválida da API')
      setQuote({ text: data.text, author: data.author || 'Desconhecido' })
      setBgSeed(s => s + 1)
    } catch (e) {
      // Fallback local para funcionar no GitHub Pages
      setQuote(randomLocalQuote())
      setError('Usando frases locais (API indisponível)')
      setBgSeed(s => s + 1)
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  const gradient = useRandomGradient(bgSeed)

  const shareText = quote ? `${quote.text} — ${quote.author}` : ''
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://'

  const shareOnX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const shareOnLinkedIn = () => {
    // LinkedIn compartilha uma URL; incluímos a frase no hash para referência
    const shareUrl = `${pageUrl.split('#')[0]}#${encodeURIComponent(shareText)}`
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const webShare = async () => {
    if (navigator.share && quote) {
      try {
        await navigator.share({ text: shareText, url: pageUrl, title: 'DevQuotes' })
      } catch {}
    } else {
      shareOnX()
    }
  }

  return (
    <div className="app" style={{ backgroundImage: gradient }}>
      <div className="card fade-in">
        <h1 className="title">DevQuotes</h1>
        <p className="subtitle">Frases motivacionais de programadores</p>

        <div className="quote">
          {loading ? (
            <div className="spinner" aria-label="Carregando" />
          ) : (
            <>
              <p className="quote-text">{quote?.text}</p>
              <p className="quote-author">— {quote?.author}</p>
            </>
          )}
        </div>

        {error && <p className="hint" role="status">{error}</p>}

        <div className="actions">
          <button className="btn primary" onClick={fetchQuote} disabled={loading}>
            {loading ? 'Gerando…' : 'Gerar nova frase'}
          </button>
          <div className="share">
            <button className="btn ghost" onClick={webShare}>Compartilhar</button>
            <button className="btn ghost" onClick={shareOnX} aria-label="Compartilhar no X">X</button>
            <button className="btn ghost" onClick={shareOnLinkedIn} aria-label="Compartilhar no LinkedIn">in</button>
          </div>
        </div>
      </div>
      <footer className="footer">React • Fetch API • Hooks • Animações</footer>
    </div>
  )
}


import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button
      aria-label={dark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 text-sm"
      onClick={() => setDark((v) => !v)}
    >
      {dark ? '🌙' : '☀️'}
    </button>
  )
}


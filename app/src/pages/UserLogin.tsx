import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../lib/supabaseClient'

export default function UserLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
      nav('/')
    } catch (e: any) {
      setError(e?.message || 'Falha ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="font-semibold">Login do Usuário</h1>
        <ThemeToggle />
      </header>
      <main className="flex-1 grid place-items-center p-4">
        <form onSubmit={onLogin} className="w-full max-w-sm space-y-3">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          >{loading ? 'Entrando…' : 'Entrar'}</button>

          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div className="text-sm opacity-80">
            Não tem conta? <Link to="/signup" className="underline">Criar conta</Link>
          </div>
        </form>
      </main>
    </div>
  )
}


import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const basePath = (import.meta.env.VITE_BASE_PATH as string) || '/'
      const baseUrl = new URL(basePath.endsWith('/') ? basePath : basePath + '/', window.location.origin).toString()
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: baseUrl,
        },
      })
      if (error) throw error
      setMessage('Cadastro iniciado. Verifique seu e-mail para confirmar.')
    } catch (e: any) {
      setError(e?.message || 'Falha ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="font-semibold">Cadastro</h1>
        <div className="flex items-center gap-2">
          <a className="text-sm underline" href="/">Página inicial</a>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 grid place-items-center p-4">
        <form onSubmit={onSignup} className="w-full max-w-sm space-y-3">
          <input
            type="text"
            placeholder="Nome"
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
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
            autoComplete="new-password"
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          >{loading ? 'Enviando…' : 'Criar conta'}</button>

          {message && <div className="text-sm text-green-600 dark:text-green-400">{message}</div>}
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div className="text-sm opacity-80">
            Já tem conta? <Link to="/user-login" className="underline">Entrar</Link>
          </div>
        </form>
      </main>
    </div>
  )
}

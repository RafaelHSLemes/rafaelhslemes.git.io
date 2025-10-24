import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  async function login() {
    await supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="font-semibold">Login</h1>
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center">
        <button className="px-4 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" onClick={login}>
          Entrar com GitHub
        </button>
      </main>
    </div>
  )
}


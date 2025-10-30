import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  async function login() {
    const basePath = (import.meta.env.VITE_BASE_PATH as string) || '/'
    const baseUrl = new URL(basePath.endsWith('/') ? basePath : basePath + '/', window.location.origin).toString()
    const toAdmin = `${baseUrl}#/admin`
    await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: toAdmin } })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="font-semibold">Login</h1>
        <div className="flex items-center gap-2">
          <a className="text-sm underline" href="/">Página inicial</a>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <button className="px-4 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" onClick={login}>
          Entrar com GitHub
        </button>
      </main>
    </div>
  )
}


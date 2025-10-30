import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setAllowed(false)
      // Check admin claim or table fallback
      const isAdminClaim = Boolean((user.app_metadata as any)?.is_admin)
      if (isAdminClaim) return setAllowed(true)
      // Query admins with the authenticated JWT (not the visitor token)
      const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
      if (error) console.error(error)
      setAllowed(Boolean(data))
    })()
  }, [])

  if (allowed === null) return <div className="p-4">Carregando…</div>
  if (!allowed) return <div className="p-4">Acesso negado. Faça login com GitHub.</div>
  return <>{children}</>
}

import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthBootstrap() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const run = async () => {
      const hash = (typeof window !== 'undefined') ? window.location.hash : ''
      const { data: { session } } = await supabase.auth.getSession()
      // Do not auto-redirect during OAuth callback; let PostLoginRedirector handle it
      if (hash.includes('access_token=')) return
      if (!session?.user?.id) return
      // check admin membership with user JWT
      const { data } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      if (data && location.pathname !== '/admin') {
        navigate('/admin', { replace: true })
      }
    }
    run()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) return
      supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
        if (data && location.pathname !== '/admin') navigate('/admin', { replace: true })
      })
    })
    return () => { sub.subscription.unsubscribe() }
  }, [location, navigate])

  return null
}

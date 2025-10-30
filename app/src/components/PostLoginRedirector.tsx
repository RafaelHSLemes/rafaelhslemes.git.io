import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function PostLoginRedirector() {
  const navigate = useNavigate()
  useEffect(() => {
    const go = async () => {
      const hash = (typeof window !== 'undefined') ? window.location.hash : ''
      const target = (typeof localStorage !== 'undefined') ? (localStorage.getItem('post_login_target') || '/admin') : '/admin'
      const { data: { session } } = await supabase.auth.getSession()
      // If we just returned from OAuth (hash has access_token) or session already exists, route to target
      if ((hash.includes('access_token=') || session)) {
        // give the SDK a moment to persist the session
        setTimeout(() => {
          try { localStorage.removeItem('post_login_target') } catch {}
          navigate(target, { replace: true })
        }, 0)
      }
    }
    go()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const target = (typeof localStorage !== 'undefined') ? (localStorage.getItem('post_login_target') || '/admin') : '/admin'
      if (session) {
        try { localStorage.removeItem('post_login_target') } catch {}
        navigate(target, { replace: true })
      }
    })
    return () => { sub.subscription.unsubscribe() }
  }, [navigate])
  return null
}

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function PostLoginRedirector() {
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    const go = async () => {
      const hash = (typeof window !== 'undefined') ? window.location.hash : ''
      const target = (typeof localStorage !== 'undefined') ? localStorage.getItem('post_login_target') : null
      const { data: { session } } = await supabase.auth.getSession()
      // Only redirect automatically when returning from OAuth callback (hash contains access_token)
      // or when an explicit target is set in localStorage. Avoid defaulting to "/" to prevent loops.
      const returningFromOAuth = hash.includes('access_token=')
      if (returningFromOAuth || (session && target)) {
        setTimeout(() => {
          try { localStorage.removeItem('post_login_target') } catch {}
          if (target) {
            navigate(target, { replace: true })
          }
        }, 0)
      }
    }
    go()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const target = (typeof localStorage !== 'undefined') ? localStorage.getItem('post_login_target') : null
      if (session && target) {
        try { localStorage.removeItem('post_login_target') } catch {}
        navigate(target, { replace: true })
      }
    })
    return () => { sub.subscription.unsubscribe() }
  }, [navigate, location])
  return null
}

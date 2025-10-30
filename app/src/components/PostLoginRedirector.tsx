import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function PostLoginRedirector() {
  const navigate = useNavigate()
  useEffect(() => {
    const go = async () => {
      const target = (typeof localStorage !== 'undefined') ? localStorage.getItem('post_login_target') : null
      const { data: { session } } = await supabase.auth.getSession()
      if (session && target) {
        try { localStorage.removeItem('post_login_target') } catch {}
        navigate(target, { replace: true })
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
  }, [navigate])
  return null
}


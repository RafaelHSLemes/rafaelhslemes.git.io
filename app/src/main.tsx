import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/global.css'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Signup from './pages/Signup'
import UserLogin from './pages/UserLogin'
import ChatWidget from './components/ChatWidget'
import AuthBootstrap from './components/AuthBootstrap'
import PostLoginRedirector from './components/PostLoginRedirector'

function App() {
  const embedOnly = new URL(window.location.href).searchParams.get('embed') === '1'
  if (embedOnly) {
    return <ChatWidget />
  }
  return (
    <HashRouter>\n      <AuthBootstrap />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        {/** Important: do NOT redirect unknown paths; this preserves OAuth callback hash (e.g., #access_token=...) until Supabase processes it. */}
        <Route path="*" element={<div />} />
      </Routes>
      <PostLoginRedirector />
      {/** Do not render widget inside full chat app to avoid overlapping UI */}
    </HashRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)


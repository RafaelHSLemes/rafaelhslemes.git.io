import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/global.css'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Login from './pages/Login'
import ChatWidget from './components/ChatWidget'

function App() {
  const embedOnly = new URL(window.location.href).searchParams.get('embed') === '1'
  if (embedOnly) {
    return <ChatWidget />
  }
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </HashRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

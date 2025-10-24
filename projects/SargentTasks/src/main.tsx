import React from 'react'
import ReactDOM from 'react-dom/client'
import { TaskProvider } from './state/TaskContext'
import { App } from './ui/App'
import './ui/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TaskProvider>
      <App />
    </TaskProvider>
  </React.StrictMode>
)


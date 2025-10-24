import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Define base path for GitHub Pages via env (default '/')
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
})


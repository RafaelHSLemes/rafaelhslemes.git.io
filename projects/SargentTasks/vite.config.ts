import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deploy path under the GitHub Pages user site: /projects/SargentTasks/
export default defineConfig({
  base: '/projects/SargentTasks/',
  plugins: [react()],
  build: {
    outDir: 'docs'
  }
})


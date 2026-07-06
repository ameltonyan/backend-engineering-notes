import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/backend-engineering-notes/', // relative paths for GitHub Pages
  plugins: [react()],
})

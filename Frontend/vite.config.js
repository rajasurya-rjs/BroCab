import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Remove HTTPS for now
    host: true,
    port: 5173
  }
})

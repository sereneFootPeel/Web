import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['epochekairos.com'],
    port: 5173,
    proxy: {
      '/api': apiProxyTarget,
      '/likes': apiProxyTarget,
      '/language': apiProxyTarget,
      '/css': apiProxyTarget,
    },
  },
})


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/likes': 'http://localhost:8080',
      '/language': 'http://localhost:8080',
      // 前后端分离后，测试页面在前端实现，仅保留数据与资源代理
      '/css': 'http://localhost:8080',
      '/data': 'http://localhost:8080',
    },
  },
})


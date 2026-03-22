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
      // 测试页面（Thymeleaf）及静态资源代理到后端
      '/mmpi': 'http://localhost:8080',
      '/mbti': 'http://localhost:8080',
      '/enneagram': 'http://localhost:8080',
      '/bigfive': 'http://localhost:8080',
      '/values8': 'http://localhost:8080',
      '/css': 'http://localhost:8080',
      '/data': 'http://localhost:8080',
    },
  },
})


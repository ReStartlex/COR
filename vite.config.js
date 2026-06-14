import { resolve } from 'path'
import { defineConfig } from 'vite'

// Vite нужен ТОЛЬКО для удобной локальной разработки (npm run dev) и
// необязательной сборки. На VPS сайт работает как обычная статика без сборки —
// см. DEPLOY.md. Порт 3002 выбран, чтобы не конфликтовать с 3000/3001.
export default defineConfig({
  root: '.',
  publicDir: false,
  server: { port: 3002, host: true, strictPort: false, open: false },
  preview: { port: 3002, host: true },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        course: resolve(__dirname, 'course.html'),
        notfound: resolve(__dirname, '404.html'),
      },
    },
  },
})

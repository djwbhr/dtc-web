import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Разрешаем доступ со всех IP-адресов
    port: 5173, // Порт по умолчанию
    strictPort: true, // Запрещаем автоматический выбор порта
    watch: {
      usePolling: true // Включаем polling для лучшей работы в некоторых сетевых окружениях
    }
  }
})

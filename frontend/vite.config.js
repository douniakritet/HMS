import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/patients': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api/doctors': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/rendez-vous': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      },
      '/api/billings': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
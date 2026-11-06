import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preview: {
    host: true,
    port: Number(process.env.PORT) || 4173,
    allowedHosts: ["iris-frontend-fbyb.onrender.com"],
  },
  server: {
    host: true,
    allowedHosts: ["iris-frontend-fbyb.onrender.com"],
  },
}
  ],
})

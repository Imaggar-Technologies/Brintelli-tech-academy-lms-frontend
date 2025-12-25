import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ✅ Development only (used by `vite dev`)
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'laudatory-fallon-portative.ngrok-free.dev'
    ],
  },

  // ✅ Production build optimizations (VERY IMPORTANT)
  build: {
    sourcemap: false,          // 🚀 BIG speed improvement
    chunkSizeWarningLimit: 2000,
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})

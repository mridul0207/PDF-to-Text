import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'pdfjs-dist': 'pdfjs-dist/build/pdf',
    },
  },
})

import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // React/React DOM and @base-ui/react's primitives (Dialog, Menu,
        // Select, Switch, Toast…) change far less often than app code, so
        // splitting them into their own chunk means a deploy that only
        // touches clauses/components doesn't invalidate the vendor
        // chunk's browser cache — and drops every chunk under the 500kB
        // warning threshold in the process.
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@base-ui')) {
            return 'vendor-base-ui'
          }
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Aplikacja5V5/', // jeśli repo nie na root domeny
  build: {
    outDir: 'docs',  // zamiast domyślnego 'dist'
  },
  plugins: [react()],
})
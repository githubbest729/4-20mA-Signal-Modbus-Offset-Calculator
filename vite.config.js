import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you deploy to GitHub Pages at https://<user>.github.io/<repo>/,
// set `base` to '/<repo>/'. If you deploy to Render, a custom domain,
// or the root of a github.io user site, leave base as '/'.
export default defineConfig({
  plugins: [react()],
  base: '/signal-modbus-calc/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

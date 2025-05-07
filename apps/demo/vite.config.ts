import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@form-collab/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@form-collab/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@form-collab/vue': path.resolve(__dirname, '../../packages/vue/src/index.ts')
    }
  },
  define: {
    global: 'globalThis'
  }
})
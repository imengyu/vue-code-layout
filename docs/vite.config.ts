import { defineConfig } from 'vite'
import { resolve } from 'path'
export default defineConfig({
  build: {
    ssr: false
  },
  resolve: {
    alias: {
      'vue-code-layout': resolve(__dirname, '../library')
    },
  },
})
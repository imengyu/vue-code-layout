import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  test: {
    // jsdom 模拟浏览器环境，用于 Vue 组件测试
    environment: 'jsdom',
    // 全局引入 describe/it/expect，无需每个测试文件手动 import
    globals: true,
    // 测试文件匹配模式
    include: ['library/**/*.{test,spec}.{ts,tsx}'],
    // 清除 mock 调用记录
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./library', import.meta.url)),
    },
  },
})

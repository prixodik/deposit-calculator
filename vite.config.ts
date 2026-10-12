/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Для GitHub Pages приложение живёт в подпапке репозитория.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
  },
})

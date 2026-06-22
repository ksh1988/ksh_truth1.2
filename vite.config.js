import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/ksh_truth1.2/',
  plugins: [vue()],
  build: {
    target: 'es2018',
    cssCodeSplit: true,
  },
})

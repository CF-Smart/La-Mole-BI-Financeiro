import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Permite definir o base path via variável de ambiente no CI (ex.: "/repo/")
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

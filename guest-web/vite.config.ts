import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/astrology_forum_app/',
  server: {
    proxy: {
      '/api': {
        target: 'https://swasthi-life-backend.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

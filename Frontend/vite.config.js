import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/character': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/adjective': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/article': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auxiliary': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/noun': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/preposition': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/pronoun': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/specialability': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/verb': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/backcard': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});

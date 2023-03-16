import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@ide': path.resolve(__dirname, '/src'),
      '@': path.resolve(__dirname, '/src')
    }
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  }
});

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@ide': path.resolve(__dirname, '/src/ide'),
      '@': path.resolve(__dirname, '/src')
    }
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  }
});

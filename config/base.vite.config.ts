import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default {
  plugins: [react()],
  resolve: {
    alias: {
      '@ide': resolve(__dirname, '/src/ide'),
      '@': resolve(__dirname, '/src')
    }
  }
};

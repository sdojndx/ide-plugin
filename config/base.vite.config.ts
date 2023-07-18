import { resolve } from 'path';
export default {
  resolve: {
    alias: {
      '@ide': resolve(__dirname, '/src/ide'),
      '@': resolve(__dirname, '/src')
    }
  }
};

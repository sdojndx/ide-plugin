import baseConfig from './config/base.vite.config';
import testConfig from './config/test.vite.config';
import proConfig from './config/pro.vite.config';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return Object.assign(baseConfig, command === 'serve' ? testConfig : proConfig);
});

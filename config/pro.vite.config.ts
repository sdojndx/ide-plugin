import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default {
  build: {
    lib: {
      entry: resolve(__dirname, '../src/index.ts'),
      name: 'ide-plugin',
      fileName: 'ide-plugin'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react'],
      output: {
        dir: resolve(__dirname, '../dist'),
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: 'React'
        }
      }
    }
  },
  plugins: [
    react(),
    typescript({
      target: 'ESNext',
      rootDir: resolve(__dirname, '../src'),
      declaration: true,
      declarationDir: resolve(__dirname, '../dist'),
      include: [
        resolve(__dirname, '../src/index.ts'),
        resolve(__dirname, '../src/ide/**')
      ],
      allowSyntheticDefaultImports: true
    }),
    viteStaticCopy({
      targets: [{
        src: resolve(__dirname, '../src/ide/theme.less'),
        dest: resolve(__dirname, '../dist')
      }]
    })
  ]
};

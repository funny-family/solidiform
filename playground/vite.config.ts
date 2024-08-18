import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';
import solidPlugin from 'vite-plugin-solid';
import solidDevtools from 'solid-devtools/vite';
import url from 'node:url';
import tsconfig from './tsconfig.json';

var resolvePath = (p: string) => {
  return url.fileURLToPath(new URL(p, import.meta.url));
};

export default defineConfig({
  base: './',
  plugins: [
    inspect(),
    solidDevtools({
      autoname: true,
      locator: {
        targetIDE: 'vscode',
        componentLocation: true,
        jsxLocation: true,
      },
    }),
    // solidPlugin({
    //   // include: ['src/**/*', resolvePath('../lib/**/*')],
    //   include: ['./src/**/*'],
    //   extensions: ['js', 'jsx', 'ts', 'tsx'],
    // }),
    solidPlugin({
      // include: ['./src/*', resolvePath('../src/*')],
      // extensions: ['js', 'jsx', 'ts', 'tsx'],
    }),
  ],
  resolve: {
    alias: {
      '@src': resolvePath('./src/'),
      '@lib': resolvePath('../src/'),
    },
  },
  build: {
    target: tsconfig.compilerOptions.target,
  },
});

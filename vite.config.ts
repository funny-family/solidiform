import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import solidPlugin from 'vite-plugin-solid';
import url from 'node:url';
import pkg from './package.json';
import tsconfig from './tsconfig.json';

var resolvePath = (p: string) => {
  return url.fileURLToPath(new URL(p, import.meta.url));
};

export default defineConfig({
  publicDir: false,
  plugins: [
    dts({
      rollupTypes: true,
      outDir: resolvePath('./dist/types'),
    }),
    solidPlugin({
      include: 'lib/**/*',
      extensions: ['js', 'jsx', 'ts', 'tsx'],
    }),
  ],
  resolve: {
    alias: {
      '@src': resolvePath('./src/'),
    },
  },
  build: {
    target: tsconfig.compilerOptions.target,
    outDir: resolvePath('./dist'),
    cssCodeSplit: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies),
      output: {
        preserveModules: false,
        exports: 'named',
        globals: {
          'solid-js': 'solidJs',
        },
      },
    },
    emptyOutDir: false,
    copyPublicDir: false,
    lib: {
      name: pkg.name,
      entry: resolvePath('./lib/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') {
          return 'esm/index.js';
        }

        if (format === 'cjs') {
          return 'cjs/index.js';
        }

        return '';
      },
    },
  },
});

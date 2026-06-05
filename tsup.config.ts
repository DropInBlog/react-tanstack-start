import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-start',
      '@dropinblog/react-core',
    ],
  },
  {
    entry: ['cli/cli.ts'],
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    outDir: 'dist',
    bundle: true,
    platform: 'node',
  },
]);

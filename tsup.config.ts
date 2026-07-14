import { defineConfig } from 'tsup';
import pkg from './package.json';

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
    define: { __DIB_PACKAGE_VERSION__: JSON.stringify(pkg.version) },
  },
  {
    entry: ['cli/cli.ts'],
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    outDir: 'dist',
    bundle: true,
    platform: 'node',
    define: { __DIB_PACKAGE_VERSION__: JSON.stringify(pkg.version) },
  },
]);

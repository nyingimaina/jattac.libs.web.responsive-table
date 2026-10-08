const fs = require('fs');
const path = require('path');
const postcss = require('rollup-plugin-postcss');
const typescript = require('@rollup/plugin-typescript');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const del = require('rollup-plugin-delete');

const USE_CLIENT_BANNER = '"use client";';

const esmTypes = () => ({
  name: 'esm-types',
  writeBundle() {
    const cjsDeclaration = path.resolve(__dirname, 'dist/index.d.ts');
    const esmDeclaration = path.resolve(__dirname, 'dist/index.d.mts');
    if (!fs.existsSync(cjsDeclaration)) {
      return;
    }
    const source = fs.readFileSync(cjsDeclaration, 'utf8');
    const withExtensions = source.replace(
      /(from\s+['"])(\.[^'"]+)(['"])/g,
      (match, prefix, specifier, suffix) =>
        /\.(js|mjs|json|css)$/.test(specifier) ? match : `${prefix}${specifier}.js${suffix}`
    );
    fs.writeFileSync(esmDeclaration, withExtensions);
  },
});

module.exports = {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      banner: USE_CLIENT_BANNER,
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      banner: USE_CLIENT_BANNER,
    },
  ],
  plugins: [
    del({ targets: 'dist/*' }),
    peerDepsExternal(),
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
    }),
    commonjs(),
    postcss({
      modules: true,
      extract: false, // Inject CSS into the bundle
      minimize: true,
    }),
    esmTypes(),
  ],
};

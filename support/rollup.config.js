import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';


import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));


export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/markdown-it.js',
      format: 'umd',
      name: 'markdownit',
      plugins: [
        // Here terser is used only to force ascii output
        terser({
          mangle: false,
          compress: false,
          format: {
            comments: 'all',
            beautify: true,
            ascii_only: true,
            indent_level: 2
          }
        })
      ]
    },
/*    
    {
      file: 'dist/markdown-it.min.js',
      format: 'umd',
      name: 'markdownit',
      plugins: [
        terser({
          format: {
            ascii_only: true,
          }
        })
      ]
    }
*/    
    {
      file: 'dist/markdown-it.mjs',
      format: 'esm',
      name: 'markdownit',
      plugins: [
        // Here terser is used only to force ascii output
        terser({
          mangle: false,
          compress: false,
          format: {
            comments: 'all',
            beautify: true,
            ascii_only: true,
            indent_level: 2
          }
        }),
        replace({
          values: {
            'process.env.NODE_ENV': '"production"'
          }
        })
      ]
    }
  ],
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json({ namedExports: false }),
    nodePolyfills(),
    {
      banner() {
        return `/*! ${pkg.name} ${pkg.version} https://github.com/${pkg.repository} @license ${pkg.license} */`;
      }
    }
  ]
};

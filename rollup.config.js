import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

export default {
  input: 'index.js',
  output: {
    file: 'dist/markdown-it.mjs',
    format: 'esm'
  },
  plugins: [
    commonjs(),
    nodeResolve({
      preferBuiltins: false
    }),
    replace({
      values: {
        'process.env.NODE_ENV': '"production"'
      }
    }),
    json()
  ]
};

import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default {
  input: './support/demo_template/index.js',
  output: {
    file: 'demo/demo_template.mjs',
    format: 'esm'
  },
  plugins: [
    json(),
    nodeResolve({
      preferBuiltins: false
    }),
    commonjs()
  ]
};

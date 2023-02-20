import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import ignore from './rollup-plugins/ignore.js';
import { ignoreTextfieldFiles } from './elements/ignore/textfield';
import { ignoreSelectFiles } from './elements/ignore/select';
import { ignoreSwitchFiles } from './elements/ignore/switch';
import image from '@rollup/plugin-image'; //added

export default {
  input: ['src/charger-card.ts'],
  output: {
    dir: './dist',
    format: 'es',
    inlineDynamicImports: true,
  },
  plugins: [
    resolve(),
    typescript(),
    json(),
    babel({
      exclude: 'node_modules/**',
      // extensions: ['.js', '.svg', '.png'],   //img
    }),
    image(),    
    terser(),
    serve({
      contentBase: './dist',
      host: '0.0.0.0',
      port: 5000,
      allowCrossOrigin: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
    ignore({
      files: [...ignoreTextfieldFiles, ...ignoreSelectFiles, ...ignoreSwitchFiles].map((file) => require.resolve(file)),
    }),
  ],
};

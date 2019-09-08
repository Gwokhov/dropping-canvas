import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.js',
  output: {
    name: 'DroppingCanvas',
    format: 'umd',
    file: 'dist/dropping.js'
  },
  plugins: [
    commonjs(),
    babel({
      exclude: ['node_modules/**'],
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-transform-object-assign']
    }),
    terser()
  ]
}

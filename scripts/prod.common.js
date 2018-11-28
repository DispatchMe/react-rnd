import replace from 'rollup-plugin-replace';
import jsx from 'rollup-plugin-jsx';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.jsx',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    jsx( {factory: 'React.createElement'} ),
    replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  ],
  output: {
    sourcemap: true,
    exports: 'named',
    name: 'react-sortable-pane',
    globals: {
      react: 'React',
      '@dispatch/re-resizable': 'Resizable',
      'react-draggable': 'Draggable',
    },
  },
  external: ['react', '@dispatch/re-resizable', 'react-draggable'],
};

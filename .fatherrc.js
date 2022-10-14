import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import url from 'rollup-plugin-url';
export default {
  target: 'browser',
  entry: ['src/index.tsx', 'src/MswUi.tsx'],
  esm: 'rollup',
  runtimeHelpers: true,
  doc: {
    themeConfig: { mode: 'light' },
    base: '/',
    menu: [],
  },
  extractCSS: false,
  lessInRollupMode: {
    modifyVars: {},
    javascriptEnabled: true,
  },
  externalsExclude: ['mobx', 'mobx-react'],
  replace: {
    [`require('./MswUi').MswUi`]: `require('./MswUi.esm.js').MswUi`,
  },
  extraRollupPlugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
      },
    ],
    [
      'babel-plugin-file-loader',
      {
        name: '[hash].[ext]',
        extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
        context: '',
        limit: 30 * 1024,
      },
    ],
    [
      url({
        limit: 10 * 1024,
        emitFiles: true,
      }),
    ],
    [resolve(), commonjs()],
  ],
};

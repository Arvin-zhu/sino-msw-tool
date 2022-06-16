import url from 'rollup-plugin-url';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
export default {
    target: 'browser',
    entry: 'src/index.ts',
    esm: 'rollup',
    cjs: 'rollup',
    runtimeHelpers: true,
    doc: {
        themeConfig: { mode: 'light' },
        base: '/',
        menu: []
    },
    extractCSS: true,
    lessInRollupMode: {
        modifyVars: {},
        javascriptEnabled: true,
    },
    externalsExclude: ['mobx', 'mobx-react'],
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
                emitFiles: true
                })
        ],
        [
            resolve(),
            commonjs()
        ]
    ]
};

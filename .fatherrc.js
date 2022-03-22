export default {
    target: 'browser',
    entry: 'src/index.ts',
    esm: 'babel',
    cjs: 'babel',
    runtimeHelpers: true,
    autoprefixer: {
        browsers: ['ie>9', 'Safari >= 6'],
    },
    doc: {
        themeConfig: { mode: 'light' },
        base: '/',
        menu: []
    },
    extractCSS: true,
    lessInBabelMode: {
        modifyVars: {},
        javascriptEnabled: true,
    },
    extraBabelPlugins: [
        [
            '@babel/plugin-transform-runtime',
            {
                corejs: 3,
            },
        ],
        // [
        //     'babel-plugin-file-loader',
        //     {
        //         name: '[hash].[ext]',
        //         extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
        //         context: '',
        //         limit: 30 * 1024,
        //     },
        // ],
    ]
};

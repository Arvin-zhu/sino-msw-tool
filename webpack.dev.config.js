const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'); //检查ts类型

const isProduction = process.env.NODE_ENV === 'production';

module.exports = async function () {
return {
	target: 'web',
	mode: 'development',
	devtool: 'source-map',
	entry: './public/index.tsx',
	output: {
		clean: true,
		chunkFilename: '[contenthash]',
		filename: `main.js`,
		assetModuleFilename: 'images/[contenthash][ext][query]',
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '..'),
		},
		extensions: ['.ts', '.tsx', '.jsx', '.js', '.json', '...'],
	},
	module: {
		rules: [
			{
				test: /\.(svg|png|jpe?g|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(ttf|eot|woff|woff2)$/,
				type: 'asset/resource',
			},
			{
				test: /\.css$/i,
				use: [
					isProduction ? MinCssExtraPlugin.loader : 'style-loader',
					'css-loader',
					'postcss-loader',
				],
			},
			{
				test: /\.less$/i,
				use: [
					isProduction ? MinCssExtraPlugin.loader : 'style-loader',
					{
						loader: 'css-loader',
					},
					'postcss-loader',
					{
						loader: 'less-loader',
						options: {
							lessOptions: {
								javascriptEnabled: true,
								modifyVars: { primary: '#4460da' },
							},
						},
					},
				],
			},
			{
				test: /\.(js|ts)x?$/, // 支持ts, tsx
				use: [{
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						plugins: ["react-hot-loader/babel"]
					}
				}],
				exclude: /node_modules/,
			},
		],
	},

	devServer: {
		open: true,
		port: 8000,
		// https: {
		// 	key: fs.readFileSync(path.resolve(__dirname, './cert/meetgames.com+5-key.pem')),
		// 	cert: fs.readFileSync(path.resolve(__dirname, './cert/meetgames.com+5.pem')),
		// 	ca: fs.readFileSync(path.resolve(__dirname, './cert/meetgames.com+5.pem')),
		// },
		// host: 'local-business.meetgames.com',
		historyApiFallback: true,
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				RUN_ENV: `'${process.env.RUN_ENV}'`,
			},
		}),
		new HtmlWebpackPlugin({
			template: './public/index.html',
		}),
		new ForkTsCheckerWebpackPlugin(),
	],

}
};

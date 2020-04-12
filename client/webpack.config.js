//webpack.config.js
var webpack = require('webpack');
var path = require('path');
var BUILD_DIR = path.resolve(__dirname, 'src/frontend/public');
var APP_DIR = path.resolve(__dirname, 'src/frontend/app');
const srcPath = path.join(__dirname, 'src', 'frontend', 'app', 'index.jsx');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProductionEnvironment = process.env.NODE_ENV !== 'development';
const fileNameFormat =
    {
        JS: isProductionEnvironment ? '[name].[hash].js' : '[name].[hash].js',
        CSS: isProductionEnvironment ? 'styles.[chunkhash].css' : 'styles.[hash].css'
    };

var config = {
    entry: {
        app: srcPath
    },
    output: {
        path: BUILD_DIR,
        filename: 'js/bundle.js',
        publicPath: '/'
    },
    devServer: {
        historyApiFallback: true,
    },
    plugins: [
        new webpack.EnvironmentPlugin(['NODE_ENV']),
    ],
    module: {
        rules: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel-loader',
                query: {
                    presets: ["react", "es2015"],
                    plugins: [
                        'transform-object-rest-spread'
                    ]
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader" },
                    {loader: "sass-loader"}
                ]
            }
        ]
    }
};
if (process.env.NODE_ENV === 'development') {
    config.devtool = 'eval-sourcemap';
}
else {
    config.devtool = 'source-map';
}

module.exports = config;
//webpack.config.js
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
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
        https:{
            minVersion: 'TLSv1.1',
            key: fs.readFileSync(path.join(__dirname, './server.key')),
            cert: fs.readFileSync(path.join(__dirname, './server.crt')),
            passphrase: 'webpack-dev-server',
            requestCert: true,
        },
        proxy: {
            '/api': 'http://localhost:3000',
        },
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
                    presets: ["react", "es2015"]
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
//webpack.config.js
var webpack = require('webpack');
var path = require('path');
var BUILD_DIR = path.resolve(__dirname, 'src/frontend/public');
var APP_DIR = path.resolve(__dirname, 'src/frontend/app');
var config = {
    entry: APP_DIR + '/index.jsx',
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
                    presets: ["react", "es2015"]
                }
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
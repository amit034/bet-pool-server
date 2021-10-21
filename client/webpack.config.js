//webpack.config.js
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
const context = path.resolve(__dirname, 'src/frontend');
var BUILD_DIR = path.resolve(__dirname, 'src/frontend/public');
var APP_DIR = path.resolve(__dirname, 'src/frontend/app');
const srcPath = path.join(__dirname, 'src', 'frontend', 'app', 'index.jsx');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');

const isProductionEnvironment = process.env.NODE_ENV !== 'development';
const fileNameFormat =
    {
        JS: isProductionEnvironment ? '[name].[hash].js' : '[name].[hash].js',
        CSS: isProductionEnvironment ? 'styles.[chunkhash].css' : 'styles.[hash].css'
    };

const spritesmithPluginConfig = {
    src: {
        cwd: path.resolve(context, 'stylesheets/images'),
        glob: '*.png'
    },
    target: {
        image: path.resolve(__dirname, 'src/frontend/images/spritesmith-generated/sprite.png'),
        css: path.resolve(__dirname,  'src/frontend/stylesheets/spritesmith-generated/sprite.scss')
    },
    spritesmithOptions: {
        padding: 10
    },
    apiOptions: {
        cssImageRef: '../images/spritesmith-generated/sprite.png'
    }
};
var config = {
    context,
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
        new SpritesmithPlugin(spritesmithPluginConfig)
    ],
    module: {
        rules: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel-loader',
                query: {
                    presets: ["@babel/preset-env", "@babel/preset-react"],
                    plugins: [
                        '@babel/plugin-proposal-object-rest-spread',
                        '@babel/plugin-transform-async-to-generator'
                    ]
                }
            },
            {
                test: /svgLoader\.json$/,
                type: 'javascript/auto',
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'webfonts-loader'
                ]
            },
            {
                test: /\.(wav|mp3)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                    publicPath: 'sounds',
                }
            },
            {
                test: /\.svg/,
                use: 'svg-url-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader" },
                    {loader: "sass-loader"}
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            publicPath: 'img',
                            outputPath: 'img',
                            useRelativePath: true,
                            esModule: false,
                        }
                    },

                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65
                            }
                        }
                    }
                ]
            },
            // {
            //     test: /\.m?js$/,
            //     exclude: /node_modules/,
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             presets: [
            //                 ['@babel/preset-env', { targets: "defaults" }],
            //                 "@babel/preset-react"
            //             ]
            //         }
            //     }
            // }
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
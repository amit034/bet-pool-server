'use strict';

/* eslint no-console: 0 */
/* eslint global-require: 0 */


const gulp = require('gulp');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config');

gulp.task('webpack:build1', function (callback) {
    webpack(webpackConfig, function (err, stats) {
        let options = {
            colors: true
        };

        if (err || stats.hasErrors()) {
            console.log(stats.toString(options));
            process.exit(1);
        }

        if (stats.hasErrors()) {
            options = {
                colors: true,
                hash: false,
                version: false,
                timings: false,
                assets: false,
                chunks: false,
                chunkModules: false,
                modules: false,
                children: false,
                cached: false,
                reasons: false,
                source: false,
                errorDetails: true,
                chunkOrigins: false
            };
        }

        console.log(stats.toString(options));
        callback();
    });
});

gulp.task('webpack:build', function (callback) {
    const webpackBuildConf = Object.create(webpackConfig);
    webpackBuildConf.devtool = 'eval';
    //webpackBuildConf.debug = false;
    webpackBuildConf.context = __dirname;

    webpack(webpackBuildConf, function (err, stats) {
        let options = {
            colors: true
        };

        if (err || stats.hasErrors()) {
            console.log(stats.toString(options));
            process.exit(1);
        }

        if (stats.hasErrors()) {
            options = {
                colors: true,
                hash: false,
                version: false,
                timings: false,
                assets: false,
                chunks: false,
                chunkModules: false,
                modules: false,
                children: false,
                cached: false,
                reasons: false,
                source: false,
                errorDetails: true,
                chunkOrigins: false
            };
        }

        console.log(stats.toString(options));
        callback();
    });
});

gulp.task('webpack:dev-server', function () {
    new WebpackDevServer(webpack(webpackConfig),
        {
            proxy: {
                '**': `http://localhost:3000`
            },
            stats: {
                colors: true,
                hash: false,
                version: false,
                timings: false,
                assets: false,
                chunks: false,
                chunkModules: false,
                modules: false,
                children: false,
                cached: false,
                reasons: false,
                source: false,
                errorDetails: true,
                chunkOrigins: false
            }
        }
    ).listen(8080, 'localhost',
        function (err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            console.log('Please wait until webpack compilation is done...');
            // console.log(stats.toString({
            //     colors: true
            // }));
        });
});

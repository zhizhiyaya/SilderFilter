var webpack = require('webpack');
var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractCSS = new ExtractTextPlugin('/public/stylesheets/[name].css',{allChunks: true});
var extractLESS = new ExtractTextPlugin('/public/stylesheets/[name].less',{allChunks: true});

//console.log(path.resolve('./node_modules'));

module.exports = {
    //context: path,
    //插件项
    plugins: [extractCSS, extractLESS],

    //页面入口文件配置
    entry: {
        dragFilter: './public/scripts/dragFilter.js',
        //dragProgress: './module/dragProgress/index.js',
        //popBox: './module/popBox/index.js'
    },

    //入口文件输出配置
    output: {
        path: './dist/scripts/',
        filename: '[name].js'
    },
    module: {
    // 加载器配置
        loaders: [
            { test: /\.coffee$/, loader: "coffee-loader" },
            { test: /\.(coffee\.md|litcoffee)$/, loader: "coffee-loader?literate" }
        ]
    },
    resolve: {
        //root: path.resolve('./node_modules')
    },
    watch: true
};

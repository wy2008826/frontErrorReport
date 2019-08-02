const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HappyPack = require('happypack')
const webpack = require('webpack')
const { version } = require("./package.json");
const os = require('os')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');


/**
 * 打包优化
 * 1 使用 happypack  貌似没起到太大作用
 * 2 使用 ParallelUglifyPlugin 代替 ugilifyjs 打包时间更长了
 * 3 dll
 *
 *
 * **/


module.exports = (webpackConfig, env) => {
    //方便知道已经打包了多长时间
    const d=new Date();
    console.log(`build at : ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);


    const production = env === 'production'
    // FilenameHash
    webpackConfig.output.chunkFilename = '[name].[chunkhash].js'


    if (production) {
        // webpackConfig.plugins.splice(5,1);
        // console.log('plugins:',webpackConfig.plugins);

        // webpackConfig.plugins =

        let jsLoaderOptions = {};

        if (webpackConfig.module) {
            // ClassnameHash
            webpackConfig.module.rules.map((item) => {
                if (String(item.test) === '/\\.less$/' || String(item.test) === '/\\.css/') {
                    item.use.filter(iitem => iitem.loader === 'css')[0].options.localIdentName = '[hash:base64:5]'
                }
                // console.log('item:',item);
                if(item.loader === 'babel'){ //jsx
                    item.loader = 'happypack/loader?id=js';
                    jsLoaderOptions = item.options;
                    delete item.options;
                }
                return item
            })
        }
        webpackConfig.plugins.push(
            new webpack.LoaderOptionsPlugin({
                mangle:false,
                minimize: true,
                debug: false,
            })
        )





        webpackConfig.plugins.push(
            new HappyPack({
                id: 'js',
                // 如何处理 .js 文件，用法和 Loader 配置中一样
                loaders:[{
                    loader: 'babel-loader',
                    options:jsLoaderOptions,
                }],
                // 使用共享进程池中的子进程去处理任务
                threadPool: happyThreadPool,
            })
        )
        webpackConfig.plugins.push(
            new HappyPack({
                id: 'css',
                // 如何处理 .js 文件，用法和 Loader 配置中一样
                loaders: ['css-loader'],
                // 使用共享进程池中的子进程去处理任务
                threadPool: happyThreadPool,
            })
        )
    }

    const commonJS=[
        // '/vendors.js',
        'https://gw.alipayobjects.com/os/antv/pkg/_antv.g2-3.3.2/dist/g2.min.js',
        'https://gw.alipayobjects.com/os/antv/pkg/_antv.data-set-0.9.6/dist/data-set.min.js',
    ];

    //135编辑器需要用到的js
    const footerJS=[

    ];


    webpackConfig.plugins = webpackConfig.plugins.concat([
        new CopyWebpackPlugin([
            {
                from: 'src/public',
                to: production ? '../' : webpackConfig.output.outputPath,
            },
        ]),
        new HtmlWebpackPlugin({
            template: `${__dirname}/src/entry.ejs`,
            filename: production ? '../index.html' : 'index.html',
            minify: production ? {
                collapseWhitespace: true,
            } : null,
            hash: true,
            // headScripts: production ? null : ['/roadhog.dll.js'],
            headScripts: production ? commonJS : ['/roadhog.dll.js'].concat(commonJS),
            footerScripts:footerJS
        }),
    ])

    // Alias
    webpackConfig.resolve.alias = {
        components: `${__dirname}/src/components`,
        utils: `${__dirname}/src/utils`,
        config: `${__dirname}/src/utils/config`,
        enums: `${__dirname}/src/utils/enums`,
        services: `${__dirname}/src/services`,
        models: `${__dirname}/src/models`,
        routes: `${__dirname}/src/routes`,
        themes: `${__dirname}/src/themes`,
        commonModel: `${__dirname}/src/models`,
    }

    return webpackConfig
}

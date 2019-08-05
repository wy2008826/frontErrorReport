const path = require("path");
const { version } = require("./package.json");
const fs = require("fs");
const nunjucks = require("nunjucks");

const svgSpriteDirs = [
    path.resolve(__dirname, "src/svg/"),
    require.resolve("antd").replace(/index\.js$/, "")
];

export default {
    // entry: './src/index.js',
    entry: {
        vendors: "./src/vendor.js",
        app:'./src/index'
    },
    svgSpriteLoaderDirs: svgSpriteDirs,
    theme: "./theme.config.js",
    publicPath: `/${version}/`,
    outputPath: `./dist/${version}`,
    hot: true,
    // 接口代理
    proxy: {
        "/api": {
            //本地开发代理
            "target": "http://localhost:9001",//测试服务器
            secure: false,
            changeOrigin: true,
            // pathRewrite: { "^/api": "" }
        },
    },
    env: {
        development: {
            extraBabelPlugins: [
                "dva-hmr",
                "transform-runtime",
                [
                    "import",
                    {
                        libraryName: "antd",
                        style: true
                    }
                ]
            ]
        },
        production: {
            extraBabelPlugins: [
                "dva-hmr",
                "transform-runtime",
                [
                    "import",
                    {
                        libraryName: "antd",
                        style: true
                    }
                ]
            ]
        }
    },
    dllPlugin: {
        exclude: ["babel-runtime", "roadhog", "cross-env"],
        include: ["dva/router", "dva/saga", "dva/fetch"]
    }
};

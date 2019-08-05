let express = require("express");
let fs = require('fs');
let path = require('path');
let app = express();

const reportError = require('./serverEnd/routes/reportError');
const searchError =  require('./serverEnd/routes/searchError');



/**
 * 接收来自web端提交的错误的请求
 *
 * **/


//静态资源文件
app.use(express.static('dist', {
    dotfiles: 'ignore',
    etag: false,
    extensions: [ 'html','js','css','json'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now())
    }
}));



// 错误上报服务
app.use('/', reportError);

// 错误查询服务
app.use('/', searchError);



/**
 *
 * 错误上报
 * 数据埋点
 * 性能监控 =>  页面加载时长、
 * 用户画像
 * 手机型号、系统、版本号 userAgent
 * 用户行为分析
 * 页面到达率、停留时长 分析
 *
 *
 *
 * **/


/**
 * @params
 *
 * fileName 文件名称:String
 * lineNum  错误行号:Number
 * colNum   错误列号:Number
 * reportType 上报类型:String  {required true}
 *            【windowOnerror,vueConfigError,ajaxError】
 * hostname   域名  {required true}
 *
 * **/




console.log('server is running on port 9000');

app.listen(9001);

let express = require("express");
let fs = require('fs');
let path = require('path');
let http = require('http');
let SourceMap = require('source-map');
let app = express();

let {
    getYMSHMS,
    fullNum
} = require('./utils/index.js')


const {
    SourceMapConsumer,
    SourceNode
} = SourceMap;

/**
 * 接收来自web端提交的错误的请求
 *
 * **/

let errors = [];

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


app.get('/index', async function (req, response) {
    // console.log('req:',req.query,req.params);

    let {
        fileName,
        lineNum = 1,//行号
        colNum = 13560,//列号
        reportType,// windowOnerror vueConfigError ajaxError  等
        message,

        hostname,//环境 按照域名划分

        ...rest
    } = req.query;


    //请求本身的错误记录

    if (!reportType || !hostname) {// 需要记录不符合请求参数约定的信息

    }

    let pos = await reduceVueConfigError({
        fileName,
        lineNum,
        colNum,
        reportType,
        message,
        hostname
    });

    response.json({
        success: true,
        msg: '错误信息上报记录成功！',
        pos,

    });
    return false;



    // 接口 500
    //前端页面报错
    //


})




async function reduceVueConfigError({
                                        fileName = 'http://dev-m.gumingnc.com/order/chunk/39-39-30bfd55ebaab9248bfb7.js',
                                        lineNum,
                                        colNum,
                                        reportType='vueConfigError',
                                        message='',
                                        hostname='dev-m.gumingnc.com'
} = config) {

    return new Promise(function (resolve, reject) {
        let url = `${fileName}.map`//

        //
        http.get(url, function (res) {
            const { statusCode } = res;

            if(statusCode !== 200){//错误处理
                resolve({
                    message:`远程文件 ${url} 未找到或下载失败，请检查 webpack打包是否开启了sourcemap ！`
                });
            }

            let imgData = "";
            let contentLength = parseInt(res.headers['content-length']);
            //总长度
            res.setEncoding("binary");
            res.on("data", function (chunk) {
                imgData += chunk;
                // let process = ((imgData.length)/contentLength) * 100;
                // let percent = parseInt(((process).toFixed(0)));

            });

            res.on("end", async function () {

                SourceMapConsumer.with(imgData, null, async consumer => {
                    const pos = consumer.originalPositionFor({
                        line: lineNum * 1, //必须是纯数字类型
                        column: colNum * 1
                    });

                    let {
                        source,//源码 js文件路径
                        line,//源码行
                        column,// 源码列
                        name,//出错参数
                        ...rest
                    } = pos;


                    let sources = consumer.sources;// 压缩前的所有源文件列表
                    let smIndex = 0;// 根据查到的source，到源文件列表中查找索引位置
                    sources.map((item, i) => { //sources有重复的文件  取最后一个匹配的索引
                        if (item === source) {
                            smIndex = i
                        }
                    });

                    let smContent = consumer.sourcesContent[smIndex]; // 到源码列表中查到源代码
                    const rawLines = smContent.split(/\r?\n/g); // 将源代码串按"行结束标记"拆分为数组形式

                    console.log(rawLines[pos.line - 2],rawLines[pos.line - 1], rawLines[pos.line]); // 输出源码行，因为数组索引从0开始，故行数需要-1

                    let {
                        year,
                        month,
                        date,
                        hour,
                        minute,
                        second
                    } = getYMSHMS();


                    console.log('hostname:',hostname);
                    //生成环境和报错内容目录
                    let hostErrorTypeDir = `./${hostname}/${reportType}`
                    await makeDeepDir(hostErrorTypeDir);


                    let fileName = `${hostErrorTypeDir}/${year}${month<10? ('0'+month) : month}${date<10? ('0'+date) : date}.json`

                    fs.stat(fileName,async function (error,stat) {
                        if(error){
                            console.log('error');
                            await writeFile(fileName,{data:[],total:0})
                        }

                        let fileData = fs.readFileSync(fileName,'utf-8');
                        let arrData =JSON.parse(fileData ? fileData.toString():"{data:[],total:0}");

                        arrData.data.push({
                            createTime:`${year}/${fullNum(month)}/${fullNum(date)} ${fullNum(hour)}:${fullNum(minute)}:${fullNum(second)}`,
                            ...pos,
                            message,
                            source:(source||'').trim(),
                            originCode: (rawLines[pos.line - 1]||'').trim(),
                            hostname,
                        });

                        arrData.total+=1;
                        await writeFile(fileName,arrData)
                    });


                    resolve({
                            ...pos,
                            originCode: rawLines[pos.line - 1]
                        }
                    );

                });
            });

        })
    })
}


async function writeFile(file_name_with_url,data){
    return new Promise(function(resolve,reject){
        fs.writeFile(file_name_with_url,typeof data==='string' ? data : JSON.stringify(data,null,'\t'),"utf8",function(err,data){
            if(err){
                console.log(err);
                resolve(err);
            }else{
                console.log(`数据写入成功`);
                resolve(true);
            }
        });
    });
}

//生成多层路由
function makeDeepDir(dir,cb){

    return new Promise(async function(resolve,reject){
        let dirArr = dir.split('/');
        console.log('dirArr:',dirArr);
        for(let i=1;i<dirArr.length;i++){
            let dir = dirArr.slice(0,i+1).join('/');
            console.log('dir:',dir);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir)
            }
        }
        resolve(true)
    })

}



console.log('server is running on port 9000');

app.listen(9000);

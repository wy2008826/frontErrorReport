let express = require("express");
let router = express.Router();
let fs = require('fs');
let path = require('path');
let http = require('http');

let SourceMap = require('source-map');
const {
    SourceMapConsumer,
    SourceNode
} = SourceMap;


let {
    getYMSHMS,
    fullNum,
    getSystemAndVersion,
    writeFile,
    makeDeepDir
} = require('../utils/index.js')


/** 上报 vue类错误
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


router.get('/api/reportVueError', async function (req, response) {
    // console.log('req:',req.query,req.params);

    const {

    } = req.headers;

    let {
        fileName,
        lineNum = 1,//行号
        colNum = 13530,//列号
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
        hostname,
        userSystemInfo:{
            useragent:req.headers['user-agent'],
            ...getSystemAndVersion(req.headers['user-agent'] || '')
        },

    });

    if(pos.success){
        response.json({
            success: true,
            msg: '错误信息上报记录成功！',
            pos,
        });
    }else{
        response.json({
            success: false,
            msg: pos.message,
        });
    }
})




async function reduceVueConfigError({
                                        fileName = 'http://dev-m.gumingnc.com/order/chunk/40-40-9512e29e3c6e74c3eb88.js',
                                        lineNum,
                                        colNum,
                                        reportType='vueConfigError',
                                        message='',
                                        hostname='dev-m.gumingnc.com',
                                        ...rest
                                    } = config) {

    return new Promise(function (resolve, reject) {
        let url = `${fileName}.map`//

        //
        http.get(url, function (res) {
            const { statusCode } = res;


            if(statusCode !== 200){//错误处理
                resolve({
                    message:`远程文件 ${url} 未找到或下载失败，请检查 webpack打包是否开启了sourcemap ！`,
                    success:false
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

                    // console.log(rawLines[pos.line - 2],rawLines[pos.line - 1], rawLines[pos.line]); // 输出源码行，因为数组索引从0开始，故行数需要-1

                    let {
                        year,
                        month,
                        date,
                        hour,
                        minute,
                        second
                    } = getYMSHMS();


                    //生成环境和报错内容目录
                    let hostErrorTypeDir = path.resolve(__dirname,`../../dist/${hostname}/${reportType}`);

                    await makeDeepDir(hostErrorTypeDir);


                    let fileName = `${hostErrorTypeDir}/${year}${fullNum(month)}${fullNum(date)}.json`

                    fs.stat(fileName,async function (error,stat) {
                        if(error){
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
                            ...rest
                        });

                        arrData.total+=1;
                        await writeFile(fileName,arrData)
                    });


                    resolve({
                            ...pos,
                            originCode: rawLines[pos.line - 1],
                            success:true
                        }
                    );

                });
            });

        })
    })
}


module.exports = router;


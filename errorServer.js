
let express=require("express");
let fs = require('fs');
let path=require('path');
let http = require('http');
let SourceMap = require('source-map');
let app=express();

const {
    SourceMapConsumer,
    SourceNode
} = SourceMap;

/**
 * 接收来自web端提交的错误的请求
 *
 * **/
let errors =[];

app.get('/testErrorApi/reportError',function (req,res) {
    console.log('req.query:',req.query);

    const {
        lineno=1,
        colno=1,
    } = req.query;

    // 1 解析远程map文件
    let url = path.resolve(__dirname,'./dist/patrol/app.min.js.map');

    let fileData = fs.readFileSync(url,'utf-8');



    SourceMapConsumer.with(fileData, null, consumer => {
        const pos=  consumer.originalPositionFor({
            line: lineno * 1, //必须是纯数字类型
            column: colno *1
        });

        const {
            source,//源码 js文件路径
            line,//源码行
            column,// 源码列
            name,//出错参数
        } = pos;

        console.log(pos);
        let sources = consumer.sources;// 压缩前的所有源文件列表
        let smIndex = sources.indexOf(source); // 根据查到的source，到源文件列表中查找索引位置
        let smContent = consumer.sourcesContent[smIndex]; // 到源码列表中查到源代码
        const rawLines = smContent.split(/\r?\n/g); // 将源代码串按"行结束标记"拆分为数组形式



        console.log(rawLines[pos.line - 1],rawLines[pos.line],rawLines[pos.line + 1]); // 输出源码行，因为数组索引从0开始，故行数需要-1


        errors.push({pos,code:rawLines[pos.line - 1]})
        res.json({
            success:true,
            msg:'错误信息上报记录成功！',
            pos,
            originCode:rawLines[pos.line - 1]
        });
    });



});

app.get('/index',function (req,res) {
    let url = 'http://dev-m.gumingnc.com/order/chunk/39-39-30bfd55ebaab9248bfb7.js'// ?:1:13560

    let localurl = path.resolve(__dirname,'./package.json');
    // let fileData = fs.readFileSync(localurl,'utf-8');
    // console.log('fileData:',fileData,typeof fileData);


    http.get(url,function(res){
        let imgData = "";
        let contentLength = parseInt(res.headers['content-length']);
        //总长度
        res.setEncoding("utf-8");
        res.on("data", function(chunk){
            imgData+=chunk;
            let process = ((imgData.length)/contentLength) * 100;
            let percent = parseInt(((process).toFixed(0)));
            //任务栏进度条
            // console.log(percent);

        });
        res.on("end", function(){
            console.log('imgData:',typeof imgData);

                fs.writeFile('./test.js.map',imgData,{ 'flag': 'a' },(err)=>{
                    console.log(123);
                })

            SourceMapConsumer.with(imgData+'', null, consumer => {
                console.log('into');
                const pos=  consumer.originalPositionFor({
                    line: 1 * 1, //必须是纯数字类型
                    column: 13560 *1
                });

                const {
                    source,//源码 js文件路径
                    line,//源码行
                    column,// 源码列
                    name,//出错参数
                } = pos;

                console.log('pos:',pos);
                let sources = consumer.sources;// 压缩前的所有源文件列表
                let smIndex = sources.indexOf(source); // 根据查到的source，到源文件列表中查找索引位置
                let smContent = consumer.sourcesContent[smIndex]; // 到源码列表中查到源代码
                const rawLines = smContent.split(/\r?\n/g); // 将源代码串按"行结束标记"拆分为数组形式



                console.log(rawLines[pos.line - 1],rawLines[pos.line],rawLines[pos.line + 1]); // 输出源码行，因为数组索引从0开始，故行数需要-1


                errors.push({pos,code:rawLines[pos.line - 1]})
                res.json({
                    success:true,
                    msg:'错误信息上报记录成功！',
                    pos,
                    originCode:rawLines[pos.line - 1]
                });
            });
        });

    })


    res.json({
        errors
    });
})

console.log('server is running on port 9000');

app.listen(9000);

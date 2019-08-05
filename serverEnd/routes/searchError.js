let express = require("express");
let router = express.Router();
let fs = require('fs');
let path = require('path');

let {
    getYMSHMS,
    fullNum,
    getSystemAndVersion,
    writeFile
} = require('../utils/index.js')



router.post('/queryLatestError',async function(req,res){
    let data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', function () {
        data = JSON.parse(data);
        console.log('req.params:',req.params,req.query,data);
        res.json({
            data
        })
    });

});


router.get('/api/queryLatestError',async function(req,res){

    console.log('queryLatestError');

    /**
     * 项目
     * 时间
     * 错误类型
     * **/

    let url = path.resolve(__dirname,'../../dist/dev-m.gumingnc.com/vueConfigError/20190801.json')
    fs.stat(url,async function (error,stat) {
        if(error){
            res.json({
                result:[],
                code:1
            })
        }else{
            let fileData = fs.readFileSync(url,'utf-8');
            fileData = JSON.parse(fileData)
            res.json({
                result:fileData.data||[],
                total:fileData.total || 0,
                code:1
            })
        }
    });

});

module.exports = router;

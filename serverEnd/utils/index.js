

let getYMSHMS = require('./getYMDHMS.js')
let fullNum = require('./fullNum.js')
let sleep = require('./sleep.js')
let getSystemAndVersion = require('./getSystemAndVersion.js')
let writeFile = require('./writeFile.js')
let makeDeepDir = require('./makeDeepDir.js')


module.exports={
    getYMSHMS,
    fullNum,
    sleep,
    getSystemAndVersion,
    writeFile,//文件写入
    makeDeepDir,//生成多级目录
}

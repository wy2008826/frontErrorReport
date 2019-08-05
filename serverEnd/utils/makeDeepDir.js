let fs = require('fs');


//生成多层路由
module.exports = async function (dir,cb){
    return new Promise(async function(resolve,reject){
        let dirArr = dir.split('/');
        for(let i=1;i<dirArr.length;i++){
            let dir = dirArr.slice(0,i+1).join('/');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir)
            }
        }
        resolve(true)
    })
}


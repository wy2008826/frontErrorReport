let fs = require('fs');


module.exports = async function (file_name_with_url, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(file_name_with_url, typeof data === 'string' ? data : JSON.stringify(data, null, '\t'), "utf8", function (err, data) {
            if (err) {
                console.log(err);
                resolve(err);
            } else {
                console.log(`数据写入成功`);
                resolve(true);
            }
        });
    });
}


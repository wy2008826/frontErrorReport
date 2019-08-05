
module.exports=function (num) {
    return typeof num === 'number' ? (num<10?('0'+num):num ) : 0
};

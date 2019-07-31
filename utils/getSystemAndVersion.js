async function getSystemAndVersion(useragent){
    if((useragent.match(/iPhone/i) || useragent.match(/iPod/i))) {// ios系统
        // 判断系统版本号是否大于 4
        return Boolean(navigator.userAgent.match(/OS [5-9]_\d[_\d]* like Mac OS X/i));
    } else {
        return false;
    }
}

module.exports=getSystemAndVersion;

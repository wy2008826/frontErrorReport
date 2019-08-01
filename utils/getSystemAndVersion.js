function getSystemAndVersion(useragent){
    if((useragent.match(/iPhone/i) || useragent.match(/iPod/i))) {// ios系统
        // 判断系统版本号是否大于 4

        let version = '';
        let versionsMatch = useragent.match(/\d+(_\d+)+/ig)

        return {
            system:'ios',
            version:versionsMatch.length ? versionsMatch[0]:''
        }
    } else {

        let versionsMatch = useragent.match(/Android\s+\d+(\.\d+)+/ig)

        console.log('versionsMatch:',useragent,versionsMatch);
        return {
            system:'android',
            version:(versionsMatch && versionsMatch.length) ? versionsMatch[0] : ''
        }
    }
}

module.exports=getSystemAndVersion;

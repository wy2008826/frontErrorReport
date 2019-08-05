
module.exports=function(_time){
    let time=_time?new Date(_time):new Date();
    return {
        year:time.getFullYear(),
        month:time.getMonth()+1,
        date:time.getDate(),
        day:time.getDay(),
        hour:time.getHours(),
        minute:time.getMinutes(),
        second:time.getSeconds()
    }
}

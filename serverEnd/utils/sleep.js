async function sleep(time=0){
    return new Promise(function(resolve,reject){
        setTimeout(()=>{
            resolve(true);
        },time);
    });
}

module.exports=sleep;

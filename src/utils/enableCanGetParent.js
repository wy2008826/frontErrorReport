
const enableCanGetParent = (obj,parent=null) => {
    if(obj instanceof Array){
        (obj || []).map(_=>{
            enableCanGetParent(_,parent)
        })
    }else{
        Object.defineProperty(obj,'Parent',{
            configurable:true,
            enumerable:true,
            get:function () {
                return parent
            }
        });
        if(obj.children){
            (obj.children || []).map(_=>{
                enableCanGetParent(_,obj)
            })
        }
    }
}


export default enableCanGetParent;

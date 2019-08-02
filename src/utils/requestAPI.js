/* global window */
import request from './request'

export async function requestAPI(params){

    const {
        urlType={
            url:'',
            type:'post',
            allOut:false,//是否全部在外面控制数据
        },
        ...rest
    }=params;

    return request({
        url: urlType.url,
        method: (urlType.type || 'post').toLowerCase(),
        data: rest,
    },urlType.allOut?{allOut:urlType.allOut}:{})
}

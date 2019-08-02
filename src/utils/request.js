/* global window */
import axios from 'axios'
import lodash from 'lodash'
import {YQL, CORS} from './config'
import config from 'config'

import {
    message as Msg
} from 'antd';

const fetch = (options,headers) => {
    let {
        method = 'get',
        data,
        fetchType,
        url,
    } = options

    const cloneData = lodash.cloneDeep(data);

    //用户认证状态写入header
    axios.defaults.headers.common['authorization'] = headers.authorization;

    // console.log(options)
    switch (method.toLowerCase()) {
        case 'get':
            return axios.get(url, {
                params: cloneData,
            })
        case 'delete':
            return axios.delete(url, {
                data: cloneData,
            })
        case 'post':
            return axios.post(url, cloneData)
        case 'put':
            return axios.put(url, cloneData)
        case 'patch':
            return axios.patch(url, cloneData)
        default:
            return axios(options)
    }
}

const getPathName=()=>{
    const {
        hash='',//    #/login?a=123"
    }=window.location;

    const pathPame=(hash.split('?')[0]||'').replace(/\#/,'');

    return pathPame;
}


/** status 新的返回状态码
 *
 403:账号未登陆
 401:账号密码错误
 405:权限不足
 200:成功
 500:服务器错误
 406:请求错误（使用message）
 20：初始密码

**/


//下载文件
// const downloadFile=(data)=>{
//     let anchor=document.createElement('a');
//     let blob = new Blob([data],{type:'text/xlsx'});
//     let url = window.URL.createObjectURL(blob);
//     anchor.setAttribute('href', url);
//     anchor.setAttribute('download', '123.xlsx');
//     document.body.appendChild(anchor);
//     anchor.click();
//     window.URL.revokeObjectURL(url);//释放URL对象
//     document.body.removeChild(anchor);
// }


// 控制重复提交问题  待完善
let $$loading=function(){
    let ApiStatus=null;

    let Status = function(){
        if(!ApiStatus){
            ApiStatus = {
                utils:{

                }
            };
            ApiStatus.utils.setLoading = function(url,flag){
                if(!ApiStatus){
                    ApiStatus = {}
                }
                if(!ApiStatus[url]){
                    ApiStatus[url]={
                        loading:!!flag
                    }
                }

                ApiStatus[url]={
                    ...ApiStatus[url],
                    loading:!!flag
                }
            }
            ApiStatus.utils.isLoading = function(url){
                return ApiStatus && ApiStatus[url] && ApiStatus[url].loading
            }
        }

        return ApiStatus
    }

    return Status();

}();

if(!window.$$loading){
    window.$$loading = $$loading;
}


export default function request(options,reqConfig={}) {//下载文件
    //每一次请求需要带上该用户的认证信息在请求头上
    const authorization=window.localStorage.getItem('authorization')||'';

    window.$$loading.utils.setLoading(options.url,true);

    return fetch(options,{
        authorization
    }).then((response) => {

        const {statusText,headers} = response

        const {
            authorization=''
        }=headers;
        //设置用户的认证信息
        if(authorization){
            window.localStorage.setItem('authorization',authorization);
        }

        let data = response.data;

        //需要下载的文件
        // if(reqConfig && reqConfig.download){
        //     downloadFile(data);
        // }




        if (data instanceof Array) {//如果返回体是一个数组  转换为对象模式
            data = {
                list: data,
            }
        }
        const {
            status,
            success,//方便模拟数据的时候的
            code,
            message='',
        }=data;

        if(code ===1 ){//只有status=1才会把逻辑走到model中 model只需要处理code==1的情况 code=6只删除了一部分
            return Promise.resolve({
                success: true,
                message: statusText,
                statusCode: response.status,
                code:1,//业务代码是根据code状态码处理的 所以这里需要做一个转换
                ...data,
            })
        } else if(code === 403){//未登录 如果是不同的账户切换登录  会导致因为权限不同而导致登录之后进入了没有权限的页面
            window.localStorage.setItem('authorization','');

            setTimeout(()=>{
                if(config.openPages && config.openPages.indexOf(getPathName()) < 0){
                    window.location.href='/#/login?from='+getPathName()
                }
            },20);

            return Promise.resolve({
                success: false,
                code:3,//老版本是根据code=3是未登录状态
            });
        }else{//其他错误 执行catch 让dva的error函数自动处理
            throw({
                response,
                message
            });
        }
    }).catch((error) => {
        const {response} = error
        const {data, statusText} = response

        let msg
        let statusCode
        // 所有的数据跑出到业务逻辑中  包含了网络请求的错误状态  如果后台返回500   依然可以抛出到业务逻辑中
        // allOut 用于在外层控制重复提交
        if(reqConfig && reqConfig.allOut){
            Msg.error(data.message || statusText);
            return Promise.resolve({
                success: false,
                message:data.message || statusText,
                statusCode: response.status,
                code:-1,//业务代码是根据code状态码处理的 所以这里需要做一个转换
                ...data,
            })
        }

        if (response && response instanceof Object) {

            statusCode = response.status
            msg = data.message || statusText
        } else {
            statusCode = 600
            msg = error.message || '服务器开小差了....'
        }
        return Promise.reject({success: false, statusCode, message: msg})
    }).finally(()=>{
        const {
            url
        } = options;

        window.$$loading.utils.setLoading(options.url,false);
    })
}

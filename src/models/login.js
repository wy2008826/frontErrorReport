import {routerRedux} from 'dva/router'


// 接口相关
import { requestAPI } from 'utils/requestAPI';
import {
    BaoHuo_Login_URLS
} from 'utils/config'

const {
    userLogin,
} = BaoHuo_Login_URLS;

const {
    moment
} = window;


export default {
    namespace: 'login',

    state: {},

    effects: {
        * login({
                    payload,
                }, {put, call, select}) {

            // const {
            //     username='',
            //     password=''
            // }=payload
            //
            // const loginTokenData = yield call(getLoginToken, {userName:payload && payload.username||''})
            //
            // const {//0：系统内部错误；1：成功；2：外部错误；3：未登录
            //     code,
            //     message,
            //     result
            // }=loginTokenData
            //
            // if(code==1){//获取令牌成功
            //     const tokenPassInfo=Base64.encode(username+'-'+result+'-'+password)
            //
            //     const loginData = yield call(login, {tokenPassInfo})
            //     const {
            //         code,
            //         message
            //     }=loginData;
            //
            //     const {locationQuery} = yield select(_ => _.app)
            //
            //     if(code==1){//登录成功
            //         const {from} = locationQuery
            //         yield put({//更新用户的基本信息
            //             type:'app/setUser',
            //             payload:{
            //                 user:{
            //                     username,
            //                     lastLoginTime:moment(new Date).format('YYYY-MM-DD HH:mm:ss')
            //                 }
            //             }
            //         })
            //         yield put({type: 'app/query'});//登录进入首页之后的基本查询功能 菜单
            //
            //         //由于不同角色权限不同 登录之后统一跳转到home页面 避免角色没有redirect的权限的问题
            //         yield put(routerRedux.push('/home'));
            //
            //
            //         // if (from && from !== '/login') {
            //         //     yield put(routerRedux.push(from))
            //         // } else {
            //         //     yield put(routerRedux.push(from||'/'))
            //         // }
            //     }
            // }
            //
            //

            //新版登录接口
            const {
                account='',
                password=''
            }=payload

            const loginData = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:userLogin
                },
                ...payload
            });


            const {
                code,
                message
            }=loginData;

            const {locationQuery} = yield select(_ => _.app)

            if(code==1){//登录成功
                const {
                    from
                } = locationQuery
                yield put({//更新用户的基本信息
                    type:'app/setUser',
                    payload:{
                        user:{
                            username:account,
                            account,
                            lastLoginTime:moment(new Date).format('YYYY-MM-DD HH:mm:ss')
                        }
                    }
                })
                yield put({type: 'app/query'});//登录进入首页之后的基本查询功能 菜单

                //由于不同角色权限不同 登录之后统一跳转到home页面 避免角色没有redirect的权限的问题
                yield put(routerRedux.push('/home'));

            }

        },
    },
}

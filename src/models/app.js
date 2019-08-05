/* global window */
/* global document */
/* global location */
import {routerRedux} from 'dva/router'
import {parse} from 'qs'


import queryString from 'query-string'

// 接口相关
import {requestAPI} from 'utils/requestAPI';
import {
    prefix,
    BaoHuo_AppCommon_URLS
} from 'utils/config'


const {
} = BaoHuo_AppCommon_URLS;


const localStorageUser = JSON.parse(window.localStorage.getItem('user') || '{}')


export default {
    namespace: 'app',
    state: {
        user: localStorageUser || {
            username: '',
            role: '',//admin 等
            lastLoginTime: '',//最后登陆时间
        },
        // permissions: {
        //   // visit: ['1','2','3','4','5','51'],
        // },
        menu: [],
        menuPopoverVisible: false,
        activeMenuItem: null,//激活的菜单选项
        siderFold: window.localStorage.getItem(`${prefix}siderFold`) === 'true',
        darkTheme: window.localStorage.getItem(`${prefix}darkTheme`) === 'true',
        isNavbar: document.body.clientWidth < 769,
        navOpenKeys: JSON.parse(window.localStorage.getItem(`${prefix}navOpenKeys`)) || [],
        locationPathname: '',
        locationQuery: {},
    },
    subscriptions: {

        setupHistory({dispatch, history}) {//当页面路径发生改变需要改变menu的状态
            history.listen((location) => {
                const {
                    pathname,
                    search
                } = location;
                dispatch({
                    type: 'updateActiveMenu',
                    payload: {
                        locationPathname: pathname,
                        locationQuery: queryString.parse(search),
                    },
                })
            })
        },

        setup({dispatch}) {
            dispatch({type: 'query'})
            let tid
            window.onresize = () => {
                clearTimeout(tid)
                tid = setTimeout(() => {
                    dispatch({type: 'changeNavbar'})
                }, 300)
            }
        },
    },
    effects: {

        * query({payload,}, {call, put, select}) {
            // const {success, user} = yield call(query, payload)
            const {locationPathname} = yield select(_ => _.app)
            //处理menu数据  在这里组装成平层数据之后 在menu组件中生成对应的树状结构
            const menuPlainData = [
                {
                    "name": "错误统计",
                    "id": 1,
                    "icon": "bar-chart",
                    "menuCode": "001001",
                    "menuPcode": "001",
                    "route": "/onlineError"
                },
                // {
                //     "name": "页面访问率",
                //     "id": 2,
                //     "icon": "shop",
                //     "menuCode": "001002",
                //     "menuPcode": "001",
                //     "route": "/orders"
                // },
                // {
                //     "name": "数据埋点",
                //     "id": 3,
                //     "icon": "book",
                //     "menuCode": "001003",
                //     "menuPcode": "001",
                //     "route": "/orders"
                // },
                // {
                //     "name": "性能分析",
                //     "id": 4,
                //     "icon": "shop",
                //     "menuCode": "001004",
                //     "menuPcode": "001",
                //     "route": "/orders"
                // },
            ];

            yield put({
                type: 'updateState',
                payload: {
                    menu:menuPlainData,
                },
            });

        },

        * changeNavbar(action, {put, select}) {
            const {app} = yield (select(_ => _))
            const isNavbar = document.body.clientWidth < 769
            if (isNavbar !== app.isNavbar) {
                yield put({type: 'handleNavbar', payload: isNavbar})
            }
        },

        * getCreateOrderTypeSelects({payload,}, {call, put}) {//获取订单创建类型下拉框列表

            yield put({
                type: 'getSelects',
                payload: {
                    params: payload,
                    apiUrl: getCreateOrderTypeSelects,//请求地址
                    modelKey: 'CreateOrderTypeSelects',//model中存放在哪一个key上
                }
            });
        },
        * getSelects({payload}, {call, put}) {//通用的获取下拉框列表

            const {
                params,
                apiUrl,
                apiMethod = 'get',
                modelKey
            } = payload;

            const data = yield call(requestAPI, {
                urlType: {
                    type: apiMethod,
                    url: apiUrl
                },
                ...params
            });

            if (data.code == 1) {
                const {
                    result = []
                } = data;
                yield put({
                    type: 'updateState',
                    payload: {
                        [modelKey]: result
                    }
                })
            }
        }
    },
    reducers: {
        updateState(state, {payload}) {
            return {
                ...state,
                ...payload,
            }
        },
        setUser(state, {payload}) {//设置user数据
            window.localStorage.setItem('user', JSON.stringify(payload.user || {}))
            return {
                ...state,
                ...payload,
            }
        },
        updateActiveMenu(state, {payload}) {

            const {
                menu
            } = state;

            const actives = menu.filter((item, i) => {
                return item.route == payload.locationPathname
            })

            return {
                ...state,
                ...payload,
                activeMenuItem: actives[0] || null
            }
        },
        switchSider(state) {
            window.localStorage.setItem(`${prefix}siderFold`, !state.siderFold)
            return {
                ...state,
                siderFold: !state.siderFold,
            }
        },

        switchTheme(state) {
            window.localStorage.setItem(`${prefix}darkTheme`, !state.darkTheme)
            return {
                ...state,
                darkTheme: !state.darkTheme,
            }
        },

        switchMenuPopver(state) {
            return {
                ...state,
                menuPopoverVisible: !state.menuPopoverVisible,
            }
        },

        handleNavbar(state, {payload}) {
            return {
                ...state,
                isNavbar: payload,
            }
        },

        handleNavOpenKeys(state, {payload: navOpenKeys}) {
            return {
                ...state,
                ...navOpenKeys,
            }
        },
    },
}

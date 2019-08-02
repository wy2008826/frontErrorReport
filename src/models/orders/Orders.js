/* global window */
import modelExtend from 'dva-model-extend'
import {pageModel} from '../common'
import {message} from 'antd/lib/index'
import {parse} from "qs";




// 接口相关
import { requestAPI } from 'utils/requestAPI';
import {prefix,BaoHuo_AppCommon_URLS,BaoHuo_Orders_URLS} from 'utils/config'

const {
    getOrderStatusListSelect,//获取订单状态列表
} = BaoHuo_AppCommon_URLS;




export default modelExtend(pageModel, {
    namespace: 'Orders',

    state: {
        filter:{
            statusId:'',//模板类型
            flow:'',//订单状态

        },
        modalVisible: false,
        modalType: 'create',
        selectedRowKeys: [],
        selectedRows: [],
        activeRow: null,
        activeDetail: {},
    },

    subscriptions: {

    },

    effects: {
        * query({payload = {}}, {call, put,select}) {

            const {
                filter,
                pagination={}
            }=yield select(_=>_.Orders)

            const data = yield call(requestAPI,  {
                urlType:{
                    type:'post',
                    url:OrderList
                },
                page:pagination.current||1,
                pageSize:pagination.pageSize||10,
                client:false,//非C端
                ...filter,
                ...payload
            });

            if (data.code==1) {
                const {
                    result= [],
                    pagination = {
                        current: (payload.page || 1) * 1,
                        total: 0,
                        pageSize: (payload.pageSize || 10) * 1
                    }
                } = data
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list:result.map(val => {
                            val.key = val.id
                            val.deliveryTime = val.deliveryTime && val.deliveryTime.split(' ')[0]
                            return val
                        }),
                        pagination,
                    },
                });

                yield put({
                    type:'resetModel',
                })
            }
        },
    },
    reducers: {
        updateState(state, {payload}){//更新数据
            return {...state,...payload }
        }
    },
})

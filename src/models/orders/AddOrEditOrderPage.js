/* global window */
import modelExtend from 'dva-model-extend'
import {pageModel} from '../common'
import {message} from 'antd/lib/index'



// 接口相关
import { requestAPI } from 'utils/requestAPI';
import {prefix,BaoHuo_OrderTemplate_URLS} from 'utils/config'

const {
    OrderTemplateDetail,//订单模板详情
    OrderTemplateAdd,//订单模板添加
    queryGoodsCanUseInTemplate,//查找可用的商品列表
} = BaoHuo_OrderTemplate_URLS;


export default modelExtend(pageModel, {
    namespace: 'AddOrEditOrderPage',

    state: {
        modalVisible: false,
        isMotion: window.localStorage.getItem(`${prefix}userIsMotion`) === 'true',
        selectedRowKeys:[],
        selectedRows:[],//已选择的商品的列表
        detail: {},//详情
    },

    subscriptions: {

    },

    effects: {

        * orderTemplateDetail({payload = {}}, {call, put}) {//获取订单模板的详情
            const data = yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:OrderTemplateDetail
                },
                ...payload
            });

            if (data.success) {

                const {
                    result,
                } = data

                yield put({
                    type: 'updateState',
                    payload: {
                        detail:result,
                    },
                })
            } else {
                throw data
            }
        },
        * queryGoods({payload = {}}, {call, put}) {//根据仓库和路线查找可使用的商品列表
            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:queryGoodsCanUseInTemplate
                },
                ...payload
            });
            if (data.code==1) {
                const {
                    result = [],
                    pagination = {
                        current: (payload.page || 1) * 1,
                        total: 0,
                        pageSize: (payload.pageSize || 10) * 1
                    }
                } = data

                yield put({
                    type: 'querySuccess',
                    payload: {
                        list:result,
                        pagination,
                    },
                })
            }
        },
        * add({payload = {}}, {call, put}) {
            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:OrderTemplateAdd
                },
                ...payload
            });
            if (data.success) {
                message.success('添加成功')
                yield put({
                    type: 'updateState',
                    payload: {
                        modalVisible: false,
                    },
                })
            } else {
                // message.error('添加失败！')
                throw data
            }
        },
    },
    reducers: {
        updateState(state, {payload}){//更新数据
            return {...state,...payload }
        },
    },
})

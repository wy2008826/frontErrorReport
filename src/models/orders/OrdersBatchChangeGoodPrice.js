/*
  * list中的数据是原始数据  表单中的数据是修改后的表单域中的数据  提交成功之后把表单域中的更改同步到原始数据list中
  * 难点  1 切换左侧商品 提示修改过的结算价未保存
  *       2 提交之后 修改右侧商品的原始价格和结算价格  修改左侧商品的修改状态 （右侧所有商品均修改过结算价  左侧商品标识为已修改）
  *
  * */
import modelExtend from 'dva-model-extend'

import {pageModel} from '../common'
const qs = require('qs');
import {message} from 'antd/lib/index'
import {parse} from "qs";

// 接口相关
import { requestAPI } from 'utils/requestAPI';
import {BaoHuo_OrdersBatchChangePrice_URLS} from 'utils/config'

const {
    OrdersBatchChangePriceGetLeftGoods,
    OrdersBatchChangePriceGetSingleGoodShops,
    OrdersBatchChangePriceSubmit
} = BaoHuo_OrdersBatchChangePrice_URLS;

const createInitialState=()=>{
    return  {
        leftActiveGood:null,
        leftAllGoods:[],////左侧的所有商品列表
        list:[],
    };
}


export default modelExtend(pageModel, {
    namespace: 'OrdersBatchChangeGoodPrice',

    state: {
        orderIds:[],//批量改价的订单id集合
        locationParams:{},

        leftActiveGood:null,
        leftAllGoods:[],////左侧的所有商品列表

        changePriceModalVisible:false,//批量设置结算价的弹框显示状态
        confirmSubmitModalVisible:false,//提示当前商品的结算价保存弹框的显示状态

        forwardButNotActiveLeftGood:null,//即将切换的左侧商品
        ...createInitialState()
    },

    subscriptions: {
        setup ({ dispatch }) {//页面加载启动代码
            const orderIds =window.JSON.parse(window.localStorage.getItem('ordersBatchChangeGoodPrice-ids')||'[]') ;
            const locationQuery=window.location.href.split('?')

            const {
                page,
                pageSize,
                ...locationParams
            }=qs.parse(locationQuery[1]||'')


            // dispatch({
            //     type:'updateState',
            //     payload:{
            //         locationParams
            //     }
            // });

            dispatch({
                type:'setOrderIds',
                payload:{
                    orderIds
                }
            });
        },
    },

    effects: {
        * setOrderIds({payload = {}}, {call, put}) {//设置订单的Id集合

            const orderIds = payload.orderIds || []
            window.localStorage.setItem('ordersBatchChangeGoodPrice-ids',JSON.stringify(orderIds));

            yield put({
                type:'updateState',
                payload:{
                    orderIds
                }
            })
        },
        * clearOrderIds({payload = {}}, {call, put}) {//清空订单的Id集合
            window.localStorage.setItem('ordersBatchChangeGoodPrice-ids','[]');
            yield put({
                type:'updateState',
                payload:{
                    orderIds:[]
                }
            })
        },
        * getLeftGoods({payload = {}}, {call, put, select}) {//获取左侧的所有商品列表
            const locationParams=qs.parse(window.location.href.split('?')[1]);
            const {
                page,
                pageSize,
                ...queryParams,
            } = locationParams || {};


            const {
                leftActiveGood
            }=yield select(_=>_.OrdersBatchChangeGoodPrice)

            const data = yield call(requestAPI,  {
                urlType:{
                    type:'post',
                    url:OrdersBatchChangePriceGetLeftGoods
                },
                ...payload,
                ...queryParams
            });

            if(data.code==1){
                const {
                    result
                } = data;

                yield put({
                    type:'updateState',
                    payload:{
                        leftAllGoods:result || []
                    }
                });

                //默认加载第一条商品的右侧订单列表
                if(result.length){
                    yield put({
                        type:'getSingleGoodShops',
                        payload:{
                            productId:leftActiveGood?leftActiveGood.productId:result[0].productId
                        }
                    });

                    //找出新的激活态的左侧数据
                    const newActive = result.filter(item => leftActiveGood?item.productId==leftActiveGood.productId:false);

                    yield put({
                        type:'updateState',
                        payload:{
                            leftActiveGood:newActive.length?newActive[0]:result[0]
                        }
                    })
                }
            }
        },
        * getSingleGoodShops({payload = {}}, {call, put,select}) {//获取某一个商品下面的店铺列表

            const locationParams=qs.parse(window.location.href.split('?')[1]);
            const {
                page,
                pageSize,
                ...queryParams,
            } = locationParams || {};


            const {
                // pagination,
            }=yield select(_=>_.OrdersBatchChangeGoodPrice)

            const data = yield call(requestAPI,  {
                urlType:{
                    type:'post',
                    url:OrdersBatchChangePriceGetSingleGoodShops
                },
                // page:pagination.current||1,
                // pageSize:pagination.pageSize||10,
                isPage:false,
                ...payload,
                ...queryParams
            });

            if (data.code==1) {
                const {
                    result= [],
                    // pagination = {
                    //     current: (payload.page || 1) * 1,
                    //     total: data.pagination.total || 0,
                    //     pageSize: (payload.pageSize || 10) * 1
                    // }
                } = data

                yield put({
                    type: 'querySuccess',
                    payload: {
                        list:result,
                        // pagination,
                    },
                })
            }
        },
        * submitPage ({payload = {}}, {call, put,select}) {//提交已经修改过结算价的商品

            const {
                list,
                pagination,
                leftActiveGood
            }=yield select(_=>_.OrdersBatchChangeGoodPrice)

            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:OrdersBatchChangePriceSubmit
                },
                ...payload
            });

            if (data.code==1) {
                const {

                } = data;

                message.success('商品结算价修改成功！');

                yield put({
                    type:'updateState',
                    payload:{
                        confirmSubmitModalVisible:false
                    }
                });

                //重新请求数据  更新源数据  (如果数据依赖左侧列表  则更新本页全部数据 put getLeftGoods 否则只put getSingleGoodShops)
                yield put({
                    type:'getSingleGoodShops',
                    payload:{
                        productId:leftActiveGood.productId,
                        page:pagination.current
                    }
                });
            }
        },
        * resetModel({payload = {}}, {call, put}) {//初始化状态

            yield put({
                type:'updateState',
                payload:{
                    selectedRowKeys:[],
                    ...createInitialState()
                }
            })
        },
    },
    reducers: {
        updateState(state, {payload}){//更新数据
            return {...state,...payload }
        }
    },
});

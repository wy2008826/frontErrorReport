
import modelExtend from 'dva-model-extend'

import {
    pageModel,
} from '../common'

const {
    message
} = window.ANTD;

import {parse} from "qs";
const qs = require('qs');


// 接口相关
import { requestAPI } from 'utils/requestAPI';
import {
    BaoHuo_OrderCombine_URLS
} from 'utils/config'


const {
    detail,
    orderCombineCheckStock,
    orderSubmitCombine
} =BaoHuo_OrderCombine_URLS;


window.parse=parse;

const namespace = 'OrderCombine';

export default modelExtend(pageModel,{
    namespace,
    state: {
        mainOrder: null,//主订单
        detail:{
            orderList:[],//订单列表
            orderCartList:[],//订单中商品列表
        },
    },

    subscriptions: {

    },

    effects: {
        //查询订单详情  查询成功后自动进行库存检测   在点击下一条订单
        * detail({payload = {}}, {call, put}) {
            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:detail
                },
                ...payload
            });

            if (data.code==1) {
                const {
                    result = {}
                } = data

                //设置弹框选择商品的默认选中项

                yield put({
                    type: 'updateState',
                    payload: {
                        detail:result,
                        mainOrder:result.orderList && result.orderList[0]
                    },
                });
            }
        },

        * checkStock({payload = {}}, {call, put,select}) {//更新一条订单中的商品数据
            const {

            }=payload

            const data= yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:orderCombineCheckStock
                },
                ...payload
                // orderId:payload.ids
            });

            if (data.code==1) {
                const {
                    detail
                }=yield select(_=>_[namespace]);

                (detail.orderCartList||[]).map((product,i)=>{//库存数据回填到列表数据中
                    (data.result||[]).map((KC,j)=>{
                        const {
                            kucun=0,
                            id
                        }=KC;
                        if(id==product.productId){
                            product.kucun=kucun;
                            if(kucun<=0){//库存为0的显示为删除状态
                                product.delete=true;
                            }
                        }
                    })
                });

                yield put({
                    type:'updateState',
                    payload:{
                        detail
                    }
                })
            }
        },
        * submitCombine({payload = {}}, {call, put,select}) {//
            const {

            }=payload

            const {
                $$loading
            } =yield select(_=>_[namespace]);

            //防止重复提交
            if($$loading.utils.isLoading(orderSubmitCombine)){
                message.warn('订单合并中提交中，请勿重复提交！');
                return ;
            }

            const data= yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:orderSubmitCombine
                },
                ...payload
            });

            if (data.code==1) {
                const {

                }=yield select(_=>_[namespace]);

                message.success('订单合并成功！');
                setTimeout(()=>{
                    window.location.href = '/#/orders'
                },1500)

            }
        },
    },
    reducers: {

    },
})

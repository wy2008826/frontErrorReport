/* global window */
import modelExtend from 'dva-model-extend'

import {
    pageModel,
    COMMON_MODAL_getDeliveryDateByTagline,//调用某条路线可用的送货日期
} from '../common'
import {message} from 'antd/lib/index'
import {parse} from "qs";
const qs = require('qs');
import queryString from 'query-string';


// 接口相关
import { requestAPI } from 'utils/requestAPI';
import {
    prefix,
    BaoHuo_OrderTemplate_URLS,
    BaoHuo_OrderDetail_URLS
} from 'utils/config'

const {
    queryGoodsCanUseInTemplate,//查找可用的商品列表
} = BaoHuo_OrderTemplate_URLS;


const {
    orderDetailView,//订单信息详情
    orderDeleteGood,//删除订单中的某个商品
    orderRevokeGood,//撤销订单中某个删除的商品
    orderUpdateGood,//编辑订单中的某个商品
    orderCheckStock,//订单库存核对
    orderCheckAudit,//订单审核
    orderNextOrder,//上一条订单  nextOrder
    orderPrevOrder,//下一条订单
    orderQueryGoodsCanUse,//查询可用的商品
    OrderAddGoods,//订单中新增商品

    OrderSplit, // 订单拆分
    orderBackToNotChecked,//将已经审核的订单撤回至未审核状态
    modifyOrderDeliveryTypeAndDate,
} =BaoHuo_OrderDetail_URLS;


window.parse=parse;



export default modelExtend(pageModel,COMMON_MODAL_getDeliveryDateByTagline(), {
    namespace: 'OrderDetail',

    state: {
        isFirstOrder:false,//经过点击之后 是否是第一条订单
        isLastOrder:false,//是否是最后一条订单
        modalVisible: false,
        addGoodModalVisible:false,//
        selectedRowKeys:[],
        activeRow: null,
        backToNotCheckedModalVisible:false,//退回至待审核状态的弹框的展示状态

        detail:{

        },
        isCheckingStock:false,//正在监测库存中
        isAuditOrdering:false,//是否正在审核订单中
        getFilterParams(){
            const {
                common='',
                lineId='',
                wareHouseId='',
                flow,
                statusId='',
                deliveryStartTime='',
                deliveryEndTime
            }=qs.parse(window.location.href.split('?')[1]);

            const newHashs={//新订单的详情的hash参数
                common,
                lineId,
                wareHouseId,
                statusId,
                flow,
                deliveryStartTime,
                deliveryEndTime
            };

            return newHashs;
        }
    },

    subscriptions: {

    },

    effects: {
        //查询订单详情  查询成功后自动进行库存检测   在点击下一条订单
        * detail({payload = {}}, {call, put}) {
            const data = yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:orderDetailView
                },
                ...payload
            });


            if (data.code==1) {
                const {
                    result = {}
                } = data

                //设置弹框选择商品的默认选中项

                const selectedRowKeys=[];
                result.orderCartList = result.orderCartList && result.orderCartList.map((good,i)=>{
                    selectedRowKeys.push(good.productId);
                    good.key = good.id
                    good.deliveryTableTime = ''
                    return good
                });

                result.orderHistoryList = result.orderHistoryList && result.orderHistoryList.map((good,i)=>{
                    good.key = good.id
                    return good
                });

                //是否已经审核过 针对同一个订单审核按钮只能点击一次 在审核的时候做控制
                result.hasAuthOnce=false;

                yield put({
                    type: 'updateState',
                    payload: {
                        detail:result,
                        selectedRowKeys
                    },
                });

                if(result.flow<2){//订单在未审核之前才可以检测库存
                    // 自动检测库存
                    yield put({
                        type:'checkStock',
                        payload:{
                            orderId:result.id,
                            isAuto:true
                        }
                    });

                    //查询当前路线的可用送货日期
                    yield put({
                        type:'COMMON_getDeliveryDateByTagline',
                        payload:{
                            lineId:result.lineId
                        }
                    });
                }
            }
        },
        * deleteGood({payload = {}}, {call, put,select}) {//删除某条订单中的商品数据
            const {
                id
            }=payload
            const data = yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:orderDeleteGood
                },
                ...payload
            });

            if (data.code==1) {
                const {
                    result = {}
                } = data
                message.success('删除成功！');

                const {
                    detail
                }=yield select(_=>_.OrderDetail);

                (detail.orderCartList||[]).map((good,i)=>{
                    if(good.id==id){
                        good.delete=true;
                        // detail.orderCartList.splice(i,1)
                    }
                });

                yield put({
                    type: 'updateState',
                    payload: {
                        detail,
                    },
                })
            }
        },
        * addGood({payload = {}}, {call, put,select}) {//添加商品
            // const {
            //     selectedGoods,// 手动添加的商品   包含了商品数量
            // }=payload;
            //
            // const {
            //     list,//弹框中的商品
            //     selectedRowKeys,//选中的商品列表
            //     detail
            // }=yield select(_=>_.OrderDetail);
            //
            //
            //
            // const orderTemplateVoListIds= (detail.orderCartList||[]).map((detailGoodItem)=>{
            //     return detailGoodItem.productId;
            // })
            //
            // const ids=[]; //手动添加的商品ID组
            // const goods=[];
            //
            // selectedRowKeys.map((selectId,i)=>{//收集新增商品id序列
            //     if(orderTemplateVoListIds.indexOf(selectId)<0){//选中了订单详情列表中没有的商品
            //         list.map((listItem,j)=>{
            //             if(listItem.id==selectId){
            //                 ids.push(selectId);
            //             }
            //         })
            //     }
            // });
            //
            // const data = yield call(addGood, {
            //     productIdList:ids,
            //     orderId:detail.id
            // });
            //
            //
            // if(data.code==1){
            //
            //     selectedRowKeys.map((selectId,i)=>{//把添加上的商品加入详情列表中
            //         if(orderTemplateVoListIds.indexOf(selectId)<0){//选中了订单详情列表中没有的商品
            //             (data.result||[]).map((listItem,j)=>{
            //                 if(listItem.productId==selectId){
            //                     goods.push(listItem);//直接把返回的商品添加到列表中
            //                 }
            //             })
            //         }
            //     });
            //
            //     detail.orderCartList=detail.orderCartList.concat(goods);
            //
            //     yield put({
            //         type:'updateState',
            //         payload:{
            //             addGoodModalVisible:false,//关闭弹框
            //             detail,//详情
            //         }
            //     })
            // }



            const {
                selectedGoods,// 手动添加的商品   包含了商品数量
            }=payload;

            const {
                detail
            }=yield select(_=>_.OrderDetail);


            const submitGoods=[]; //手动添加的商品ID组

            log(selectedGoods)
            selectedGoods.map(({id,pid,productNum,...otherKeys},i)=>{//收集新增商品
                submitGoods.push({
                    proSpecId: id,
                    productId: pid,
                    orderId:detail.id,
                    amount:productNum
                });
            });

            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:OrderAddGoods
                },
                orderCartAddDtoList:submitGoods,
                orderId:detail.id
            });


            const goods=[];//添加成功的商品列表
            if(data.code==1){
                ( (data.result && data.result.orderCartList )||[]).map((listItem,j)=>{
                    goods.push(listItem);//直接把返回的商品添加到列表中
                });

                detail.orderCartList=detail.orderCartList.concat(goods);


                if(!detail.orderHistoryList){
                    detail.orderHistoryList=[];
                }

                detail.orderHistoryList.unshift(data.result.orderHistory);

                yield put({
                    type:'updateState',
                    payload:{
                        addGoodModalVisible:false,//关闭弹框
                        detail,//详情
                    }
                })
            }

        },
        * revokeGood({payload = {}}, {call, put,select}) {//撤销商品删除
            const {
                id
            }=payload

            const data = yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:orderRevokeGood
                },
                ...payload
            });

            if (data.code==1) {
                const {
                    result = {}
                } = data
                message.success('撤销商品成功！');

                const {
                    detail
                }=yield select(_=>_.OrderDetail);

                (detail.orderCartList||[]).map((good,i)=>{
                    if(good.id==id){
                        good.delete=false;
                    }
                });

                yield put({
                    type: 'updateState',
                    payload: {
                        detail,
                    },
                })
            }
        },
        * queryGoods({payload = {}}, {call, put}) {
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
        * update({payload = {}}, {call, put,select}) {//更新一条订单中的商品数据
            const {
                id,
                productId,
                amount,
                proSpecId
            }=payload

            console.log('payload:',payload);
            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:orderUpdateGood
                },
                ...payload
            });


            if (data.code==1) {
                message.success('修改成功');
                const {
                    detail
                }=yield select(_=>_.OrderDetail);

                //更新商品数量
                (detail.orderCartList||[]).map((good,i)=>{
                    if(good.proSpecId==proSpecId){
                        detail.orderCartList[i].finalProductNum=amount
                    }
                });

                //更新订单总价和操作历史记录
                if(data.result){
                    detail.totalPrice=data.result.totalPrice;
                    if(!detail.orderHistoryList){
                        detail.orderHistoryList=[];
                    }
                    detail.orderHistoryList.unshift(data.result.orderHistory);
                }

                yield put({
                    type: 'updateState',
                    payload: {
                        detail,
                        modalVisible: false,
                        activeRow: null
                    },
                });
            }
        },
        * backToNotChecked({payload = {}}, {call, put,select}) {//订单撤回功能
            const {

            }=payload

            const data= yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:orderBackToNotChecked
                },
                ...payload
            });

            if (data.code==1) {
                const {
                    getFilterParams,
                    detail
                }=yield select(_=>_.OrderDetail);

                const newHashs={//新的订单参数
                    ...getFilterParams(),
                    flow:1,
                    time:new Date()*1
                };

                //获取到审核后订单新状态   进行页面刷新
                const hash=window.location.hash;
                const href=hash.split("?")[0];

                // window.location.replace(`/${href}?${queryString.stringify(newHashs)}`);

                window.location.href='#/orders';

            }
        },
        * checkStock({payload = {}}, {call, put,select}) {//更新一条订单中的商品数据
            const data= yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:orderCheckStock
                },
                orderId:payload.orderId
            });

            if (data.code==1) {
                const {
                    detail
                }=yield select(_=>_.OrderDetail);

                (detail.orderCartList||[]).map((product,i)=>{//库存数据回填到列表数据中
                    (data.result||[]).map((KC,j)=>{
                        const {
                            kucun=0,
                            id,
                            gid
                        }=KC;
                        if(gid==product.productCode){
                            product.kucun=kucun;
                            if(kucun<=0 && product.sellMode!=1){//库存为0的显示为删除状态 预售的不是主动删除的不做删除标记
                                product.delete=true;
                            }
                        }
                    })
                });

                // 库存不足的商品
                let kucunNotReach = []
                if (detail.orderCartList) {
                    for (let i = detail.orderCartList.length - 1; i > -1; i--) {
                        const item = detail.orderCartList[i]
                        if ((item.finalProductNum - (item.kucun || 0)) >= 0 && item.kucun != undefined) {
                            kucunNotReach = kucunNotReach.concat(detail.orderCartList.splice(i, 1))
                        }
                    }
                    detail.orderCartList = kucunNotReach.concat(detail.orderCartList)
                }

                if(!payload.isAuto){//如果是手动点击的检测库存  需要单独提示
                    message.success('库存检测成功！')
                }
            }
        },
        * orderAudit({payload = {}}, {call, put,select}) {//订单审核

            const {
                filter,
                getFilterParams,
                detail,
                isAuditOrdering
            }=yield select(_=>_.OrderDetail);

            const {

            }=payload

            if(detail.hasAuthOnce){//该订单已经审核过一次
                message.warn('该订单已审核过，请勿重复审核！');
                return;
            }

            if(detail.cloudStatus && detail.cloudStatus==1){//该订单已提交至金蝶异步审单
                message.warn('订单审核传输中,请勿重复审单！');
                return;
            }


            //防止重复审核
            if(isAuditOrdering){
                message.warn('订单审核处理中.....');
                return;
            }


            //检测库存
            const checkStockData= yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:orderCheckStock,

                },
                orderId:payload.orderId
            });

            if (checkStockData.code==1) {

                (detail.orderCartList||[]).map((product,i)=>{//库存数据回填到列表数据中
                    (checkStockData.result||[]).map((KC,j)=>{
                        const {
                            kucun=0,
                            productId
                        }=KC;
                        if(productId==product.productId){
                            product.kucun=kucun
                        }
                    })
                })
            }




            yield put({
                type:'updateState',
                payload:{
                    isAuditOrdering:true
                }
            });
            //订单审核
            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:orderCheckAudit,
                    allOut:true,//包含返回错误的情况  为了控制重复提交的问题
                },
                ...payload
            });

            detail.hasAuthOnce =true;//已审核标记
            yield put({
                type:'updateState',
                payload:{
                    isAuditOrdering:false,
                    detail
                }
            });

            if (data.code==1) {//审核成功之后 接着审核下一条的订单
                // const {
                //     orderId,
                //     flow
                // }=data.result||{};//下一条订单的信息  如果是审核的最后一条  该信息为空 null

                const orderId=data.result;//下一条订单的信息  如果是审核的最后一条  该信息为空 null

                message.success('订单审核成功！' || data.message);

                const {

                    detail
                }=yield select(_=>_.OrderDetail);


                // detail.statusMapVo={//订单状态
                //     id:3,
                //     name:'已审核'
                // };
                detail.flow=1;
                detail.flowName='已审核';

                yield put({
                    type: 'updateState',
                    payload: {
                        detail,
                    },
                });

                if(data.result){//说明是下一条数据

                    const newHashs={//新订单的详情的hash参数
                        ...getFilterParams(),
                        orderId,
                        // flow,
                        time:new Date()*1
                    };

                    //获取到审核后订单新状态   进行页面刷新
                    const hash=window.location.hash;
                    const href=hash.split("?")[0];

                    window.location.replace(`/${href}?${queryString.stringify(newHashs)}`);

                    yield put({
                        type: 'detail',
                        payload: {
                            orderId,
                            // status
                        },
                    });

                }else{
                    message.success('当前查询条件下的订单审核完毕！');
                    setTimeout(()=>{
                        window.location.href=`/#/orders`;
                    },2000)
                }
            }
        },
        * nextOrder({payload = {}}, {call, put,select}) {//下一条订单

            const {
                getFilterParams,
                filter,
                detail
            }=yield select(_=>_.OrderDetail);

            const {
                forward,//1 下一条  -1 上一条
                ...params
            }=payload


            // const data = yield call(forward==1?nextOrder:prevOrder, params);
            const data = yield call(requestAPI,{
                urlType:{
                    type:'post',
                    url:forward==1?orderNextOrder:orderPrevOrder
                },
                ...params
            });


            if (data.code==1) {//审核成功之后 接着审核下一条的订单
                if(data.result){//不是最后一条
                    yield put({
                        type: 'updateState',
                        payload: {
                            detail:data.result,
                            isLastOrder:false,
                            isFirstOrder:false
                        },
                    });

                    const newHashs={//下一条订单的状态
                        ...getFilterParams(),
                        orderId:data.result.id,
                        flow:data.result.flow,
                        time:new Date()*1
                    };

                    //获取到审核后订单新状态   进行页面刷新
                    const hash=window.location.hash;
                    const href=hash.split("?")[0];

                    window.location.replace(`/${href}?${queryString.stringify(newHashs)}`);

                    //下一条订单进行库存检测
                    if(data.result.flow<2){
                        yield put({
                            type:'checkStock',
                            payload:{
                                orderId :data.result.id,
                                isAuto:true
                            }
                        });
                    }

                }else{
                    message.warn(`已经是${forward==1?'最后':'第'}一条了！`);

                    yield put({
                        type:'updateState',
                        payload:{
                            isLastOrder:forward==1,
                            isFirstOrder:forward==-1
                        }
                    })
                }
            }
        },
        * modifyOrder({payload = {}, callback}, {call}) {
            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:modifyOrderDeliveryTypeAndDate
                },
                ...payload
            });

            if (data.code==1) {
                const {
                    result ,
                } = data

                message.success('修改成功!')
                callback && callback(false)
            }
        },
        *orderSplit({payload = {}}, {call, put}) { // 拆单
            const data = yield call(requestAPI, {
                urlType:{
                    type: 'post',
                    url: OrderSplit
                },
                ...payload
            })

            const { code } = data

            if (code === 1) {
                yield put({
                    type: 'detail',
                    payload: {
                        orderId: payload.orderId
                    }
                })
            }
        }
    },
    reducers: {
        showModal(state, {payload}) {
            return {...state, ...payload, modalVisible: true}
        },

        hideModal(state, {payload}) {
            return {...state, ...payload, modalVisible: false, activeRow: null}
        },
        updateState(state, {payload}){//更新数据
            return {...state,...payload }
        }
    },
})

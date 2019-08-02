/* global window */
import modelExtend from 'dva-model-extend'


import {pageModel} from '../common'
import {message} from 'antd/lib/index'
import {parse} from "qs";


window.parse=parse;



// 接口相关
import { requestAPI } from 'utils/requestAPI';
import {
    prefix,
    BaoHuo_AppCommon_URLS,
    BaoHuo_OrderTemplate_URLS,
    BaoHuo_DeliveryLineConfig_URLS,
    BaoHuo_OrderAdd_URLS,
    BaoHuo_DeliveryLine_URLS,
    BaoHuo_Shop_URLS
} from 'utils/config'


const {
    getWareHouses,//获取所有的仓库列表
    getSingleWareHouseTagLines,
}= BaoHuo_AppCommon_URLS;


const {
    OrderTemplateDetail,//订单模板详情
    queryGoodsCanUseInTemplate,//查找可用的商品列表
} = BaoHuo_OrderTemplate_URLS;


//从路线规划的地方获取路线下面对应的店铺列表
const {
    deliveryLinesConfigGetShops
} = BaoHuo_DeliveryLineConfig_URLS;

//查询店铺列表
const {
    shopsLists
} = BaoHuo_Shop_URLS;


const {
    OrderAddGoods,
    orderAddGetTemplateByTagLine,
    orderAddGetDeliveryDateByTagline,
    orderAddCreateOrders
} = BaoHuo_OrderAdd_URLS;


const {
    deliveryLineDetail,//送货路线详情
} = BaoHuo_DeliveryLine_URLS;


export default modelExtend(pageModel, {
    namespace: 'OrderAdd',

    state: {
        current:0,//当前步骤

        //step0下面的数据
        wareHousesTrees:{},//仓库列表 仓库列表下对应的路线列表   路线下对应的店铺列表
        wareHouseId:'',//当前选中的仓库id
        tagLineId:'',//当前选中的路线id
        shopModalVisible:false,//路线下面的店铺选择弹框
        shopLists:[],//弹框中的店铺列表
        shopPagination:{},//弹框中店铺分页信息
        selectedShopRowKeys:[],//选中的店铺key
        selectedShopRows:[],//已经选中的列表中的店铺

        //step1下面的数据
        templateTrees:{lists:[{name:'ces',id:122}]},//
        deliveryDates:[{time:'2008',id:1}],//送货日期可选列表
        template:null,//订单模板
        deliveryDate:null,//送货日期

        //step2 用到的prop数据
        templateGoods:[],//模板下面对应的商品列表
        templateGoodsSelectsKeys:[],//订单模板中选中的商品key
        selectGoodsModalVisible:false,//新增商品弹框弹出状态

        selectGoodsList:[],//选择商品弹框里面的商品列表
        selectGoodsPagination:{},//选择商品弹框里面的分页信息
        selectGoodsBySelf:[],//自己在弹框中勾选的商品列表

        activeLineDetail:{},//已选择的路线的送货方式

        modalVisible: false,
        addGoodModalVisible:false,//
        selectedRowKeys:[],
        activeRow: null,
        detail:{

        },
        selectShopType:1,//默认多店选择模式

        selectTemplateModalVisible:false,//订单模板弹框的显示状态

        isSubmintingOrder:false,//是否正在提交订单
    },

    subscriptions: {

    },
    effects: {
        * initWareHouseAndFirstTagline({payload = {}}, {call, put,select}) {//串行化获取数据
            const data = yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:getWareHouses
                },
                ...payload
            });


            const {
                wareHouseId,

            }=yield select(_=>_.OrderAdd);


            if (data.code==1) {
                const {
                    result = [],
                    pagination = {
                        current: (payload.page || 1) * 1,
                        total: 0,
                        pageSize: (payload.pageSize || 10) * 1
                    }
                } = data

                //把仓库转化为树状结构
                const wareHousesTrees={};
                wareHousesTrees.lists=result;
                result.map((house,i)=>{
                    wareHousesTrees[house.id]=house;
                });

                const wareId=wareHouseId?wareHouseId:result[0].id;
                yield put({
                    type: 'updateState',
                    payload: {
                        wareHousesTrees,
                        wareHouseId:wareId
                    },
                });

                yield put({//获取当前选中仓库下面的对应路线
                    type:'getSingleLines',
                    payload:{
                        wareHouseIdList:[wareId]
                    }
                });
            }
        },
        * getSingleLines({payload = {}}, {call, put,select}){//获取单条仓库下的路线列表
            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:getSingleWareHouseTagLines
                },
                ...payload
            });

            const {
                wareHouseId,
                tagLineId,
                wareHousesTrees,
            }=yield select(_=>_.OrderAdd);

            if (data.code==1) {
                const {
                    result = [],
                } = data

                //把路线转化为树状结构 并存入对应的路线下
                const tagLines={};
                tagLines.lists=result;
                result.map((line,i)=>{
                    tagLines[line.id]=line;
                });

                wareHousesTrees[wareHouseId].tagLines=tagLines;
                yield put({
                    type: 'updateState',
                    payload: {
                        tagLineId:tagLineId?tagLineId:result[0].id,
                        wareHousesTrees,
                    },
                })
            }
        },
        * searchShopByTagline({payload = {}}, {call, put,select}){//获取单条仓库下的路线列表
            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:shopsLists
                },
                ...payload
            });


            const {
                wareHousesTrees,
            }=yield select(_=>_.OrderAdd);


            if (data.code==1) {
                const {
                    pagination={},
                    result = [],
                } = data

                yield put({
                    type: 'updateState',
                    payload: {
                        shopLists:result,
                        shopPagination:{
                            ...pagination||{}
                        }
                    },
                })
            }
        },
        * getTemplateByTagLine({payload = {}}, {call, put,select}){//获取路线下的模板列表
            const data = yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:orderAddGetTemplateByTagLine
                },
                ...payload
            });


            const {

            }=yield select(_=>_.OrderAdd);


            if (data.code==1) {
                const {
                    result = [],
                } = data

                //串行化模板列表
                const templateTrees={};
                templateTrees.lists=result;
                result.map((temp,i)=>{
                    templateTrees[temp.id]=temp;
                });


                yield put({
                    type: 'updateState',
                    payload: {
                        templateTrees
                    },
                });
            }
        },
        * getDeliveryDateByTagline({payload = {}}, {call, put,select}){//获取路线对应的送货日期
            const data = yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:orderAddGetDeliveryDateByTagline
                },
                ...payload
            });

            const {

            }=yield select(_=>_.OrderAdd);


            if (data.code==1) {
                const {
                    result = [],
                } = data

                yield put({
                    type: 'updateState',
                    payload: {
                        deliveryDates:result||[]
                    },
                });
            }
        },
        * getDeliveryTypeByTagline({payload = {}}, {call, put,select}){//获取路线详情
            const data = yield call(requestAPI,  {
                urlType:{
                    type:'get',
                    url:deliveryLineDetail
                },
                ...payload
            });

            if (data.code==1) {
                const {
                    result = {},
                } = data

                yield put({
                    type: 'updateState',
                    payload: {
                        activeLineDetail:result,
                        tagLineId:result.id,
                        wareHouseId:result.wareHouseVoList?result.wareHouseVoList[0].id:''

                    },
                });
            }
        },
        * getTemplateGoodsLists({payload = {}}, {call, put,select}){//根据模板查询模板中的商品列表 由于这里是加载商品  所以需要合并老数据
            const data = yield call(requestAPI,  {
                urlType:{
                    type:'get',
                    url:OrderTemplateDetail
                },
                ...payload
            });


            const {
                templateGoods
            }=yield select(_=>_.OrderAdd);


            if (data.code==1) {
                const {
                    result = [],
                } = data;

                (result.recommendCartExpandList||[]).map((resultGood,i)=>{
                    const {
                        name,
                        productId,
                        productNum,
                        code
                    }=resultGood;
                    const temHasGood = (templateGoods||[]).filter((temGood,j)=>{return temGood.code+'' == code+''});
                    if(!temHasGood.length){//已选择的商品列表中不包含该商品 添加进去
                        templateGoods.push(resultGood)
                    }else{// 包含  替换已包含的商品的数量
                        temHasGood[0].productNum=productNum
                    }
                });

                yield put({
                    type: 'updateState',
                    payload: {
                        templateGoods,
                        // templateGoods:result.recommendCartExpandList||[],
                        selectTemplateModalVisible:false
                    },
                });
            }
        },
        * addGood({payload = {}}, {call, put,select}) {//添加商品
            const {

            }=payload;

            const {
                list,
                selectedRowKeys,//选中的商品列表
                detail
            }=yield select(_=>_.OrderAdd);


            const orderTemplateVoListIds= (detail.orderTemplateVoList||[]).map((detailGoodItem)=>{
                return detailGoodItem.productId;
            })

            const ids=[];
            const goods=[];

            selectedRowKeys.map((selectId,i)=>{//收集新增商品id序列
                if(orderTemplateVoListIds.indexOf(selectId)<0){//选中了订单详情列表中没有的商品
                    list.map((listItem,j)=>{
                        if(listItem.id==selectId){
                            ids.push(selectId);
                        }
                    })
                }
            });

            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:OrderAddGoods
                },
                productIdList:ids,
                orderId:detail.id
            });


            if(data.code==1){

                selectedRowKeys.map((selectId,i)=>{//把添加上的商品加入详情列表中
                    if(orderTemplateVoListIds.indexOf(selectId)<0){//选中了订单详情列表中没有的商品
                        (data.result||[]).map((listItem,j)=>{
                            if(listItem.productId==selectId){
                                goods.push(listItem)
                            }
                        })
                    }
                });

                detail.orderTemplateVoList=detail.orderTemplateVoList.concat(goods);

                yield put({
                    type:'updateState',
                    payload:{
                        addGoodModalVisible:false,//关闭弹框
                        detail,//详情
                    }
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
                let {
                    result = [],
                    pagination = {
                        current: (payload.page || 1) * 1,
                        total: 0,
                        pageSize: (payload.pageSize || 10) * 1
                    }
                } = data;

                (result || []).map((item,i)=>{
                    item.productId=item.id+'';
                    item.id=item.id+''
                });

                yield put({
                    type: 'updateState',
                    payload: {
                        selectGoodsList:result,
                        selectGoodsPagination:pagination,
                    },
                })
            }
        },
        * createOrders({payload = {}}, {call, put,select}) {//生成订单

            const {
                filter,
                detail,
                isSubmintingOrder,
                current
            }=yield select(_=>_.OrderAdd);

            if(isSubmintingOrder){
                message.warn('订单提交中');
                return ;
            }
            const {

            }=payload

            yield put({
                type: 'updateState',
                payload: {
                    isSubmintingOrder:true
                },
            });

            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url:orderAddCreateOrders
                },
                ...payload
            },{
                allOut:true,
            });


            yield put({
                type: 'updateState',
                payload: {
                    isSubmintingOrder:false
                },
            });

            if (data.code==1) {
                yield put({
                    type: 'updateState',
                    payload: {
                        current:current+1
                    },
                })
            }
        },
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

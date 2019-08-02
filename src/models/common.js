import modelExtend from 'dva-model-extend'
import {
    BaoHuoComponentApi,
    BaoHuo_OrderAdd_URLS
} from 'utils/config';


import { requestAPI } from 'utils/requestAPI';

const {

}= BaoHuoComponentApi;


const Common_State_prefix = 'COMMON_STATE_';

const model = {
    state:{
        Common_State_prefix
    },
    reducers: {
        updateState(state, {payload}) {
            return {
                ...state,
                ...payload,
            }
        },
    },
}

const pageModel = modelExtend(model, {
    state: {
        list: [],
        pagination: {
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
            current: 1,
            total: 0,
            pageSizeOptions:['10','20','40','50','100'],//每页可选择的条数
        },
        $$loading:window.$$loading
    },
    effects:{
        * query({payload}, {call, put,select}) {

            const {
                namespace,
                url,
                ...rest
            } = payload;


            const {
                pagination={}
            }=yield select(_=>_[namespace]);

            const data = yield call(requestAPI, {
                urlType:{
                    type:'post',
                    url
                },
                page:pagination.current||1,
                pageSize:pagination.pageSize||10,
                ...rest
            });

            if (data.code==1) {
                const {
                    code,
                    result=[],
                    pagination= {
                        current: (payload.page || 1) * 1,
                        total: 0,
                        pageSize: (payload.pageSize || 10) * 1
                    }
                }=data

                yield put({
                    type: 'querySuccess',
                    payload: {
                        list:result,
                        pagination,
                    },
                });
            }
        },
        *getNameSpace({payload = {}}, {call, put}) {//根据仓库和路线查找可使用的商品列表

        },
    },
    reducers: {
        querySuccess(state, {payload}) {
            const {list, pagination} = payload
            return {
                ...state,
                list,
                pagination: {
                    ...state.pagination,
                    ...pagination,
                },
                //查询列表之后  清空掉所有已经选中的数据行
                // selectedRowKeys: [],
                // selectedRows: [],
            }
        },
        resetState(state, {payload}) {
            return {
                ...state,
                ...payload,
            }
        },
    },
});





//获取某条路线可用的送货日期  之所以写成函数的方式是为了方便和外面的调用者进行交互 但是并不建议可以和外面进行交互



module.exports = {
    model,
    pageModel,
}

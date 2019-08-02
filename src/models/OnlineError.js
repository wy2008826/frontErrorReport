/* global window */
import modelExtend from 'dva-model-extend'

import {pageModel} from './common'

const moment =window.moment;


// 接口相关
import { requestAPI } from 'utils/requestAPI';
import {
    BaoHuo_OnlineError_URLS
} from 'utils/config'

const {
    queryLatestError,//查询最新的错误列表

} = BaoHuo_OnlineError_URLS;


export default modelExtend(pageModel, {
    namespace: 'OnlineError',
    state: {

    },

    subscriptions: {

    },

    effects: { //getSurrenderTimeSelect

        * getLatestError({payload = {}}, {call, put}) {//获取送货时间的下拉框列表
            const data = yield call(requestAPI, {
                urlType:{
                    type:'get',
                    url:queryLatestError
                },
                ...payload
            });

            const {
                list,
                code
            }=data;
            if (code === 1) {
                const {
                    result = []
                } = data

                yield put({
                    type: 'updateState',
                    payload: {
                        list:result,
                    },
                });
            }
        },
    },
    reducers: {

    },
})

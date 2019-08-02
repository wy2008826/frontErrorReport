const qs = require('qs')
const Mock = require('mockjs')
const config = require('../utils/config')

const {apiPrefix, api} = config


let usersListData = Mock.mock({
    'data|4-24': [
        {
            id: '@id',
            productName: '@name',
            amount:/\d{1,2}/,
            phone: /^1[34578]\d{9}$/,
            webhook: '@name',
            create_time: '@datetime',
            update_time: '@datetime',
        },
    ],
})


let database = usersListData.data


module.exports = {
    //商品列表 增删改查
    [`POST ${api.orderDetailView}`](req, res) {
        const {query} = req
        let {pageSize, page} = query

        pageSize = (pageSize || 10) * 1
        page = (page || 1) * 1


        res.json({
            success: true,
            code:1,
            message: 'Ok',
            result: {
                orderTemplateVoList:database.slice((page - 1) * pageSize, page * pageSize),
            },
            pagination: {
                current: page,
                pageSize,
                total: database.length
            }
        })
    },
    [`POST ${api.orderDeleteGood}`](req, res) {
        res.json({
            success: true,
            code:1,
            message: 'Ok',
        })
    },
    [`POST ${api.orderUpdateGood}`](req, res) {
        res.json({
            success: true,
            code:1,
            message: 'Ok',
        })
    },
    [`POST ${api.orderCheckStock}`](req, res) {
        res.json({
            success: true,
            code:1,
            message: 'Ok',
        })
    },
    [`POST ${api.orderCheckAudit}`](req, res) {
        res.json({
            success: true,
            code:1,
            message: 'Ok',
        })
    },
    [`POST ${api.orderQueryGoodsCanUse}`](req, res) {
        res.json({
            success: true,
            code:1,
            result:database,
            message: 'Ok',
        })
    },
}

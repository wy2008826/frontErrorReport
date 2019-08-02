const qs = require('qs')
const Mock = require('mockjs')
const config = require('../utils/config')

const {apiPrefix, api} = config

let usersListData = Mock.mock({
    'data|4-24': [
        {
            id: '@id',
            name: '@name',
            nickName: '@last',
            phone: /^1[34578]\d{9}$/,
            webhook: '@name',
            create_time: '@datetime',
            update_time: '@datetime',
        },
    ],
})


let database = usersListData.data


module.exports = {
    //店铺等级
    [`GET ${api.shopLevels}`](req, res) {
        const {query} = req
        let {pageSize, page} = query

        pageSize = (pageSize || 10) * 1
        page = (page || 1) * 1


        res.json({
            success: true,
            message: 'Ok',
            list: database.slice((page - 1) * pageSize, page * pageSize),
            pagination: {
                current: page,
                pageSize,
                total: database.length
            }
        })
    },
    [`GET ${api.shopLevelDetail}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: 'Ok',
            detail: {
                name: 'test',
                webhook: 'http://32412424'
            }
        })
    },
    [`GET ${api.shopLevelAdd}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: '新增成功',
        })
    },
    [`GET ${api.shopLevelDelete}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: '删除成功',
        })
    },

    //店铺列表
    [`GET ${api.shopsLists}`](req, res) {
        const {query} = req
        let {pageSize, page} = query

        pageSize = (pageSize || 10) * 1
        page = (page || 1) * 1


        res.json({
            success: true,
            message: 'Ok',
            list: database.slice((page - 1) * pageSize, page * pageSize),
            pagination: {
                current: page,
                pageSize,
                total: database.length
            }
        })
    },
    [`GET ${api.shopDetail}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: 'Ok',
            detail: {
                name: 'test',
                webhook: 'http://32412424'
            }
        })
    },
    [`GET ${api.shopAdd}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: '新增成功',
        })
    },
    [`GET ${api.shopDelete}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: '删除成功',
        })
    },
}

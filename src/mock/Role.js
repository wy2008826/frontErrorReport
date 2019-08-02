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

    [`POST ${api.RoleList}`](req, res) {
        const {query} = req
        let {pageSize, page} = query

        pageSize = (pageSize || 10) * 1
        page = (page || 1) * 1


        res.json({
            success: true,
            code:1,
            message: 'Ok',
            list: database.slice((page - 1) * pageSize, page * pageSize),
            pagination: {
                current: page,
                pageSize,
                total: database.length
            }
        })
    },
    [`POST ${api.RoleDetail}`](req, res) {
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
    [`POST ${api.RoleAdd}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: '新增成功',
        })
    },
    [`POST ${api.RoleUpdate}`](req, res) {
        const {query} = req
        res.json({
            success: true,
            message: '更新成功',
        })
    },
    [`POST ${api.RoleDelete}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: '删除成功',
        })
    },
}

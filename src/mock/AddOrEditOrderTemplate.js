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

const itemsData = Mock.mock({//商品列表
    'data|10-24': [
        {
            amount:0,
            oo:99999,
            product:{
                id: '@id',
                name: '@name',
                price:'42.12',
                gid:'010321',
                limit:'10000',
                sid:'10002',
                spec:'38斤每箱',
                step:'@integer(2, 10)',
                stock:'@integer(60, 100)',
                unit:'箱'
            }
        },
    ],
})

const itemsbase=itemsData.data



module.exports = {

    [`POST ${api.OrderTemplateDetail}`](req, res) {
        const {query,body} = req
        let {id} = body

        res.json({
            success: true,
            message: 'Ok',
            result:{
                created_time:new Date()*1,
                ftype:3,
                id,
                is_valid:true,
                name:'营业报货',
                items:itemsbase,
                tag_lines:[],
                tag_warehouse:[],
                // database.slice((page - 1) * pageSize, page * pageSize),
            }
        })
    },

    [`POST ${api.OrderTemplateAdd}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            message: '新增成功',
        })
    },
}

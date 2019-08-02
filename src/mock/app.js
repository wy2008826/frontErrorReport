const qs = require('qs')
const Mock = require('mockjs')
const config = require('../utils/config')

const {apiPrefix, api} = config

let wareHouses = Mock.mock({//公有的api  用于调取仓库列表
    'data|4-5': [
        {
            id: '@id',
            name: '@city',
            nickName: '@last',
            phone: /^1[34578]\d{9}$/,
            webhook: '@name',
            create_time: '@datetime',
            update_time: '@datetime',
        },
    ],
})


let database = wareHouses.data


let GoodsClassifySelect = Mock.mock({//公有的api  用于调取仓库列表
    'data|4-5': [
        {
            id: '@id',
            name: '@pick(["鲜果类","茶饮类","奶类","茶类"])',
            nickName: '@last',
            phone: /^1[34578]\d{9}$/,
            webhook: '@name',
            create_time: '@datetime',
            update_time: '@datetime',
        },
    ],
})


let dataGoodsClassify = GoodsClassifySelect.data



let dataShopLevelsSelect = Mock.mock({//公有的api  用于调取仓库列表
    'data|4-5': [
        {
            id: '@id',
            name: '@pick(["一级","二级","三级","筹备","关闭"])',
            nickName: '@last',
            phone: /^1[34578]\d{9}$/,
            webhook: '@name',
            create_time: '@datetime',
            update_time: '@datetime',
        },
    ],
})


let dataShopLevels = dataShopLevelsSelect.data


let tagLineSelects =function(wareHouse){
    const picks=[`${wareHouse}1号`,`${wareHouse}2号`,`${wareHouse}3号`,`${wareHouse}4号`,]

    let tagLineSelectData=Mock.mock({//公有的api  用于调取单个仓库下面的路线列表
        'data|4-5': [
            {
                id: '@id',
                name: '@pick('+JSON.stringify(picks)+')',
                nickName: '@last',
                phone: /^1[34578]\d{9}$/,
                webhook: '@name',
                create_time: '@datetime',
                update_time: '@datetime',
            },
        ],
    })

    return tagLineSelectData.data
}





module.exports = {

    [`POST ${api.getWareHouses}`](req, res) {
        const {query} = req
        let {pageSize, page} = query

        pageSize = (pageSize || 10) * 1
        page = (page || 1) * 1


        res.json({
            success: true,
            message: 'Ok',
            code:1,
            result: database.slice((page - 1) * pageSize, page * pageSize),
            pagination: {
                current: page,
                pageSize,
                total: database.length
            }
        })
    },
    [`POST ${api.getGoodsClassifySelect}`](req, res) {
        const {query} = req
        let {pageSize, page} = query

        pageSize = (pageSize || 10) * 1
        page = (page || 1) * 1


        res.json({
            success: true,
            message: 'Ok',
            code:1,
            result: dataGoodsClassify.slice((page - 1) * pageSize, page * pageSize),
            pagination: {
                current: page,
                pageSize,
                total: dataGoodsClassify.length
            }
        })
    },
    [`POST ${api.getShopLevelsSelect}`](req, res) {
        const {query} = req
        let {pageSize, page} = query

        pageSize = (pageSize || 10) * 1
        page = (page || 1) * 1


        res.json({
            success: true,
            message: 'Ok',
            code:1,
            result: dataShopLevels.slice((page - 1) * pageSize, page * pageSize),
            pagination: {
                current: page,
                pageSize,
                total: dataShopLevels.length
            }
        })
    },
    [`POST ${api.getSingleWareHouseTagLines}`](req, res) {
        const {query,body} = req
        let {pageSize, page,wareHouse='大溪'} = body

        pageSize = (pageSize || 10) * 1
        page = (page || 1) * 1

        res.json({
            success: true,
            message: 'Ok',
            wareHouse,
            code:1,
            result: tagLineSelects(wareHouse),
            pagination: {
                current: page,
                pageSize,
                total: tagLineSelects(wareHouse).length
            }
        })
    },
}

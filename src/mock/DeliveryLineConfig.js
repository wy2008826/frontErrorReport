const qs = require('qs')
const Mock = require('mockjs')
const config = require('../utils/config')

const {apiPrefix, api} = config

let usersListData = Mock.mock({
    'data|4-24': [
        {
            id: '@id',
            name: '@name',
            create_time: '@datetime',
            update_time: '@datetime',
        },
    ],
})


let database = usersListData.data



let linesListData = Mock.mock({
    'data|4-24': [
        {
            id: '@id',
            pathId: '@id',
            name: '@name',
            tagLineName:'@name',
            tagwareHouseId: '@id',
            create_time: '@datetime',
            update_time: '@datetime',
            "count|1-100": 100
        },
    ],
})


let databaseLine = linesListData.data



const getDatabaseShops=(query={})=>{
    let shopsListData = Mock.mock({
        'data|4-24': [
            {
                tagwareHouseName:'@name',
                tagwareHouseId: '@id',
                date:'@date',
                status:2,
                id: '@id',
                name: '@name',
                address:'@county(true)',
                shopId:'@id',
                pathId:'@id',
                phone:'@phone',
                create_time: '@datetime',
                update_time: '@datetime',
                "lng|115-125.1-6": 1,
                "lat|22-28.3-10": 1,
            },
        ],
    })
    let databaseShops=shopsListData.data
    return databaseShops;
}


module.exports = {
    [`POST ${api.deliveryLinesConfigGetLines}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            code:1,
            message: 'Ok',
            result:databaseLine
        })
    },
    [`POST ${api.deliveryLinesConfigGetShops}`](req, res) {
        const {query,params} = req
        res.json({
            success: true,
            code:1,
            message: 'Ok',
            result:getDatabaseShops(params),
        })
    },
    [`POST ${api.deliveryLinesConfigSearchShopsGlobal}`](req, res) {
        const {query} = req
        res.json({
            success: true,
            code:1,
            message: 'Ok',
            result:getDatabaseShops().slice(0,2)
        })
    },
    [`POST ${api.deliveryLinesConfigMoveShop}`](req, res) {
        const {query} = req
        res.json({
            success: true,
            code:1,
            message: 'Ok',
        })
    },
}

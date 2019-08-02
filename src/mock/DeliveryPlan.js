const qs = require('qs')
const Mock = require('mockjs')
const config = require('../utils/config')

const {apiPrefix, api} = config



let linesListData = Mock.mock({
    'data|6-24': [
        {
            id: '@id',
            pathId: '@id',
            name: '@name',
            tagLineName:'@name',
            tagLineId:'@id',
            create_time: '@datetime',
            update_time: '@datetime',
            "count|1-100": 100
        },
    ],
})


let databaseLine = linesListData.data




module.exports = {
    [`POST ${api.deliveryPlanGetTagLinesByHouseId}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            code:1,
            message: 'Ok',
            result:databaseLine
        })
    },
    [`POST ${api.deliveryPlanMoveLineToDate}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            code:1,
            message: 'Ok',
        })
    },
    [`POST ${api.deliveryPlanDeleteLineFromDate}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            code:1,
            message: 'Ok',
        })
    },
    [`POST ${api.deliveryPlanGetMonthPlan}`](req, res) {
        const {query} = req

        res.json({
            success: true,
            code:1,
            message: 'Ok',
            result:{
                year:'2018',
                month:(new Date()).getMonth()+1,
                plans:{
                    1:databaseLine.slice(0,2),
                    5:databaseLine.slice(2,3),
                    21:databaseLine.slice(4,6),
                }
            }
        })
    },
}

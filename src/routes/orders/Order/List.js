
const {
    Table,
    Modal,
    Tag,
    Popover,
    Button,
    message
} = window.ANTD;

import queryString from 'query-string'

import DetailBtn from 'components/Operations/DetailBtn.js'


const confirm = Modal.confirm

const List = ({filter, dispatch, onDeleteItem, onClickEditItem, onClickRevokeHasClosed, location, ...tableProps}) => {
    // location.query = queryString.parse(location.search)

    const handleMenuClick = (record, type, e) => {
        if (type === 'edit') { // 编辑
            onClickEditItem(true, record)
        } else if (type === 'detail') { // 查看详情
            window.location.href = `#/orderDetail?orderId=${record.id}&${queryString.stringify(filter)}&orderType=${record.type}`
        } else if (type === 'shopDetail') { // 查看店铺详情
            confirm({
                title: '查看店铺详情?',
                onOk() {
                    // onDeleteItem(record)
                },
            })
        }
    }

    const cloudStatusName = status => {
        const cloudName = {
            1: '审核中',
            2: '审核成功',
            3: '审核失败'
        }

        return cloudName[status]
    }
    const cloudStatusColor = status => {
        const cloudName = {
            1: 'blue',
            2: 'green',
            3: 'red'
        }

        return cloudName[status]
    }

    const reviewResult = cloudMsg => {
        return cloudMsg
        // const result = (JSON.parse(cloudMsg ||'[{}]') )

        // return result.length ? result[0].Message : null
    }

    const columns = [
        {
            title: '订单号',
            // dataIndex: 'code',
            key: 'code',
            // width: 64,
            render: (row) => { // substitution
                const {
                    code,
                    substitution,
                    retrial,
                    cloudStatus,//3 代表金蝶审单失败 目前审单已改为异步审单
                    cloudMsg = '[{}]',
                } = row

                return (<div>
                    <a onClick={e => handleMenuClick(row, 'detail', e)}>{code}</a> <br/>
                    {
                        substitution && <Tag color={'#2db7f5'}
                                             type={'small'}
                                             style={{cursor: 'auto'}}
                        >代下单</Tag>
                    }
                    {
                        retrial && <Tag color={'#FF5500'}
                                        type={'small'}
                                        style={{cursor: 'auto'}}
                        >回退</Tag>
                    }
                    {
                        cloudStatus ? <Popover content={reviewResult(cloudMsg)} title="失败原因" trigger="hover">
                            <Tag color={cloudStatusColor(cloudStatus)}
                                 type={'small'}
                                 style={{cursor: 'pointer', marginTop: 10}}
                            >{cloudStatusName(cloudStatus)}</Tag>
                        </Popover> : null
                    }
                </div>)
            },
        },
        {
            title: '店铺',
            // dataIndex: 'shopName',
            key: 'shopName',
            render:(record)=>{
                return <a href={`#/shop/shopDetail?id=${record.shopId}`} >{record.shopName}</a>
            }
        },
        {
            title: '店铺编号',
            // dataIndex: 'shopName',
            key: 'shopCode',
            render: (row) => {
                return (<span>
          {row.shopCode || ''}
        </span>)
            },
        },
        {
            title: '店铺状态',
            dataIndex: 'statusName',
            key: 'statusName',
        },
        {
            title: '下单账号',
            dataIndex: 'userAccount',
            key: 'userAccount',
        },
        {
            title: '订单状态',
            dataIndex: 'flowName',
            key: 'flowName',
        },
        {
            title: '送货日期',
            dataIndex: 'deliveryTime',
            key: 'deliveryTime',
        },
        {
            title: '配送方式',
            // dataIndex: 'shippingMethod',
            key: 'shippingMethod',
            render:(row) => {
                return row.shippingMethod||'';
            },
        },
        {
            title: '订单类型',
            // dataIndex: 'shippingMethod',
            key: 'orderType',
            render(row, item) {
                return <Tag color={item.type ? "#eb2f96" : "#1890ff"}>{item.type ? '预售' : '正常'}</Tag>
            }
        },
        {
            title: '总价',
            // dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (row) => {
                return (row.totalPrice || 0).toFixed(2)
            },
        }, {
            title: '下单时间',
            dataIndex: 'createdTime',
            key: 'createdTime',
        },
        {
            title: '操作',
            key: 'operation',
            width: 120,
            render: (text, record) => {
                return (<div>
                    <DetailBtn onClick={e => handleMenuClick(record, 'detail', e)}/>
                    {/* 客服忘记审单导致订单关闭  开发人员可以在控制台显示按钮 并撤回关闭状态 */}
                    <p style={{display: 'none'}}>
                        <a onClick={e => onClickRevokeHasClosed(record)}>
                            撤回已关闭
                        </a>
                    </p>
                </div>)
            },
        },
    ]

    return (
        <div>
            <Table
                {...tableProps}
                bordered
                columns={columns}
                simple
                rowKey={record => record.id}
            />
        </div>
    )
}

export default List

const {
    React,
    Component,
    connect
} = window;

const {
    qs
} = window.UTILS

const {
    Row,
    Col,
    Card,
    Button,
    Tag,
    Table,
    Form,
    Radio,
    message
} = window.ANTD;


import styles from './index.less'


const modalName = 'OrderCombine';

class OrderCombine extends Component {
    state = {
        orderIds:qs.parse( window.location.href.split('?')[1] || '' ).orderIds.split(',')
    }

    componentDidMount() { // 加载页面初始化数据
        const {dispatch} = this.props

        dispatch({
            type: `${modalName}/detail`,
            payload: {
                ids: this.state.orderIds,
            },
        });

        this.checkStock();//库存检测
    }

    componentWillUnmount() {
        const {dispatch} = this.props
    }

    checkStock = () => { // 检查库存
        this.props.dispatch({
            type: `${modalName}/checkStock`,
            payload: {
                ids:this.state.orderIds||[],
            },
        })
    }
    getOrdersColumns = () => {//获取订单的列表配置

        const {
            detail,
            mainOrder
        } = this.props[modalName];

        const deleveryType = this.props.app.deleveryType;


        const selectMain = (e) => {
            this.props.dispatch({
                type: `${modalName}/updateState`,
                payload: {
                    mainOrder: e.target.value
                }
            })
        };
        return [
            {
                title: '设置为主订单',
                key: 'setMainOrder',
                render: (row) => {
                    return <Radio checked={mainOrder && row.id === mainOrder.id}
                                  onChange={selectMain}
                                  value={row}
                    >
                        设置为主订单
                    </Radio>
                },
            },
            {
                title: '原订单编号',
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: '下单方式',
                // dataIndex: 'substitution',
                key: 'substitution',
                render: (record) => {
                    return record.substitution?'代下单':'自主下单';
                }
            },
            {
                title: '店铺名称',
                dataIndex: 'shopName',
                key: 'shopName',
            },
            {
                title: '店铺编号',
                dataIndex: 'shopCode',
                key: 'shopCode',
            },
            {
                title: '下单账号',
                dataIndex: 'userAccount',
                key: 'userAccount',
            },
            {
                title: '送货日期',
                dataIndex: 'deliveryTime',
                key: 'deliveryTime',
            },
            {
                title: '送货方式',
                // dataIndex: 'deliveryType',
                key: 'deliveryType',
                render:(record)=>{
                    return deleveryType[record.distributionType] || ''
                }
            },
            {
                title: '下单时间',
                dataIndex: 'createdTime',
                key: 'createdTime',
            },
        ]
    }
    getOrdersGoodsColumns = () => {
        // 计算出该行的样式
        const getStyle = (row) => {
            // 库存数据还没有获取到 或者已经获取到但是小于订单数量
            const kucunIsValied = row.kucun == undefined || (row.kucun && row.kucun >= row.finalProductNum) || row.lowStocks// 商品库存不足
            const isDelete = row.delete // 商品被人为删除或者因为库存不足导致被删除

            const style = {
                color: (!kucunIsValied || isDelete) ? 'red' : '',
                textDecoration: isDelete ? 'line-through' : '',
            }
            return style
        }


        return [
            {
                title: '主图',
                // dataIndex: 'pictureList',
                key: 'pictureList',
                width:100,
                render:(row)=>{
                    const mainImg= (row.pictureList||[]).filter(item => item.main);
                    return <img src={mainImg.length && mainImg[0].pictureAddress || "/empty_img.png"} alt={row.productName} style={{maxWidth:'60px'}}/>
                }
            },
            {
                title: '商品编码',
                // dataIndex: 'productCode',
                key: 'productCode',
                render: (row) => {
                    return (<span style={getStyle(row)}>
                      {row.productCode}
                    </span>)
                },
            },
            {
                title: '商品名称',
                // dataIndex: 'productName',
                key: 'productName',
                className: styles.alignLeft,
                render: (row) => {
                    return (<span style={getStyle(row)}>
                        {row.sellMode == 1 ? <a href={'javascript:;'}>【预售】</a> : ''}{row.productName}
                    </span>)
                },
            },
            {
                title: '规格',
                // dataIndex: 'spec',
                key: 'spec',
                render: (row) => {
                    return (<span style={getStyle(row)}>
                        {row.spec}
                    </span>)
                },
            },
            {
                title: '换算率',
                // dataIndex: 'stock',
                key: 'stock',
                render: (row) => {
                    return (<span style={getStyle(row)}>
                        {row.stock}
                    </span>)
                },
            },
            {
                title: '商品单价',
                // dataIndex: 'productPrice',
                key: 'productPrice',
                render: (row) => { // 展示商品的价格变动
                    const getNumToFixe = (num) => {
                        const pointLength = (`${num}`).split('.').length
                        if (pointLength > 1) {
                            let afterPointNum = (`${num}`).split('.')[1]
                            return (num).toFixed(afterPointNum.length > 2 ? 3 : 2)
                        }
                        return (num).toFixed(2)
                    }

                    return (<div>
                        {
                            row.priceIsUpdate && <span style={{...getStyle(row), textDecoration: 'line-through'}}>
                              {getNumToFixe(row.productPrice || 0)} >
                            </span>
                        }
                        <span style={getStyle(row)}>
                            {getNumToFixe(row.finalProductPrice || row.productPrice)}
                          </span>
                    </div>)
                },
            },
            {
                title: '发货单位',
                // dataIndex: 'unit',
                key: 'unit',
                render: (row) => {
                    return (<span style={getStyle(row)}>
                      {row.unit}
                    </span>)
                },
            },
            {
                title: '下单数量',
                // dataIndex: 'finalProductNum',
                key: 'finalProductNum',
                render: (row) => {
                    const {
                        sourceProductNum,
                        finalProductNum,
                        stockUnit,
                    } = row

                    return (<span style={getStyle(row)}>
                      {!sourceProductNum && finalProductNum + stockUnit}
                        {sourceProductNum ? (sourceProductNum == finalProductNum ? finalProductNum + stockUnit : `${sourceProductNum + stockUnit}>${finalProductNum}${stockUnit}`) : ''}
                    </span>)
                },
            },
            // {
            //     title: '最小购买单位',
            //     // dataIndex: 'unit',
            //     key: 'stockUnit',
            //     render:(row)=>{
            //         return <span style={getStyle(row)}>
            //             {row.stockUnit}
            //         </span>
            //     }
            // },
            {
                title: '可用库存',
                // dataIndex: 'kucun',
                key: 'kucun',
                render: (row) => {
                    return (<span style={{...getStyle(row), textDecoration: ''}}>
                      {row.kucun}
                    </span>)
                },
            },
            {
                title: '小计',
                // dataIndex: 'total',
                key: 'total',
                render: (row) => {
                    return (<span style={getStyle(row)}>
                        {((row.priceIsUpdate ? row.finalProductPrice : row.productPrice || 0) * (row.finalProductNum || row.sourceProductNum || 0)).toFixed(2)}
                    </span>)
                },
            },
        ]
    }
    submitPage = ()=>{
        const {
            mainOrder,
            detail
        } = this.props[modalName];

        if(!mainOrder){
            message.warn('请选择主订单！');
            return;
        };

        (detail.orderList||[]).map((item)=>{
            item.mainOrder = mainOrder.id==item.id
        });

        this.props.dispatch({
            type:`${modalName}/submitCombine`,
            payload:{
                ...detail,
            }
        })

    }
    render() {
        const {
            checkStock,
        } = this

        const {} = this.state

        const {
            loading,
            dispatch,
            OrderCombine = {},
        } = this.props

        const {
            detail = {},
            mainOrder
        } = OrderCombine

        // 库存不足的商品
        let kucunNotReach = []

        if (detail.orderCartList) {
            for (let i = detail.orderCartList.length - 1; i > -1; i--) {
                const item = detail.orderCartList[i]
                if ((item.finalProductNum - (item.kucun || 0)) >= 0 && item.kucun != undefined) {
                    kucunNotReach = kucunNotReach.concat(detail.orderCartList.splice(i, 1))
                }
            }
            // console.log('kucunNotReach:', kucunNotReach);
            detail.orderCartList = kucunNotReach.concat(detail.orderCartList)
        }

        const {

        } = detail

        const totalPrice = (detail.orderList||[]).reduce(function(total,item){
            return total+item.totalPrice*1
        },0);

        return (
            <div>
                <Card bordered
                      title={'合并订单'}
                >
                    {/* 订单列表 */}
                    <Table className={'tableList'}
                           dataSource={detail.orderList||[]}
                           bordered
                           columns={this.getOrdersColumns()}
                           pagination={false}
                           rowKey={record => record.id}
                           // rowSelection={null}
                    />
                    <div className={styles.middleMsg}>
                        <p>
                            <span>收货信息 &nbsp;&nbsp;&nbsp;</span>
                            <label>收货人 ：{mainOrder && mainOrder.takeDeliveryPeople}&nbsp;&nbsp;</label>
                            <label>联系电话 ：{mainOrder && mainOrder.takeDeliveryPhone}&nbsp;&nbsp;</label>
                            <label>收货地址：{mainOrder && mainOrder.takeDeliveryAddress}</label>
                        </p>
                        <p>
                            订单总价：<span>{(totalPrice||0).toFixed(2)}</span>
                        </p>
                    </div>

                    <Table className={'tableList'}
                           dataSource={detail.orderCartList || []}
                           bordered
                           columns={this.getOrdersGoodsColumns()}
                           rowKey={record => record.id+record.productId}
                           pagination={false}
                    />
                </Card>

                <div style={{textAlign:'center'}}>
                    <Button type="default"
                            style={{margin: '20px 20px'}}
                            onClick={() => {
                                window.location.href='/#/orders'
                            }}
                    >取消</Button>

                    <Button type="primary"
                            style={{margin: '20px 20px'}}
                            onClick={() => {
                                this.submitPage()
                            }}
                    >保存</Button>
                </div>
            </div>
        )
    }
}

export default connect(({
                            app,
                            OrderCombine,
                            loading,
                            dispatch,
                            location
                        }) => ({app, OrderCombine, loading, dispatch, location}))(Form.create({})(OrderCombine));

/**
 * 该页面的数据直接在订单详情的detail中修改  页面库存 、审核、等都通过在detail中处理
 * 点击审核   审核成功之后 该页面自动变成不可审核状态
 * 点击库存 列表中的商品自动填充库存
 *
 *
 * * */

const {
    React,
    PureComponent,
    connect,
    moment
} = window;


const {
    qs
} = window.UTILS

const {
    Row,
    Col,
    Card,
    Button,
    Icon,
    Tag,
    Table,
    Modal,
    Form,
    Select,
    Input,
    DatePicker,
    Popconfirm,
    message
} = window.ANTD;

const confirm = Modal.confirm;
const Option = Select.Option
const FormItem = Form.Item;
const { TextArea } = Input;


import SelectGoodsDialog from 'routes/commodity/OrderTemplate/SelectGoodsDialog.js'
import EditDialog from './EditDialog'
import BackToNotCheckedDialog from './BackToNotCheckedDialog'
import ModeifyDeliveryInformation from './ModeifyDeliveryInformation'


import DeleteBtn from 'components/Operations/DeleteBtn.js'
import EditBtn from 'components/Operations/EditBtn.js'
import RollBack from 'components/Operations/RollBack.js'


import styles from './index.less'

const houseolors = require('utils/houseColors.js')

const modalName = 'OrderDetail';

class OrderDetail extends PureComponent {
    remark = ''
    state = {
        visiableRemark: false,
        remark: '', // 获取订单备注
        visiable: false,
        isFixed: false,
        backListsDown: true, // 退回备注是否处于展开状态
        labelStyle: {
            display: 'inline-block',
            width: '80px',
            fontWeight: 600,
            textAlign: 'left',
            paddingRight: '10px',
        },
        deliveryTime: '',
        splitTime: ''
    }

    componentDidMount() { // 加载页面初始化数据
        this.getDetail()
        document.getElementById('pageMain').addEventListener('scroll', this.scrollHandler.bind(this))
        this.orderCheckTable = { // 预售订单勾选
            onChange: (selectedRowKeys, selectedRows) => {
                this.selectGoods = selectedRows
                const data = this.compareDeliverTime(selectedRows)
                this.setSplitTime(data)
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
                name: record.name,
            }),
        };
    }

    componentWillUnmount() {
        const {dispatch} = this.props
        dispatch({
            type: 'OrderDetail/updateState',
            payload: {
                isLastOrder: false,
            },
        })
        document.getElementById('pageMain').removeEventListener('scroll', this.scrollHandler.bind(this))
    }

    componentWillReceiveProps(props) {
        const {
            OrderDetail: {
                detail
            }
        } = props
        this.orderType = detail.type
        this.orderId = detail.id

        this.setState({deliveryTime: detail.deliveryTime})
        this.tableChecked = this.canEdit() ? {rowSelection: this.orderCheckTable} : {}

    }

    compareDeliverTime(selectedRows) { // 检验选择的商品时间是否一致
        let isSame = true
        let time = ''
        if (selectedRows && selectedRows.length) {
            time = selectedRows[0].deliveryTime
            for (let row of selectedRows) {
                if (row.deliveryTime !== time) {
                    isSame = false
                    break
                }
            }
        } else isSame = false

        return {isSame, time}
    }

    setSplitTime({isSame, time} = {}, stateTime = 'splitTime') { // 处理筛选出来的时间
        this.setState(state => {
            return {
                [stateTime]: isSame ? time : (stateTime.startsWith('split') ? '' : state[stateTime])
            }
        }, () => {
            if (isSame && stateTime === 'deliveryTime') {
                this.submitDeliveryInformation('', 'deliveryTime')
            }
        })

    }

    getDetail() {
        const {dispatch} = this.props
        const query = window.location.href.split('?')

        const params = qs.parse(query[1] || '')

        dispatch({
            type: 'OrderDetail/detail',
            payload: {
                orderId: params.orderId,
                // flow:Number(params.flow)
            },
        })
    }
    scrollHandler(e) {
        const scrollTop = e.target.scrollTop
        this.setState({
            headWidth: this.card.container && this.card.container.offsetWidth,
            isFixed: scrollTop >= 100,
        })
    }

    checkStock = () => { // 检查库存
        const {
            OrderDetail,
        } = this.props

        const {
            id,
            orderCartList = [],
        } = OrderDetail.detail

        this.props.dispatch({
            type: 'OrderDetail/checkStock',
            payload: {
                orderId: id,
            },
        })
    }

    getParams() { // 序列化地址栏的参数
        const {
            common = '',
            wareHouseId = '',
            lineId = '',
            statusId = '',
            flow = '',
            orderId = '',
            deliveryStartTime = '',
            deliveryEndTime = '',
            orderType = '1',
            ...rest
        } = qs.parse(window.location.href.split('?')[1])

        return {
            flow: flow ? Number(flow) : '',
            orderId: orderId || '',
            // code:detail.code,
            common,
            wareHouseId: wareHouseId ||'',
            lineId: lineId || '',
            statusId: statusId || '',
            deliveryStartTime,
            deliveryEndTime,
            orderType,
            ...rest
        }
    }

    handleBackToNotCheckedModalVisible = (flag) => { // 设置退回订单的弹框显示状态
        const {
            dispatch,
            OrderDetail,
        } = this.props
        dispatch({
            type: 'OrderDetail/updateState',
            payload: {
                backToNotCheckedModalVisible: !!flag,
            },
        })
        // alert('handleBackToNotCheckedModalVisible');
    }
    backToNotChecked = (backParams) => { // 订单退回
        const {
            dispatch,
            OrderDetail,
        } = this.props

        const {
            detail,
        } = OrderDetail

        const {} = this.getParams()

        dispatch({
            type: 'OrderDetail/backToNotChecked',
            payload: {
                ...backParams,
            },
        })

        this.handleBackToNotCheckedModalVisible(false)
    }

    orderAudit = () => { // 订单审核
        const {
            dispatch,
            OrderDetail,
        } = this.props

        const {
            detail,
            isAuditOrdering,//订单正在审核中
        } = OrderDetail

        if(isAuditOrdering){
            message.warn('订单审核处理中.....');
            return;
        }
        if (+this.orderType === 1 && !this.state.deliveryTime) return void message.error('送货时间为空')
        if (+this.orderType !== 1 && !detail.deliveryTime) return void message.error('送货时间为空')

        const {
            orderId,
            ...querys
        } = this.getParams()

        confirm({
            title: '是否审核并跳转至下一张订单?',
            onOk: () => {
                dispatch({
                    type: 'OrderDetail/orderAudit',
                    payload: {
                        orderId,
                        orderQuery: {
                            ...querys,
                        },
                        // shopId:detail.shopId,
                    },
                })
            },
        })
    }

    nextOrder(forward) { // 下一条订单
        const {
            OrderDetail,
            dispatch,
        } = this.props

        const {
            orderId,
            ...querys
        } = this.getParams()

        dispatch({// 查询下一条订单
            type: 'OrderDetail/nextOrder',
            payload: {
                forward,
                orderId,
                orderQuery: {
                    ...querys,
                },
                // shopId:OrderDetail.detail.shopId,
            },
        })
    }

    handleMenuClick(record, type, e) {
        const {
            dispatch,
        } = this.props

        if (type === 'edit') { // 编辑
            this.handleModalVisible(true, record)
        } else if (type === 'delete') { // 删除
            dispatch({
                type: 'OrderDetail/deleteGood',
                payload: {
                    // ids:[record.id]
                    id: record.id,
                },
            })
            // confirm({
            //     title: '确定删除么?',
            //     onOk() {
            //         dispatch({
            //             type:'OrderDetail/deleteGood',
            //             payload:{
            //                 ids:[record.id]
            //             }
            //         })
            //     },
            // })
        } else if (type === 'rollback') { // 撤销
            dispatch({
                type: 'OrderDetail/revokeGood',
                payload: {
                    // ids:[record.id],
                    id: record.id,
                },
            })
        }
    }

    handleModalVisible = (flag, activeRow = null) => { // 设置某个商品详情的modal显示状态
        this.props.dispatch({
            type: `OrderDetail/${flag ? 'showModal' : 'hideModal'}`,
            payload: {
                modalVisible: !!flag,
                activeRow: flag ? activeRow : null,
            },
        })
    }
    handleSelectGoodsModalVisible = (flag) => { // 设置modal的显示状态  同时根据订单详情筛选出已经选中的商品
        const {
            OrderDetail,
            dispatch,
        } = this.props

        const detailGoodsIds = (OrderDetail.detail.orderCartList || []).map((good, i) => {
            return good.productId
        })

        this.props.dispatch({
            type: 'OrderDetail/updateState',
            payload: {
                addGoodModalVisible: !!flag,
                selectedRowKeys: detailGoodsIds,
            },
        })
    }
    handleDialogSubmit = (fields, type = 'add') => { // 新增数据 add   编辑 update
        this.props.dispatch({
            type: `OrderDetail/${type}`,
            payload: {
                ...fields,
            },
        })
    }

    // 修改收货信息
    editInformation = (bool, address) => {
        this.setState({
            visiable: bool,
        })
        this.detail = address
    }

    getHourMinuteAndSecond = e => {
        return `00:00:00`
    }

    createCols = () => {

        const {
            labelStyle,
            backListsDown,
        } = this.state

        const {
            app,
            OrderDetail = {},
            form,
            dispatch,
        } = this.props

        const {
            deleveryType,
        } = app

        const {
            Common_State_prefix,
            detail = {},
        } = OrderDetail;

        const {
            getFieldsValue,
            getFieldDecorator
        } = form;

        const redStyle = {
            color: 'red',
        };

        //该路线可用的送货日期
        const dates=OrderDetail[[Common_State_prefix+'deliveryDates']];
        const deleveryDateOptions = (dates || []).map((item)=>{
            return <Option value={item.day} key={item.day}>
                {item.day}
            </Option>
        });


        //所有的送货方式列表
        const DeliveryTypesOptions = (Object.keys(deleveryType)||[]).map((id)=>{
            return <Option key={id+deleveryType[id]}
                           value={id+''}>
                {deleveryType[id]}
            </Option>
        });



        const modifyOrder = (v)=>{
            setTimeout(()=>{
                const {
                    arrangementIdDate,
                    logisticsType
                } = getFieldsValue();

                // const selectArrangeMend = dates.filter((item)=>item.day == arrangementIdDate);
                // const arrangementId = selectArrangeMend.length?selectArrangeMend[0].arrangementId:'';
                const date = moment(arrangementIdDate._d).format('YYYY-MM-DD')
                const takeDeliveryTime = date + ' ' +  this.getHourMinuteAndSecond()

                const param ={
                    // arrangementId,
                    takeDeliveryTime,
                    logisticsType,
                    orderId:detail.id
                };

                dispatch({
                    type:`${modalName}/modifyOrder`,
                    payload:{
                        ...param
                    }
                })
            });
        };

        const config = [
            {
                title: '订单编号',
                key: 'code',
                render: item => (<span>
                    {item.code}
                    {item.substitution &&
                    <Tag color={'#2db7f5'} type={'small'} style={{cursor: 'auto', margin: '0 5px'}}>代下单</Tag>}
                    {item.back && <Tag color={'#f50'} type={'small'} style={{cursor: 'auto', margin: '0 5px'}}>退回</Tag>}
                </span>)
            },
            {title: '下单店铺', key: 'shopName', render: item => <span style={redStyle}>{item.shopName}</span>},
            {title: '店铺编号', key: 'shopCode', render: item => <span style={redStyle}>{item.shopCode || '---'}</span>},
            {title: '店铺状态', key: 'statusName'},
            {title: '下单账号', key: 'userAccount'},
            {title: '订单状态', key: 'flowName'},
            {title: '下单时间', key: 'createdTime'},
            {title: '更新时间', key: 'updatedTime'},
            {
                title: '订单总价',
                key: 'totalPrice',
                render: item => <span style={redStyle}>{`￥${(item.totalPrice || 0).toFixed(2)}`}</span>
            },
            {
                title: '订单类型',
                key: 'orderType',
                render: () => <Tag color="#ff4a69">{+this.orderType === 1 ? '预售' : '正常'}</Tag>
            },
            {
                title: '配送仓库',
                key: 'warehouseName',
                render: item => <Tag color={houseolors[item.warehouseName]}>{item.warehouseName}</Tag>
            },
            {title: '送货路线', key: 'lineName'},
            {
                title: '送货日期',
                key: 'deliveryTime',
                render:(item)=>{
                    const DateSelectForm=<span>
                        {getFieldDecorator('arrangementIdDate', {
                            ...item.deliveryTime && {initialValue:  moment(item.deliveryTime)},
                            rules: [],
                        })(
                            <DatePicker disabledDate={(current)=>{return current && current.valueOf() < Date.now();}}
                                        showToday={false}
                                        format={'YYYY-MM-DD'}
                                        onChange={_ => { modifyOrder() }}
                            />
                            // <Select style={{width:'40%'}}
                            //         onChange={(val)=>{modifyOrder()}}
                            // >
                            //     {deleveryDateOptions}
                            // </Select>
                        )}
                    </span>;

                    return +this.orderType === 1 ? (this.state.deliveryTime && this.state.deliveryTime.split(' ')[0]) : (detail.flow < 2 ? DateSelectForm : item.deliveryTime)
                }
            },
            {
                title: '配送方式',
                key: 'distributionType',
                render:(item)=>{
                    const TypeSelectForm=<span>
                        {getFieldDecorator('logisticsType', {
                            initialValue: item.distributionType+'',
                            rules: [],
                        })(
                            <Select style={{width:'40%'}}
                                    onChange={(val)=>{modifyOrder()}}
                            >
                                {DeliveryTypesOptions}
                            </Select>
                        )}
                    </span>;

                    return detail.flow<2?TypeSelectForm:deleveryType[item.distributionType]
                }
            },
            {title: '', key: ''},
            {
                title: '收货信息',
                key: 'takeDeliveryAddress',
                col: 24,
                render:(item)=>{
                    const style={
                        display:'inline-block',
                        margin:'0 15px 0 0'
                    };
                    const takeDeliveryAddress = item.takeDeliveryAddress && item.takeDeliveryAddress.replace('&nbsp',  '').replace(/\&lg/g, '')
                    return <span>
                        <Icon type="edit" style={{fontSize: '16px', marginRight: 10, marginTop: 5}} onClick={() => this.editInformation(true, item)}/>
                        <span style={style}> 收货人：{item.takeDeliveryPeople}</span>
                        <span style={style}>联系电话：{item.takeDeliveryPhone}</span>
                        <span style={style}> 收货地址：{takeDeliveryAddress}</span>
                    </span>
                }
            },
            {
                title: '订单备注',
                key: 'remark',
                col: 24,
                render:(item)=>{
                    return <span>
                     <Icon type="edit" style={{fontSize: '16px', marginRight: 10, marginTop: 5}} onClick={() => this.setState({visiableRemark: true, remark: item.remark})}/>{item.remark}</span>
                }
            },
        ];

        const Cols = config.map((item, i) => {
            const {
                title,
                key,
                render,
                col
            } = item

            return (<Col span={col||8} key={title + i} style={{margin: '5px 0'}}>
                <label style={labelStyle}>{title}</label>
                <span>{!render ? detail[key] : render(detail)}</span>
            </Col>)
        })

        // 退回的历史记录
        const backLists = (detail.orderRetrialRemarkList || []).map((notice, i) => {
            return (<p key={notice.content + i}>
                {notice.content} （{notice.createdTime}）
            </p>)
        })

        return (<div>
            {Cols}
            {
                (backLists && backLists.length) ? <Col span={24} style={{display: 'flex'}}>
                    <label style={labelStyle}>退回备注
                        <Icon type={backListsDown ? 'down' : 'up'}
                              style={{lineHeight: '30px', marginLeft: '5px', color: '#999', cursor: 'pointer'}}
                              onClick={() => {
                                  this.setState({backListsDown: !backListsDown})
                              }}
                        />
                    </label>
                    <div style={{flex: 1}}>
                        {backListsDown && backLists}
                    </div>
                </Col> : ''
            }
        </div>)
    }

    changeOrderTime = (date, item) => {
        item.deliveryTime = date

        const {
            detail: {
                orderCartList
            }
        } = this.props.OrderDetail

        const data = this.compareDeliverTime(orderCartList)
        this.setSplitTime(data, 'deliveryTime')
        const selectData = this.compareDeliverTime(this.selectGoods)
        this.setSplitTime(selectData)
    }

    getGoodsColumns = () => {
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

        const {
            COMMON_STATE_deliveryDates: deliverDates
        } = this.props.OrderDetail

        const column = [
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
                title: '商品名',
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
              {row.spec||'-'}
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
            {
                title: '操作',
                // dataIndex: 'address',
                key: 'address',
                width: 80,
                render: (row) => {
                    const {} = row

                    return this.canEdit() ? <div>
                        <EditBtn onClick={e => this.handleMenuClick(row, 'edit', e)}/>
                        {!row.delete && <DeleteBtn onClick={e => this.handleMenuClick(row, 'delete', e)}/>}
                        {row.delete && <RollBack onClick={e => this.handleMenuClick(row, 'rollback', e)}/>}
                    </div> : null
                },
            },
        ]
        if (+this.orderType === 1) {
            column.splice(column.length - 1, 0, {
                title: '送货时间',
                key: 'endTime',
                render: (row, item) => {
                    return this.canEdit() ? <Select style={{width: 120}} onChange={(date)=> this.changeOrderTime(date, item)}>
                        {deliverDates.map(date => <Option value={date.day} key={date.arrangementId}>{date.day}</Option>)}
                    </Select> : this.state.deliveryTime
                },
            })
        }
        return column
    }

    splitOrder = () => { // 拆单
        const {dispatch, form} = this.props
        if (this.selectGoods && this.selectGoods.length < 1 || !this.selectGoods) {
            return void message.error('请选择一个以上的商品')
        }

        if (!this.state.splitTime && +this.orderType === 1) return void message.error('请检查选择的商品送货时间是否一致且不能为空!')

        const arrangementIdDate = form.getFieldValue('arrangementIdDate')

        const deliveryTime = +this.orderType === 1 ? this.state.splitTime : moment(arrangementIdDate._d).format('YYYY-MM-DD')

        dispatch({
            type: `OrderDetail/orderSplit`,
            payload: {
                deliveryTime: deliveryTime + ' ' + this.getHourMinuteAndSecond(),
                orderCartIdList: this.selectGoods.map(good => good.id),
                orderId: this.orderId
            }
        })
    }

    getHistoryColumns = () => {
        return [
            {
                title: '时间',
                dataIndex: 'createdTime',
                key: 'createdTime',
                width: 140,
            },
            {
                title: '操作人',
                dataIndex: 'operateAccount',
                key: 'operateAccount',
                width: 100,
            },
            {
                title: '操作类型',
                dataIndex: 'operateType',
                key: 'operateType',
                width: 100,
            },
            {
                title: '操作日志',
                dataIndex: 'message',
                key: 'message',
            },
        ]
    }

    canEdit() { // 该订单是否可以编辑
        const {
            detail = {},
        } = this.props.OrderDetail || {}

        const {
            flow,
        } = detail || {}

        return flow < 2
    }

    submitDeliveryInformation = (value, type) => {
        const _this = this
        const {
            OrderDetail = {},
            dispatch,
        } = this.props

        const {
            detail = {}
        } = OrderDetail;

        const takeDeliveryTime = this.state.deliveryTime + ' ' +  this.getHourMinuteAndSecond()

        if (!type) {
            var {takeDeliveryPhone = '', takeDeliveryPeople = '', city = [], address = ''} = value
        }

        const param = {
            ...type ? {
                remark: this.state.remark,
                takeDeliveryTime
            } : {
                takeDeliveryPeople,
                takeDeliveryPhone,
                takeDeliveryAddress: city.join('&lg') + '&nbsp' + address,
            },
            orderId: detail.id
        }

        dispatch({
            type:`${modalName}/modifyOrder`,
            payload:{
                ...param
            },
            callback(visiable) {
                _this.setState({...type ? {visiableRemark: visiable} : {visiable}})
                _this.getDetail()
            }
        })
    }

    onAddGoods = (selectGoodsBySelf) => {//添加完商品后需要处理表单中的商品数据
        const {
            dispatch,
            handleSelectGoodsModalVisible,
        } = this.props;

        const isEveryNotZero = selectGoodsBySelf.every(item => item && item.productNum > 0 );

        if(!isEveryNotZero){
            message.warn('请确保手动勾选的商品填写了商品数量！');
            return;
        }
        //需要将选中的数据挑选出来   进行比对添加

        if(!selectGoodsBySelf.length){
            handleSelectGoodsModalVisible(false, null)
        }else{
            dispatch({
                type:'OrderDetail/addGood',
                payload:{
                    selectedGoods: selectGoodsBySelf
                }
            })
        }
    }

    render() {
        const {
            checkStock,
            orderAudit,
            handleDialogSubmit,
            handleModalVisible,
            handleSelectGoodsModalVisible,
            backToNotChecked,
            handleBackToNotCheckedModalVisible,
        } = this

        const {
            isFixed,
            labelStyle,
            headWidth,
        } = this.state

        const {
            loading,
            dispatch,
            OrderDetail = {},
        } = this.props

        const {
            isFirstOrder,
            isLastOrder,
            selectedRowKeys,
            modalVisible,
            addGoodModalVisible,
            detail = {},
            activeRow,
            list,
            pagination,
            backToNotCheckedModalVisible,
        } = OrderDetail

        const {
            statusMapVo = {},
            orderCartList = [], // 订单列表
            orderHistoryList = [], // 操作日志
        } = detail

        // 对订单数据进行排序
        // (detail.orderCartList||[]).sort((prev,next,i)=>{
        //     return (next.finalProductNum-next.kucun||0)-(prev.finalProductNum-prev.kucun||0);
        // });
        let _orderCartList = JSON.parse(JSON.stringify(orderCartList));
        _orderCartList.forEach(v=>{
            v.productNum = v.finalProductNum;
            v.id=v.proSpecId;
        });

        // 弹框中新增商品的列表项配置
        const listProps = {// 表格列表 分页改变 删除数据 编辑数据 多选功能
            list,
            modelName: modalName,
            templateGoods: _orderCartList,
            // dataSource: list,
            handleModalVisible: handleSelectGoodsModalVisible,
            onClickOk: this.onAddGoods,
            sellModeId: this.orderType,
            loading: loading.effects['OrderDetail/queryGoods'],
            pagination,
            dispatch,
            detail,
            cartNum: true,
            rowSelection: {
                selectedRowKeys,
                getCheckboxProps: (record) => { // 设置每一行的可勾选状态
                    const detailGoods = (detail.orderCartList || []).map((good, i) => {
                        return good.productId
                    })

                    return {
                        disabled: detailGoods.indexOf(record.id) >= 0, // 该行会被禁止掉选中操作
                    }
                },
                onChange: (keys, rows) => {
                    (rows || []).map((item, i) => { // 手动选中的商品  默认加上步长的数量
                        if (!item.finalProductNum) {
                            item.finalProductNum = item.step || 1
                        }
                    })

                    dispatch({
                        type: 'OrderDetail/updateState',
                        payload: {
                            selectedRowKeys: keys,
                        },
                    })
                },
            },
        }

        const headerStyle = Object.assign({
            padding: '0 20px',
        }, isFixed ? {
            position: 'fixed',
            backgroundColor: '#fff',
            borderBottom: '1px solid #f4f4f4',
            boxShadow: '0 3px 3px 0 #e8e8e8',
            zIndex: 10,
            top: '0',
            width: `${headWidth - 2}px`,
        } : {})

        const title = () => {
            return (<Row style={headerStyle}>
                <Col span={12}>
                    {this.canEdit() ? <div>
                        <Tag color={'#2db7f5'} onClick={() => {
                            checkStock()
                        }}>库存</Tag>
                        <Tag color={'#87d068'} onClick={() => {
                            orderAudit()
                        }}>审核</Tag>
                        <Tag color={'#f50'} onClick={() => {
                            handleSelectGoodsModalVisible(true)
                        }}>新增商品</Tag>
                        <Popconfirm
                            title="是否确定进行拆单"
                            onConfirm={this.splitOrder}
                            okText="确定"
                            cancelText="取消">
                            <Tag color="purple">拆单</Tag>
                        </Popconfirm>
                    </div> : <div>
                        <Button onClick={() => {
                            handleBackToNotCheckedModalVisible(true)
                        }}>退回</Button>
                    </div>}
                </Col>

                <Col span={12} style={{textAlign: 'right'}}>
                    {
                        <Button type="default">
                            <a download href={`/api/order/detailExport?orderId=${this.getParams().orderId}`}>订单导出</a>
                        </Button>
                    }
                    {
                        !isFirstOrder && <span style={{cursor: 'pointer', marginLeft: '20px'}}
                                               onClick={() => {
                                                   this.nextOrder(-1)
                                               }}
                        >
                <Icon type="left"/>上一条
              </span>
                    }
                    {
                        !isLastOrder && <span style={{cursor: 'pointer', marginLeft: '20px'}}
                                              onClick={() => {
                                                  this.nextOrder(1)
                                              }}
                        >
                        下一条<Icon type="right"/>
              </span>
                    }
                </Col>
            </Row>)
        }

        const rowStyle = {
            lineHeight: '30px',
        }

        const parentMethods = {
            handleDialogSubmit,
            handleModalVisible,
        }


        return (
            <div ref={(wraper) => {
                this.wraper = wraper
            }}>
                {
                    this.state.visiable && <ModeifyDeliveryInformation
                        visiable={this.state.visiable}
                        detail={this.detail}
                        cancelModeify={bool => this.editInformation(bool)}
                        submitDeliveryInformation={this.submitDeliveryInformation}
                    />
                }
                {this.state.visiableRemark && <Modal
                    title="修改订单备注"
                    visible={this.state.visiableRemark}
                    onOk={() => {this.submitDeliveryInformation(this.detail, 'remark')}}
                    onCancel={() => {this.setState({visiableRemark: false})}}
                >
                    <TextArea rows={4} value={this.state.remark} onChange={e => this.setState({remark: e.target.value})}/>
                </Modal>}
                <Card bordered
                      title={title('订单详情')}
                      className={styles.card}
                      ref={card => this.card = card}
                >
                    {/* 顶部字段信息 */}
                    <Row style={rowStyle}>
                        {this.createCols()}
                    </Row>
                    <div style={{margin: '20px 0'}}>
                        {<Table className={'tableList'}
                                dataSource={orderCartList}
                                bordered
                                columns={this.getGoodsColumns()}
                                pagination={false}
                                {...this.tableChecked}
                        />}
                    </div>
                </Card>


                {/* 订单操作历史 */}
                <Card bordered
                      title={<p style={{padding: '0 20px'}}>操作日志</p>}
                      className={styles.card}
                      style={{marginTop: '20px'}}
                >
                    {<Table className={'tableList'}
                            dataSource={orderHistoryList}
                            bordered
                            columns={this.getHistoryColumns()}
                            pagination={false}
                    />}
                </Card>


                {modalVisible && <EditDialog {...parentMethods}
                                             modalVisible={modalVisible}
                                             activeRow={activeRow}
                                             detail={detail}
                />}

                {addGoodModalVisible && <SelectGoodsDialog modalVisible={addGoodModalVisible}
                                                           {...listProps}
                                                           detail={detail}
                                                           handleSelectGoodsModalVisible={handleSelectGoodsModalVisible}
                />}

                {
                    backToNotCheckedModalVisible && <BackToNotCheckedDialog modalVisible={backToNotCheckedModalVisible}
                                                                            handleBackModalVisible={handleBackToNotCheckedModalVisible}
                                                                            backToNotChecked={backToNotChecked}
                                                                            detail={detail}
                    />
                }
            </div>
        )
    }
}

export default connect(({
                            app,
                            OrderDetail,
                            loading,
                            dispatch,
                            location
                        }) => ({app, OrderDetail, loading, dispatch, location}))(Form.create({})(OrderDetail));

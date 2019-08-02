
import BatchDownload from 'components/BaoHuo/BatchDownload/';
import styles from './Filter.less'

const {
    React,
    Component,
    moment
} = window;

const {
    Form,
    Button,
    Row,
    Col,
    Input,
    Select,
    DatePicker,
    message,
} = window.ANTD;

const {RangePicker} = DatePicker
const Option = Select.Option

const ColProps = {
    xs: 24,
    sm: 12,
    style: {
        marginBottom: 16,
    },
}

// const orderFilter = [{ // 订单管理筛选条件
//     name: '全部',
//     value: 0,
//     number: 100,
//     checked: true,
// }, {
//     name: '待审批',
//     value: 0,
//     number: 100,
//     checked: false
// }, {
//     name: '待发货',
//     value: 0,
//     number: 100,
//     checked: false
// }, {
//     name: '已发货',
//     value: 0,
//     number: 100,
//     checked: false
// }, {
//     name: '未通过',
//     value: 0,
//     number: 100,
//     checked: false
// }, {
//     name: '已完成',
//     value: 0,
//     number: 100,
//     checked: false
// }, {
//     name: '已关闭',
//     value: 0,
//     number: 100,
//     checked: false
// }]

// const orderFilterTemp = props => (
//     <div
//         className={!props.checked ? styles.orderFilter : [styles.orderFilter, styles.OrderFilterActive].join(' ')} onClick={_ => props.changeFilter(props.fIndex)}>
//         {props.name}
//         <span className={styles.orderFilterNumber}>({props.number})</span>
//     </div>
// )

// const HocOrderComponent = Ordercomponent => (
//     class extends React.Component {
//         state = {
//             ORDER_CHANGE: false
//         }
//         changeFilter = fIndex => {
//             orderFilter.forEach((ord, i) => {
//                 ord.checked = fIndex === i
//             })
//             this.setState(({ORDER_CHANGE}) => { // 触发重新渲染机制
//                 return {
//                     ORDER_CHANGE: !ORDER_CHANGE
//                 }
//             })
//         }
//         render() {
//             const events = {
//                 changeFilter: this.changeFilter
//             }
//             return (
//                 <div className={styles.orderFilterContain}>
//                     {orderFilter.map((val, index) => (
//                         <Ordercomponent fIndex={index} {...val} {...events} key={val.name}/>
//                     ))}
//                 </div>
//             )
//         }
//     }
// )

// const OrderFilterHoc = HocOrderComponent(orderFilterTemp)

const Filter = ({
                    onAdd,
                    isMotion,
                    switchIsMotion,
                    onFilterChange,
                    onSearch,
                    filter,
                    handleModalVisible,
                    dispatch,
                    ShopStatusSelect,
                    orderStatusSelect,
                    wareHouses,
                    wareHouseTagLines,
                    pagination,
                    selectedRowKeys,
                    deleveryType,
                    CreateOrderTypeSelects,//下单方式下拉框列表
                    OrderSortTypeSelects,//订单排序类型下拉框列表
                    form: {
                        getFieldDecorator,
                        getFieldsValue,
                        getFieldValue,
                        setFieldsValue,
                        validateFieldsAndScroll
                    },
                }) => {
    const handleFields = (fields) => {
        const {
            time,
            submitOrderTime
        } = fields;

        if (time.length) {
            fields.deliveryStartTime = time[0].format('YYYY-MM-DD')+' 00:00:00';
            fields.deliveryEndTime = time[1].format('YYYY-MM-DD')+' 23:59:59';
        }
        delete fields.time;
        delete fields[time];

        //下单时间
        if (submitOrderTime.length) {
            fields.createdOrderStartTime = submitOrderTime[0].format('YYYY-MM-DD')+' 00:00:00';;
            fields.createdOrderEndTime = submitOrderTime[1].format('YYYY-MM-DD')+' 23:59:59';;
        }
        delete fields.submitOrderTime;
        delete fields[submitOrderTime];


        return fields
    }

    const handleSubmit = () => {
        validateFieldsAndScroll((errors, values) => {
            if (errors) {
                return
            }
            let fields = getFieldsValue();

            fields = handleFields(fields);

            dispatch({
                type: 'Orders/updateState',
                payload: {
                    filter: {
                        ...fields
                    }
                }
            })

            onSearch(fields)
        })
    }

    const handleReset = () => {
        const fields = getFieldsValue()
        for (let item in fields) {
            if ({}.hasOwnProperty.call(fields, item)) {
                if (fields[item] instanceof Array) {
                    fields[item] = []
                } else {
                    fields[item] = undefined
                }
            }
        }
        setFieldsValue(fields)
        handleSubmit()
    }

    const handleChange = (key, values) => {
        setTimeout(() => {//延时操作  获取到新值
            let fields = getFieldsValue();
            fields[key] = values
            fields = handleFields(fields)
            // dispatch({
            //     type: 'Orders/updateState',
            //     payload: {
            //         filter: {
            //             ...fields
            //         }
            //     }
            // })
            onFilterChange(fields)
            handleSubmit(fields);
        }, 2);
    }
    const {
        statusId,
        flow,
        common,
        wareHouseId,
        lineId,
        deliveryStartTime,
        deliveryEndTime,
        distributionType,//配送方式
        createdOrderStartTime,//下单开始时间
        createdOrderEndTime,//下单结束时间
        substitution,//下单方式
        sortType,//订单排序方式
    } = filter

    //导出需要根据搜索条件进行筛选
    const filterArr = [];
    Object.keys(filter).map((key) => {
        const val = filter[key];
        if (val) {
            filterArr.push(`${key}=${val}`)
        }
    });

    let filtersString = filterArr.join('&');
    filtersString = filtersString + `${filtersString ? '&' : ''}page=${pagination.current}&pageSize=${pagination.pageSize}`;


    //仓库发生变化 需要动态改变可选路线的值
    const onWareHouseChange = (fieldVal) => {

        fieldVal && dispatch({
            type: 'app/getSingleWareHouseTagLines',
            payload: {
                wareHouseIdList: fieldVal ? [fieldVal] : []
            }
        });

        setFieldsValue({//清空路线选择
            lineId: ''
        });

        dispatch({//更新搜索条件的状态
            type: 'Orders/updateState',
            payload: {
                filter: {
                    ...filter,
                    wareHouseId: fieldVal ? fieldVal : null
                }
            }
        });
        handleChange();//执行搜索
    }


    //点击批量改价功能
    const multipleChangePrice = (queryStr) => {

        if (getFieldValue('flow') == '1') {
            if (pagination.total) {
                window.location.href = '/#/orders/ordersBatchChangeGoodPrice?' + queryStr;
            } else {
                message.warn('暂无未审核订单！');
            }
        } else {
            message.warn('只可更改待审核状态下订单的商品价格！');
        }
    }


    //仓库下拉列表
    const HouseOptions = wareHouses.map((item, i) => {
        const {
            id,
            name
        } = item;
        return <Option value={id} key={name + id}>{name}</Option>
    });


    //订单模板类型下拉框
    const shopStatusSelectsOptions = ShopStatusSelect.map((item, i) => {
        const {
            id,
            name
        } = item;
        return <Option value={id} key={name + id}>{name}</Option>
    });


    //订单类型下拉框
    const orderStatusSelectOptions = orderStatusSelect.map((item, i) => {
        const {
            id,
            name
        } = item;
        return <Option value={id} key={name + id}>{name}</Option>
    });


    //获取选中仓库下可选的路线列表
    const selectedWareHouse = filter.wareHouseId;
    const singleWareHouseTagLinesOptions = (wareHouseTagLines[selectedWareHouse] || []).map((tagLine, i) => {
        const {
            name,
            id
        } = tagLine
        return <Option value={id} key={id + name}>{name}</Option>
    });


    //所有的送货方式列表
    const DeliveryTypesOptions = (Object.keys(deleveryType)||[]).map((id)=>{
        return <Option key={id+deleveryType[id]}
                       value={id+''}>
            {deleveryType[id]}
        </Option>
    });

    //下单方式
    const CreateOrderTypeOptions = (CreateOrderTypeSelects||[]).map((item, i) => {
        const {
            id,
            name
        } = item;
        return <Option value={id} key={name + id}>{name}</Option>
    });

    //订单排序类型
    // const SortTypeOptions = (OrderSortTypeSelects||[]).map((item, i) => {
    //     const {
    //         id,
    //         name
    //     } = item;
    //     return <Option value={id} key={name + id}>{name}</Option>
    // });

    return (
        <div>
            <Row gutter={24}>
                {/* <Col>
                    <OrderFilterHoc />
                </Col> */}
                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('statusId', statusId ? {
                        initialValue: statusId || '',
                    } : {})(<Select placeholder="请选择店铺状态"
                                    onChange={handleChange}
                                    style={{width: '100%'}}
                    >
                        <Option value={''}>全部</Option>
                        {shopStatusSelectsOptions}
                    </Select>)}
                </Col>
                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('flow', {
                        initialValue: flow,
                        rules: [
                            // {required: true},
                        ]
                    })(<Select placeholder="订单状态"
                               onChange={handleChange}
                               style={{width: '100%'}}
                    >
                        {orderStatusSelectOptions}

                    </Select>)}
                </Col>

                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('wareHouseId', wareHouseId ? {
                        initialValue: wareHouseId,
                    } : {})(
                        <Select placeholder="请选择仓库"
                                style={{width: '100%'}}
                                onChange={(val) => {
                                    onWareHouseChange(val)
                                }}
                        >
                            <Option value={''}>全部</Option>
                            {HouseOptions}
                        </Select>
                    )}
                </Col>
                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('lineId', lineId ? {
                        initialValue: lineId
                    } : {})(
                        <Select placeholder="请选择路线"
                                style={{width: '100%'}}
                                onChange={handleChange}
                        >
                            {/*<Option value={''} >全部</Option>*/}
                            {singleWareHouseTagLinesOptions}
                        </Select>
                    )}
                </Col>
                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('time', {
                        initialValue: deliveryStartTime ? [moment(deliveryStartTime, 'YYYY/MM/DD'), moment(deliveryEndTime, 'YYYY/MM/DD')] : [],
                        rules: [
                            // {required: true, message: ``},
                        ],
                    })(
                        <RangePicker format={'YYYY-MM-DD'}
                                     placeholder={['开始送货日期', '结束送货日期']}
                                     onChange={handleChange}/>
                    )}
                </Col>

                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('substitution', substitution ? {
                        initialValue: substitution,
                    } : {})(
                        <Select placeholder="请选择下单方式"
                                style={{width: '100%'}}
                                onChange={handleChange}
                        >
                            <Option value={''}>全部</Option>
                            {CreateOrderTypeOptions}
                        </Select>
                    )}
                </Col>

            </Row>
            <Row gutter={24}>
                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('type', statusId ? {
                        initialValue: statusId || '',
                    } : {})(
                        <Select placeholder="请选择订单类型"
                                onChange={handleChange}
                                style={{width: '100%'}}
                        >
                            <Option value="">全部</Option>
                            <Option value="1">预售</Option>
                            <Option value="0">正常</Option>
                        </Select>
                    )}
                </Col>
                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('submitOrderTime', {
                        initialValue: createdOrderStartTime ? [moment(createdOrderStartTime, 'YYYY/MM/DD'), moment(createdOrderEndTime, 'YYYY/MM/DD')] : [],
                        rules: [
                            // {required: true, message: ``},
                        ],
                    })(
                        <RangePicker format={'YYYY-MM-DD'}
                                     placeholder={['开始下单日期', '结束下单日期']}
                                     onChange={handleChange}/>
                    )}
                </Col>
                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('distributionType', distributionType ? {
                        initialValue: distributionType,
                    } : {})(
                        <Select placeholder="请选择配送方式"
                                style={{width: '100%'}}
                                onChange={handleChange}
                        >
                            <Option value={''}>全部</Option>
                            {DeliveryTypesOptions}
                        </Select>
                    )}
                </Col>

                {/*<Col {...ColProps} xl={{span: 4}} md={{span: 8}}>*/}
                    {/*{getFieldDecorator('sortType', sortType ? {*/}
                        {/*initialValue: sortType,*/}
                    {/*} : {})(*/}
                        {/*<Select placeholder="请选择排序方式"*/}
                                {/*style={{width: '100%'}}*/}
                                {/*onChange={handleChange}*/}
                        {/*>*/}
                            {/*{SortTypeOptions}*/}
                        {/*</Select>*/}
                    {/*)}*/}
                {/*</Col>*/}

                <Col {...ColProps} xl={{span: 4}} md={{span: 8}}>
                    {getFieldDecorator('common', {
                        initialValue: common,
                        rules: [
                            // {required: true},
                        ]
                    })(<Input placeholder="请输入店铺名称、店铺编号、订单编号、下单账号"
                              onPressEnter={() => {
                                  handleChange()
                              }}
                    />)}
                </Col>

                <Col {...ColProps} xl={{span: 4}} md={{span: 4}}>
                    <Button type="primary"
                            onClick={() => handleSubmit()}>查询
                    </Button>
                </Col>

                <Col {...ColProps} xl={{span: 16}} md={{span: 12}} style={{textAlign:'right'}}>
                    {/*<Button type="default">*/}
                    {/*<a download href={`/api/order/export?${filtersString}`}>导出</a>*/}
                    {/*</Button>*/}

                    <BatchDownload filter={filter}
                                   pagination={pagination}
                                   url={'/api/order/export'}
                    />

                    <Button type="default"
                            style={{margin: '0 15px'}}
                            onClick={() => {
                                multipleChangePrice(filtersString)
                            }}
                    >
                        批量改价
                    </Button>
                    <Button icon="plus"
                            type="primary"
                            onClick={() => {
                                window.location.href = '#/orderAdd'
                            }}>新增订单
                    </Button>
                </Col>
            </Row>

            <Row>

            </Row>
        </div>
    )
};


export default Form.create()(Filter)

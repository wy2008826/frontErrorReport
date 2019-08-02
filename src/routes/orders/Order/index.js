
const {
    React,
    PureComponent,
    connect
} =window;

const {
    Card,
    Button,
    Popconfirm,
    message
} = window.ANTD;

import Filter from './Filter'
import List from './List'


import styles from './index.less'


class Orders extends PureComponent {
    state = {

    }

    componentDidMount() {//加载页面初始化数据
        const {dispatch} = this.props

        //获取店铺状态下拉列表
        dispatch({
            type: 'app/getShopStatusSelect',
        });

        //获取仓库下拉列表
        dispatch({
            type: 'app/getWareHouses',
        });

        //获取订单状态列表  同时获取列表数据
        dispatch({
            type: 'Orders/getOrderStatusSelect',
        });

        //查询
        // dispatch({
        //     type: 'Orders/query',
        // });

        //获取订单下单类型下拉框列表
        dispatch({
            type: 'app/getCreateOrderTypeSelects',
        });

        //获取订单排序类型下拉框列表
        dispatch({
            type: 'app/getOrderSortTypeSelects',
        });


    }
    componentWillUnmount(){
        this.props.dispatch({
            type:'Orders/resetModel'
        })
    }
    handleSearch = (fieldsValue={}) => {//查询列表
        this.props.dispatch({
            type: 'Orders/query',
            payload: {
                ...fieldsValue,
                page: 1,
                pageSize: 10
            },
        })
    }
    onFilterChange=(fields)=>{//搜索表单内容发生变动

    }
    onPageChange=(page)=>{//页码发生变化
        const {
            dispatch,
            Orders
        }=this.props;

        const {
            filter={}
        }=Orders;

        dispatch({
            type: 'Orders/query',
            payload: {
                ...filter,
                page: page.current || 1,
                pageSize: page.pageSize || 10
            },
        })
    }
    handleModalVisible = (flag, activeRow = null) => {//设置modal的显示状态
        this.props.dispatch({
            type: `Orders/${flag ? 'showModal' : 'hideModal'}`,
            payload: {
                modalVisible: !!flag,
                activeRow: flag ? activeRow : null,
            },
        })
    }
    handleDialogSubmit = (fields,type='add') => {//新增数据 add   编辑 edit

        this.props.dispatch({
            type: `Orders/${type}`,
            payload: {
                ...fields
            },
        })
    }
    onDeleteItem=(item)=>{//删除单行数据
        this.props.dispatch({
            type: 'Orders/delete',
            payload: item,
        })
    }
    getActiveDetail = (activeRow) => {//获取单条数据的详情
        this.props.dispatch({
            type: 'Orders/detail',
            payload: {
                activeRow
            },
        })
    }
    onClickRevokeHasClosed=(row)=>{
        const {
            Orders,
            dispatch,
        }=this.props;

        dispatch({
            type:'Orders/revokeHasClosed',
            payload:{
                ids:[row.id]
            }
        });
    }

    judegeOrderType = orders => { // 判断勾选的订单是否是同一种类型的订单
        const type = orders[0].type
        for (let ord of orders) {
            if (ord.type !== type) return false
        }

        return true
    }

    combineOrders= ()=>{//合并订单跳转校验
        const {
            Orders,
            dispatch
        } = this.props;

        const {
            filter,
            list,
            selectedRows
        } = Orders;

        if(filter.flow!=1){
            message.warn('只允许待审核状态下进行合并！');
            return;
        }

        const isSameOrderType = this.judegeOrderType(selectedRows)
        if (!isSameOrderType) return void message.error('所选订单类型不同，无法进行合单！')
        //判断统一批数据  是否某几个字段完全一致   同时组装所有的ID
        let combineRes = (selectedRows||[] ).reduce((res,item)=>{
            const {
                shopId,
                deliveryTime,
                id
            } = item;

            (res.shopIds.indexOf(shopId)<0 ) && ( res.shopIds.push(shopId) );
            (res.deliveryTimes.indexOf(deliveryTime)<0 ) && (res.deliveryTimes.push(deliveryTime) );
            res.orderIds.push(id);
            return res;
        },{ shopIds:[], deliveryTimes:[],orderIds:[]});


        if(combineRes.shopIds.length>1 || combineRes.deliveryTimes.length>1){
            message.warn('只允许合并同一店铺同一送货时间的待审核订单！');
            return ;
        }

        window.location.href='/#/orderCombine?orderIds='+combineRes.orderIds.join(',');

    }
    render() {
        const {
            handleDialogSubmit,
            getActiveDetail,
            handleModalVisible,
            handleSearch,
            onDeleteItem,
            onPageChange,
            onFilterChange,
            onClickRevokeHasClosed
        }=this;

        const {
            location,
            loading,
            dispatch,
            Orders,
            app
        } = this.props;


        const {
        }=this.state;

        const {
            wareHouses=[],
            wareHouseTagLines={},
            ShopStatusSelect=[],//店铺状态下拉框
            deleveryType=[],//配送方式下拉框列表
            CreateOrderTypeSelects=[],//下单方式下拉框列表
            OrderSortTypeSelects=[],//订单排序类型下拉框列表
        }=app;

        const {
            filter={},
            selectedRows = [],
            selectedRowKeys = [],
            list = [],
            pagination = {page: 1, current: 1, pageSize: 10},
            modalVisible,
            activeRow,
            activeDetail,
            isMotion,
            orderStatusSelect=[],//订单状态下拉框

        } = Orders

        const filterProps = {//搜索条件
            deleveryType,
            wareHouses,
            wareHouseTagLines,
            isMotion,
            filter,
            dispatch,
            pagination,
            selectedRowKeys,
            onFilterChange:onFilterChange,
            onSearch:handleSearch,
            handleModalVisible,
            ShopStatusSelect,
            orderStatusSelect,
            CreateOrderTypeSelects,//下单方式下拉框列表
            OrderSortTypeSelects,//订单排序类型下拉框列表
            switchIsMotion() {
                dispatch({type: 'user/switchIsMotion'})
            },
        }

        const listProps = {//表格列表 分页改变 删除数据 编辑数据 多选功能
            filter,
            dataSource: list,
            loading: loading.effects['Orders/query'],
            pagination,
            location,
            isMotion,
            dispatch,
            onChange:onPageChange,
            onDeleteItem,
            onClickEditItem:handleModalVisible,
            onClickRevokeHasClosed:onClickRevokeHasClosed,
            rowSelection: {
                selectedRowKeys,
                onChange: (keys,selectedRows) => {
                    dispatch({
                        type: 'Orders/updateState',
                        payload: {
                            selectedRowKeys: keys,
                            selectedRows
                        },
                    })
                },
            },
        }

        return (
            <Card bordered={false}>
                <Filter {...filterProps} />
                <div className={styles.tableList}>
                    <div className={styles.tableListOperator}>
                        {selectedRowKeys.length >1 && <span>
                         {`已选择 ${selectedRowKeys.length} 条数据 `}
                                        <Popconfirm title={'确定要合并所选订单么?'} placement="left" onConfirm={this.combineOrders}>
                              <Button type="primary" size="small" style={{marginLeft: 8}}>合并订单？</Button>
                            </Popconfirm>
                         </span>}
                    </div>
                    <List {...listProps} />

                </div>
            </Card>
        )
    }
}

export default connect(({app,Orders, loading,dispatch,location}) => ({app,Orders, loading,dispatch,location}))(Orders)

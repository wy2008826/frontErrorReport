
/**
 * 该页面的数据直接在订单详情的detail中修改  页面库存 、审核、等都通过在detail中处理
 * 点击审核   审核成功之后 该页面自动变成不可审核状态
 * 点击库存 列表中的商品自动填充库存
 *
 *
 * **/



import React, {PureComponent} from 'react'
import {connect} from 'dva'


import {
    Card,
    Modal,
    Steps,
    message
} from 'antd'

const Step = Steps.Step;



import styles from './index.less'


import Step0 from './Step0';
import Step1 from './Step1';
import Step2 from './Step2';

const modelName='OrderAdd';


class OrderAdd extends PureComponent {
    state = {

    }

    componentDidMount() {//加载页面初始化数据
        const {
            dispatch,
            OrderAdd,
        } = this.props

        dispatch({
            type:`app/getShopStatusSelect`
        })

    }
    componentWillUnmount(){//页面离开的时候需要重置 model中的状态
        const {
            dispatch
        } = this.props;

        dispatch({
            type:`${modelName}/updateState`,
            payload:{
                current:0,

                wareHouseId:'',
                tagLineId:'',
                shopLists:[],

                //清空第一步的数据
                template:null,
                deliveryDate:null,
                selectedShopRowKeys:[],
                selectedShopRows:[],
                //清空第二步的数据
                templateGoods:[],//模板列表中的数据
                templateGoodsSelectsKeys:[],//模板列表中勾选中的商品

                selectShopType:1,//默认选择店铺的模式是多店

            }
        });
    }
    handleModalVisible = (flag, activeRow = null) => {//设置modal的显示状态
        this.props.dispatch({
            type: `OrderAdd/${flag ? 'showModal' : 'hideModal'}`,
            payload: {
                modalVisible: !!flag,
                activeRow: flag ? activeRow : null,
            },
        })
    }
    handleSelectGoodsModalVisible = (flag) => {//设置modal的显示状态
        const {
            OrderDetail,
            dispatch
        }=this.props;

        const detailGoodsIds=(OrderDetail.detail.orderTemplateVoList||[]).map((good,i)=>{
            return good.productId;
        });

        this.props.dispatch({
            type: `OrderAdd/updateState`,
            payload: {
                addGoodModalVisible: !!flag,
                selectedRowKeys:detailGoodsIds
            },
        })
    }
    handleDialogSubmit = (fields,type='add') => {//新增数据 add   编辑 update

        this.props.dispatch({
            type: `OrderAdd/${type}`,
            payload: {
                ...fields
            },
        })
    }
    prevStep=()=>{ //上一步
        const {
            dispatch,
            OrderAdd
        }=this.props;

        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                current:OrderAdd.current-1
            }
        });
    }
    nextStep=()=>{//下一步
        const {
            dispatch,
            OrderAdd
        }=this.props;

        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                current:OrderAdd.current+1
            }
        });

    }
    createOrders=()=>{//批量生成订单
        const {
            dispatch,
            OrderAdd
        }=this.props;

        dispatch({
            type:'OrderAdd/createOrders',
        });
    }
    render() {

        const {
            handleDialogSubmit,
            handleModalVisible,
            handleSelectGoodsModalVisible,
        }=this;

        const {

        }=this.state;

        const {
            app,
            loading,
            dispatch,
            OrderAdd={},
        } = this.props;

        let {
            current,//当前的步骤索引
            wareHousesTrees={},//仓库树 以及仓库下的路线树
            wareHouseId='',//当前选中的仓库id
            tagLineId='',//当前选中的路线id

            //第一步需要用到的参数
            shopModalVisible=false,
            shopLists=[],//根据路线查找到的店铺列表
            shopPagination={},
            selectedShopRowKeys=[],
            selectedShopRows=[],//店铺列表中已经选择的店铺



            //第二步需要用到的参数
            templateTrees={},
            deliveryDates=[],//可选的送货日期列表
            template=null,//订单模板
            deliveryDate=null,//送货日期
            activeLineDetail={},


            //第三步需要的参数
            templateGoods=[],//订单模板下的商品列表
            templateGoodsSelectsKeys=[],//订单模板中选中的商品key
            selectGoodsModalVisible,
            selectGoodsList=[],//添加商品弹框里面的列表数据
            selectGoodsPagination={},//添加
            selectGoodsBySelf=[],//自己在弹框中勾选的商品id组
            selectTemplateModalVisible,//模板弹框的展示状态


            selectedRowKeys,
            modalVisible,
            addGoodModalVisible,
            detail={},
            activeRow,
            list,
            pagination,

            selectShopType,//选择店铺的类型 单店 多店
        } = OrderAdd;

        const {
            deleveryType,
            GoodsClassifySelects,
            shopStatusColorConfig,
            ShopStatusSelect=[],//店铺状态下拉框
        }=app;

        //对订单数据进行排序
        (detail.orderTemplateVoList||[]).sort((prev,next,i)=>{
            // return next.amount-prev.amount;
            return (next.amount-next.kucun||0)-(prev.amount-prev.kucun||0);
        });


        const listProps = {//表格列表 分页改变 删除数据 编辑数据 多选功能
            dataSource: list,
            loading: loading.effects['OrderDetail/queryGoods'],
            pagination,
            dispatch,
            rowSelection: {
                selectedRowKeys,
                getCheckboxProps: record =>{
                    const detailGoods=(detail.orderTemplateVoList||[]).map((good,i)=>{
                        return good.productId;
                    });

                    return {
                        disabled: detailGoods.indexOf(record.id)>=0, // 该行会被禁止掉选中操作
                    }
                },
                onChange: (keys) => {

                    dispatch({
                        type: 'OrderDetail/updateState',
                        payload: {
                            selectedRowKeys: keys,
                        },
                    })
                },
            },
        }



        const parentMethods={
            handleDialogSubmit,
            handleModalVisible
        };

        //第一步中 添加店铺弹框需要用到的参数
        const shopDialogListsProps={
            dataSource: shopLists,
            loading: loading.effects['OrderAdd/searchShopByTagline'],
            pagination:shopPagination,
            dispatch,
            // onChange:onPageChange,
            rowSelection: {
                selectedRowKeys:selectedShopRowKeys,
                onSelect:(row,checked)=>{
                    // console.log(row,checked);
                    if(selectShopType==2){//单店铺选择模式
                        selectedShopRowKeys=[];
                        selectedShopRows=[];

                        if(checked){//选中
                            if(selectedShopRowKeys.indexOf(row.id)<0){//原有项中没有
                                selectedShopRowKeys.push(row.id);
                                selectedShopRows.push(row);
                            }

                        }else{//取消选中
                            selectedShopRowKeys.splice(selectedShopRowKeys.indexOf(row.id) ,1);
                            (selectedShopRows||[]).map((item,j)=>{
                                if(item.id==row.id){
                                    selectedShopRows.splice(j,1);
                                }
                            });
                        }
                        dispatch({
                            type: 'OrderAdd/updateState',
                            payload: {
                                selectedShopRowKeys,
                                selectedShopRows
                            },
                        })
                    }

                },
                onChange: (keys,rows) => {
                    // console.log(selectedShopRowKeys,selectedShopRows,keys,rows);
                    if(selectShopType==1){
                        rows.map((selectItem,i)=>{//选中添加 新增
                            if(selectedShopRowKeys.indexOf(selectItem.id)<0){//选中项中包含该商品
                                selectedShopRows.push(selectItem);
                            }
                        });

                        selectedShopRowKeys.map((rowKey,i)=>{//取消选中 删除
                            if(keys.indexOf(rowKey)<0){//
                                let index=0;
                                (selectedShopRows||[]).map((item,j)=>{
                                    if(item.id==rowKey){
                                        index=j
                                    }
                                });
                                selectedShopRows.splice(index,1);
                            }
                        });


                        dispatch({
                            type: 'OrderAdd/updateState',
                            payload: {
                                selectedShopRowKeys: keys,
                                selectedShopRows
                            },
                        })
                    }

                },
            },
        };

        //第一步需要的prop参数
        const step0Props={
            wareHousesTrees,
            wareHouseId,
            tagLineId,
            shopModalVisible,
            shopStatusColorConfig,
            selectedShopRowKeys,
            selectedShopRows,
            current,
            selectShopType,
            ShopStatusSelect
        };


        //第二步需要的prop参数

        // const step1Props={
        //     dispatch,
        //     wareHouseId,
        //     tagLineId,
        //     templateTrees,
        //     deliveryDates,
        //     selectedShopRows,
        //     template,
        //     deliveryDate
        // }

        //第三步需要的prop参数
        const step1Props={
            dispatch,
            loading,
            wareHousesTrees,
            wareHouseId,
            tagLineId,
            deleveryType,//配送方式集合
            GoodsClassifySelects,
            activeLineDetail,

            templateTrees,
            template,
            selectedShopRows,
            deliveryDates,
            deliveryDate,
            templateGoods,
            templateGoodsSelectsKeys,
            selectGoodsModalVisible,
            selectGoodsList,
            selectGoodsPagination,
            selectGoodsBySelf,
            current,

            selectTemplateModalVisible
        };

        //第四步需要的prop参数
        const step2Props={
            dispatch,
            selectedShopRows,
            current
        };




        //每一个步骤的具体内容
        const stepsContent=[
            <Step0 {...step0Props}
                   {...shopDialogListsProps}
            />,
            <Step1 {...step1Props}/>,
            <Step2 {...step2Props}/>,
        ];


        return (
            <div ref={(wraper)=>{this.wraper=wraper}}>
                <Card bordered={true}
                      className={styles.card}
                      ref={card=>this.card=card}
                >
                    {/*步骤条*/}
                    <Steps current={current}>
                        <Step title="店铺选择" description="" />
                        {/*<Step title="订单配置" description="" />*/}
                        <Step title="新增商品" description="" />
                        <Step title="订单完成" description="" />
                    </Steps>

                    {/*每一个步骤条对应的内容*/}
                    <div className="steps-content" style={{padding:'40px 0 20px 0'}}>
                        {stepsContent[current]}
                    </div>

                    {/*下面对应的操作*/}
                    <div className="steps-action"
                         style={{textAlign:'center',padding:'20px'}}
                    >
                        {/*{*/}
                            {/*current === stepsContent.length - 1  &&*/}
                            {/*<Button type="primary"*/}
                                    {/*style={{ margin: '20px'}}*/}
                                    {/*onClick={() => message.success('Processing complete!')}>完成</Button>*/}
                        {/*}*/}
                    </div>
                </Card>
            </div>
        );
    }
}

export default connect(({
                            app,
                            OrderAdd,
                            loading,
                            dispatch,
                            location}) => ({app,OrderAdd, loading,dispatch,location}))(OrderAdd)

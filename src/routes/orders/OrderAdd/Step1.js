import {
    Row,
    Col,
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Button,
    Table,
    message,
    Radio
} from 'antd';

import React, {PureComponent, Component} from 'react';

import DeleteBtn from 'components/Operations/DeleteBtn.js';
const FormItem = Form.Item;
const Option = Select.Option;

import Step1SelectTemplateDialog from './Step1SelectTemplateDialog'
// import Step1SelectGoodsDialog from './Step1SelectGoodsDialog'
import Step1SelectGoodsDialog from 'routes/commodity/OrderTemplate/SelectGoodsDialog'


import styles from './index.less';

const {
    moment
} = window;

class Step1 extends PureComponent {
    state = {

    };

    componentDidMount() {

        const {
            dispatch,
            template,
            tagLineId,
            selectedShopRows,
            form: {
                getFieldValue
            }
        } = this.props;


        dispatch({//获取商品分类列表  供选择
            type: 'app/getGoodsClassifySelect',
        });

        //根据第一步选择的路线 调取可选的送货日期
        dispatch({
            type:'OrderAdd/getDeliveryDateByTagline',
            payload:{
                // wareHouseId,
                lineId:tagLineId
            }
        });

        //根据第一步选择的路线 调取已选路线的送货方式
        dispatch({
            type:'OrderAdd/getDeliveryTypeByTagline',
            payload:{
                // wareHouseId,
                id:tagLineId
            }
        });

        // dispatch({
        //     type:'OrderAdd/queryGoods',
        //     payload:{
        //         page: 1,
        //         pageSize: 10,
        //         up:true,
        //         sellMode: getFieldValue('sellModeId')
        //     }
        // });
    }
    getColumns(){
        const {
            dispatch,
            form,
            templateGoods
        }=this.props;

        const {
            getFieldDecorator
        }=form;

        const onPurchaseNumChange=(val,row)=>{
            const {
                step
            }=row;

            // let stepAccount =((Math.ceil(val / step)) *step) || 0;
            //
            // row.productNum = stepAccount;

            row.productNum = val;
            dispatch({
                type:'OrderAdd/updateState',
                payload:{
                    templateGoods
                }
            });

        };

        const columns = [
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
                title: '商品名称',
                key: 'name',
                // width: 64,
                render:(row)=>{
                    return row['name']||row.productName;
                },
            },
            {
                title: '商品编号',
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: '规格',
                // dataIndex: 'spec',
                key: 'spec',
                render:(row)=>{
                    return row.spec||'-'
                }
            },
            {
                title: '最小购买单位',
                dataIndex: 'stockUnit',
                key: 'stockUnit',
            },
            {
                title: '购物车数量',
                key: 'productNum',
                render:(row,i,j)=>{
                    const {
                        productNum,
                        step
                    }=row;

                    const intStep=(value)=>{
                        // console.log('value:',value,'step:',step);
                        return ((Math.ceil(value/ step)) *step) || 0;
                    };

                    return <InputNumber placeholder=""
                                        min={0}
                                        value={productNum}
                                        onChange={(_e,_row)=>{onPurchaseNumChange(_e,row)}}
                                        // formatter={value=>intStep(value)}
                                        step={row.step}
                    />

                    // return <FormItem>
                    //     {getFieldDecorator(`templatesProductsDtoList[${j}[amount]]`, {
                    //         initialValue: row.amount||0,
                    //         rules: [
                    //             // {required: true, message: `购物车数量不能为空`},
                    //         ],
                    //     })(
                    //         <InputNumber placeholder=""
                    //                      min={0}
                    //                      onBlur={(_e,_row)=>{onPurchaseNumChange(_e,row)}}
                    //                      // formatter={value=>intStep(value)}
                    //                      // onChange={(_value,_row)=>{onPurchaseNumChange(_value,row)}}
                    //                      step={row.step}/>
                    //     )}
                    // </FormItem>
                },
            },
            {
                title: '单价',
                key: 'price',
                render:(row,i,j)=>{
                    return (row.price||0).toFixed(2)
                },
            },
            {
                title: '操作',
                key: 'operation',
                width: 100,
                render: (row,i,j) => {
                    return <div>
                        {/*订单模板牵扯店铺订货问题，取消删除功能*/}

                        <DeleteBtn  onClick={()=>{
                            this.deleteRows([row.id])
                        }}/>

                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`templatesProductsDtoList[${j}[productId]]`, {
                                initialValue: row.productId,
                                rules: [

                                ],
                            })(
                                <InputNumber placeholder=""/>
                            )}
                        </FormItem>
                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`templatesProductsDtoList[${j}[limit]]`, {
                                initialValue: row.limit,
                                rules: [

                                ],
                            })(
                                <InputNumber placeholder=""/>
                            )}
                        </FormItem>
                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`templatesProductsDtoList[${j}[name]]`, {
                                initialValue: row.name,
                                rules: [],
                            })(
                                <InputNumber placeholder=""/>
                            )}
                        </FormItem>
                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`templatesProductsDtoList[${j}[productNum]]`, {
                                initialValue: row.productNum,
                                rules: [],
                            })(
                                <InputNumber placeholder=""/>
                            )}
                        </FormItem>
                    </div>;
                },
            },
        ]

        return columns;
    }
    deleteRows(ids){//删除选中的商品
        const {
            dispatch,
            templateGoods,
            templateGoodsSelectsKeys,
        }=this.props;

        //要先删除行内商品数据 再删除rowSelection数据
        for(let i=templateGoods.length-1;i>-1;i--){
            const {
                id
            }=templateGoods[i];

            if(ids.indexOf(id)>-1){
                templateGoods.splice(i,1)
            }
        }

        for(let i=templateGoodsSelectsKeys.length-1;i>-1;i--){
            const itemId=templateGoodsSelectsKeys[i];
            if(ids.indexOf(itemId)>-1){
                templateGoodsSelectsKeys.splice(i,1)
            }
        }

        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                templateGoods,
                templateGoodsSelectsKeys
            }
        })
    }
    handleModalVisible = (flag) => {//设置选择商品弹框的modal的显示状态
        this.props.dispatch({
            type: `OrderAdd/updateState`,
            payload: {
                selectGoodsModalVisible: !!flag,
                selectGoodsBySelf:[]
            },
        })
    }
    onSelectGoodsPageChange=(page,query)=>{//选择商品弹框内页码发生变化
        const {

        }=this.state;

        this.props.dispatch({
            type: 'OrderAdd/queryGoods',
            payload: {
                ...query,
                page: page.current || 1,
                pageSize: page.pageSize || 10
            },
        })
    }
    handleSelectTemplateModalVisible = (flag)=>{ // 显示可选的模板的列表弹框
        this.props.dispatch({
            type: `OrderAdd/updateState`,
            payload: {
                selectTemplateModalVisible: !!flag,
            },
        })
    }
    prevStep=()=>{ //上一步
        const {
            dispatch,
            current
        }=this.props;

        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                current:current-1
            }
        });
    }
    // onAddGoods=()=>{//添加商品
    //     const {
    //         dispatch,
    //         templateGoods,
    //         selectGoodsBySelf
    //     }=this.props;
    //
    //     //将自选的商品加入到模板商品列表中
    //     dispatch({
    //         type:'OrderAdd/updateState',
    //         payload:{
    //             templateGoods:templateGoods.concat(selectGoodsBySelf)
    //         }
    //     });
    //
    //     this.handleModalVisible(false);//关闭弹框
    //
    // }
    createOrders(){//生成订单
        const {
            form,
            dispatch,
            wareHouseId,
            tagLineId,
            selectedShopRows,
            template,
            templateGoods,
            // deliveryDate
        }=this.props;

        form.validateFields((err, fieldsValue) => {
            if (err) return;
            let {
                logisticType,
                templatesProductsDtoList=[],
                deliveryDate
            }=fieldsValue;



            //商品列表中的每一项商品数量不能为0
            let allNotZero=templateGoods.every(good=>(good.productNum && good.productNum*1));


            if(!allNotZero){//每一件商品都必须非0
                message.error('请确保每一件商品的购物车数量不为0！');
            }else{
                //这里最好加上步长整数倍的判断
                // const isStepAdd = templateGoods.filter(item => {
                //     if(!item.step) {
                //         item.step = 1;
                //     };
                //     return item.productNum % item.step != 0;
                // });
                // log(isStepAdd)
                // if(isStepAdd.length) {
                //     message.warn(`请确保手动勾选的商品（${isStepAdd[0].goodsName}）规格（${isStepAdd[0].spec}），购物车数量必须是（${isStepAdd[0].step}）的倍数！`);
                //     return;
                // }

                const orderCartAddDtoList=[];
                // console.log(templateGoods);
                (templateGoods||[]).map((good)=>{
                    if(good){
                        orderCartAddDtoList.push({productId:good.productId,amount:good.productNum, proSpecId: good.proSpecId});
                    }
                });

                if(!orderCartAddDtoList.length){
                    message.warn('请添加商品！');
                    return;
                }

                //2s后默认设置为非正在提交状态
                setTimeout(()=>{
                    dispatch({
                        type:`OrderAdd/updateState`,
                        payload:{
                            isSubmintingOrder:false
                        }
                    });
                },2000);

                const params ={
                    warehouseId:wareHouseId,
                    lineId:tagLineId,
                    shopIdList:(selectedShopRows||[]).map(shop=>shop.id),
                    // recommendId:template.id,
                    ...deliveryDate && {pathDay: moment(deliveryDate).format('YYYY-MM-DD')},
                    // arrangementId:deliveryDate.arrangementId,
                    orderCartAddDtoList,//productId  amount
                    logisticType,//配送方式
                }

                // console.log('params:',params);
                dispatch({
                    type:`OrderAdd/createOrders`,
                    payload:{
                        ...params
                    }
                });
            }
        });
    }
    onDeliveryDateChange(val){//送货路线单选切换
        const {
            dispatch,
            form
        }=this.props;

        window.setTimeout(()=>{
            dispatch({
                type:'OrderAdd/updateState',
                payload:{
                    deliveryDate:window.JSON.parse(val)
                }
            })
        },10)

    }

    onAddGoods=(selectGoodsBySelf)=>{
        // console.log(selectGoodsBySelf);
        const {
            form,
            dispatch,
            // selectGoodsBySelf,
            handleModalVisible,
            // rowSelection:{
            //     selectedRowKeys
            // },
            templateGoods,
            pagination
        } = this.props;
        // return log(selectGoodsBySelf)
        // const {
        //     getFieldValue
        // }=form;

        // const formKeyName =this.state.tableFormName ;

        //弹框中可选的商品
        // const canSelectGoodsList=getFieldValue(formKeyName);
        // console.log('getFieldsValue:"',form.getFieldsValue());

        //已经选中的商品
        // const selectedGoods = selectGoodsBySelf.filter(item => item.needCheckNum);
        // console.log(selectGoodsBySelf)

        const isEveryNotZero = selectGoodsBySelf.every(item => item && item.productNum > 0 );

        // console.log('canSelectGoodsList:' , canSelectGoodsList , 'selectedGoods:',selectedGoods ,'selectedRowKeys:',selectedRowKeys);

        if(!isEveryNotZero){
            message.warn('请确保手动勾选的商品填写了商品数量！');
            return;
        }

        // const isStepAdd = selectGoodsBySelf.filter(item => {
        //     if(!item.step) {
        //         item.step = 1;
        //     };
        //     return item.productNum % item.step != 0;
        // });

        // if(isStepAdd.length) {
        //     message.warn(`请确保手动勾选的商品（${isStepAdd[0].goodsName}）规格（${isStepAdd[0].spec}），购物车数量必须是（${isStepAdd[0].step}）的倍数！`);
        //     return;
        // }

        //对弹框中的数据和列表中的数据进行组装
        // (selectGoodsBySelf||[]).map((select,i)=>{
        //     // selectedGoods.map((s,i)=>{
        //         if(select.id == s.id){
        //             selectedGoods[i]={
        //                 ...select,
        //                 ...s,
        //                 productNum:s.productNum
        //             }
        //         }

        //     // })
        // });


        // console.log('canSelectGoodsList:' , canSelectGoodsList ,'selectedGoods:', selectedGoods );
        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                templateGoods:templateGoods.concat(selectGoodsBySelf.map(val => {
                    val.proSpecId = val.id
                    return val
                }))
            }
        });
        this.handleModalVisible(false);

    }

    changeOrderType = e => { // 切换订单类型
        const {
            dispatch
        } = this.props

        dispatch({
            type: 'OrderAdd/updateState',
            payload: {
                templateGoods: []
            }
        })
    }

    render() {
        const {
            dispatch,
            loading,
            form,
            wareHousesTrees,
            wareHouseId,
            tagLineId,

            GoodsClassifySelects,


            templateTrees,
            template,
            selectedShopRows,
            deliveryDate,
            deleveryType,//从app model中调用的送货安排数据
            activeLineDetail,


            templateGoods,
            templateGoodsSelectsKeys,
            selectGoodsModalVisible,

            selectGoodsList,
            selectGoodsPagination,
            selectGoodsBySelf=[],
            deliveryDates=[],

            selectTemplateModalVisible,
        } = this.props;

        const {
            handleModalVisible,
            handleSelectTemplateModalVisible
            // onAddGoods
        } = this;

        const {
            setFieldsValue,
            getFieldDecorator,
            getFieldValue
        } = form;

        //模板商品列表的rowSelection
        const templateGoodsRowSelection={
            selectedRowKeys:templateGoodsSelectsKeys,
            onChange: (keys) => {
                dispatch({
                     type: 'OrderAdd/updateState',
                     payload: {
                         templateGoodsSelectsKeys: keys,
                     },
                })
            },
        };

        // 新增商品弹框中使用的方法
        const parentMethods={
            // onAddGoods,
            handleModalVisible,
            dispatch,
        };

        //订单模板中已经有的商品（剔除掉在本页面手动删除掉的页面）
        const templateGoodsKeys=(templateGoods||[]).map((good,i)=>{
            return good.productId +'';
        });

        //动态计算手动添加的商品列表
        const selectGoodsKeysBySelf=(selectGoodsBySelf||[]).map((good,i)=>{
            return good.id + '';
        });

        //送货日期可选列表radio
        const DeliveryDateOptions=(deliveryDates||[]).map((timeObj,i)=>{
            const {
                day,
                arrangementId
            }=timeObj;

            return <Option style={{display:'block'}}
                          key={arrangementId+day}
                          value={window.JSON.stringify(timeObj)}>{day}
            </Option>
        });

        //所有的送货方式列表
        const DeliveryTypesOptions = (Object.keys(deleveryType)||[]).map((id)=>{
            return <Option key={id+deleveryType[id]}
                           value={id+''}>
                {deleveryType[id]}
            </Option>
        });

        //弹框列表中需要的参数
        const dialogListProps={//表格列表 分页改变 删除数据 编辑数据 多选功能
            sellModeId: getFieldValue('sellModeId'),
            list: selectGoodsList,
            loading: loading.effects['OrderAdd/queryGoods'],
            pagination:selectGoodsPagination,
            selectGoodsBySelf,
            selectedShopRows,
            templateGoods,
            modelName: 'OrderAdd',
            // noShopCar: true,
            cartNum: true,
            onClickOk: this.onAddGoods,
            // onSelect(keys,selected) {
            //     // return console.log(keys, selected)
            //     dispatch({
            //         type: 'OrderAdd/updateState',
            //         payload: {
            //             selectGoodsBySelf,
            //             selectedRowKeys:keys
            //         },
            //     })
            // },
            onChange:this.onSelectGoodsPageChange,
            rowSelection: {
                selectedRowKeys:(templateGoodsKeys||[]).concat(selectGoodsKeysBySelf||[]),
                getCheckboxProps: record =>{//对于模板列表中已经有的商品，列表中不需要做删除操作
                    return {
                        disabled: templateGoodsKeys.indexOf(record.id + '')>=0, // 该行会被禁止掉选中操作
                    }
                },
                onSelect:(record, selected)=>{

                },
                onChange: (keys,selected) => {


                    (selected||[]).map((selectRow,i)=>{//手动添加商品
                        const {
                            id
                        }=selectRow;

                        //数据转换
                        selectRow.productId=id+'';
                        selectRow.id=id+'';
                        selectRow.productNum=0;


                        if(templateGoodsKeys.indexOf(id + '')<0){
                            selectGoodsBySelf.push(selectRow)
                        };

                        //手动选中的商品  默认加上步长的数量
                        if(!selectRow.productNum){
                            selectRow.productNum = selectRow.step || 1;
                        }

                    });
                    // console.log('selected:',selected,keys,'selectGoodsBySelf:',selectGoodsBySelf);

                    for(let i=selectGoodsBySelf.length-1 ;i>-1;i--){
                        let row= selectGoodsBySelf[i];
                        // const _keys=(selected || []).map((_s)=>{
                        //     return _s.id + '';
                        // })
                        if(keys.indexOf(row.productId+'')<0){//
                            selectGoodsBySelf.splice(i,1)
                        }
                    }
                    // console.log('selectGoodsBySelf:',selectGoodsBySelf);
                    //
                    dispatch({
                        type: 'OrderAdd/updateState',
                        payload: {
                            selectGoodsBySelf,
                            selectedRowKeys:keys
                        },
                    })
                },
            },
        };

        return (
            <div className={styles.step2}>
                <Row>
                    <Card>
                        <Row>
                            <Col span={8}>
                                {/*<p className={styles.normalMsg}>*/}
                                    {/*<label>仓库:</label>*/}
                                    {/*<span>{wareHousesTrees[wareHouseId].name}</span>*/}
                                {/*</p>*/}
                                <FormItem label="仓库" labelCol={{span:10}} wrapperCol={{ span:14 }}>
                                    {getFieldDecorator('wareHouseId', {
                                        initialValue: '',
                                    })(
                                        <span>{activeLineDetail && activeLineDetail.wareHouseVoList?activeLineDetail.wareHouseVoList[0].name:''}</span>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <p className={styles.normalMsg}>
                                    <label>路线名称：</label>
                                    <span>{activeLineDetail?activeLineDetail.name :''}</span>
                                </p>
                            </Col>
                            <Col span={8}>
                                <p className={styles.normalMsg}>
                                    <label>已选商家：</label>
                                    <span>{selectedShopRows.length || 0}家</span>
                                </p>
                            </Col>
                        </Row>
                        <Row>
                            {/*<Col span={6}>*/}
                                {/*<p className={styles.normalMsg}>*/}
                                    {/*<label>订单模板：</label>*/}
                                    {/*<span>{template && template.name}</span>*/}
                                {/*</p>*/}
                            {/*</Col>*/}
                            <Col span={6}>
                                {/*<p className={styles.normalMsg}>*/}
                                    {/*<label>送货日期：</label>*/}
                                    {/*<span>{deliveryDate && deliveryDate.day}</span>*/}
                                {/*</p>*/}
                                <FormItem label="送货日期" labelCol={{span:10}} wrapperCol={{ span:14 }}>
                                    {getFieldDecorator('deliveryDate', {
                                        initialValue: '',
                                        rules: [
                                            {required: !!(+getFieldValue('sellModeId') === 0), message: `送货日期不能为空`},
                                        ],
                                    })(
                                        <DatePicker style={{width: '100%'}}
                                                    disabledDate={(current)=>{return current && current.valueOf() < new Date().setDate( (new Date()).getDate()-1 );}}
                                                    showToday={false}
                                                    format={'YYYY-MM-DD'}/>

                                        // <Select style={{width:'100%'}} onChange={(_e)=>{this.onDeliveryDateChange(_e)}}>
                                        //     {DeliveryDateOptions}
                                        // </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6} offset={1}>
                                <FormItem label="订单类型" labelCol={{span:10}} wrapperCol={{ span:14 }}>
                                    {getFieldDecorator('sellModeId', {
                                        initialValue: '0'
                                    })( <Select placeholder="订单类型"
                                                onChange={()=>{this.changeOrderType()}}
                                                style={{width: "100%"}}
                                        >
                                            <Option value="0">正常</Option>
                                            <Option value="1">预售</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6} push={1}>
                                <FormItem label="送货方式" labelCol={{span:10}} wrapperCol={{ span:14 }}>
                                    {getFieldDecorator('logisticType', {
                                        initialValue: activeLineDetail.ftype+'',
                                        rules: [
                                            {required: true, message: `配送方式不能为空`},
                                        ],
                                    })(
                                        <Select style={{width:'100%'}} onChange={(_e)=>{}}>
                                            {DeliveryTypesOptions}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Card>
                </Row>

                <Row style={{margin:'15px auto'}}>
                    <Col span={24} style={{textAlign:'right'}}>
                        {+getFieldValue('sellModeId') === 0 && <Button type={'primary'}
                                onClick={()=>{this.handleSelectTemplateModalVisible(true)}}
                                style={{margin:'0 15px'}}
                        >载入订货模板商品</Button>}

                        <Button type={'primary'}
                                onClick={()=>{this.handleModalVisible(true)}}
                        >新增商品</Button>
                    </Col>
                </Row>

                {
                    templateGoodsSelectsKeys.length ? <Row style={{margin:'15px auto'}}>
                        <Col span={12}>
                            <p>已选择 <span>{templateGoodsSelectsKeys.length}</span>条数据
                                <Button type={'primary'}
                                        style={{margin:'0 10px'}}
                                        size={'small'}
                                        onClick={(_selected)=>{this.deleteRows(templateGoodsSelectsKeys)}}
                                >删除？</Button>
                            </p>
                        </Col>

                    </Row>:null
                }


                <div>
                    <Table className={styles.smallTable}
                           dataSource={(templateGoods || []).map(val => {
                               val.name = val.goodsName || val.name
                               return val
                           })}
                           columns={this.getColumns()}
                           bordered
                           pagination={false}
                           rowKey={record => record.id}
                           rowSelection={templateGoodsRowSelection}
                        // scroll={{ x: 1250 }}
                           simple>

                    </Table>
                </div>

                {/*底部返回和下一步操作区域*/}
                <div style={{textAlign: 'center', padding: '20px'}}>
                    <Button style={{margin: '10px'}}
                            onClick={() => this.prevStep()}> 上一步</Button>
                    <Button style={{margin: '10px'}}
                            type={'primary'}
                            onClick={() => this.createOrders()}> 生成订单</Button>
                </div>

                {
                    selectTemplateModalVisible && <Step1SelectTemplateDialog modalVisible={selectTemplateModalVisible}
                                                                             dispatch={dispatch}
                                                                             handleModalVisible={handleSelectTemplateModalVisible}
                                                                             selectedShopRows={ selectedShopRows}
                                                                             tagLineId={tagLineId}
                                                                             templateTrees={templateTrees}
                                                                             template={template}

                    />
                }
                {selectGoodsModalVisible &&
                <Step1SelectGoodsDialog modalVisible={selectGoodsModalVisible}
                                        {...parentMethods}
                                        {...dialogListProps}
                                        taglineIdList={[tagLineId]}
                                        GoodsClassifySelects={GoodsClassifySelects}

                />}
            </div>
        );
    }
}

export default Form.create(({ loading}) => ({loading}))(Step1);

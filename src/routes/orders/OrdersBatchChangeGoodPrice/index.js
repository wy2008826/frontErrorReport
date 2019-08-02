import React, {Component} from 'react';
import { Link } from 'react-router-dom';

import {
    Card,
    Row,
    Col,
    Tag,
    Select,
    Input,
    InputNumber,
    Button,
    Table,
    Form,
    Icon,
    message
} from 'antd';


const Search = Input.Search
const FormItem = Form.Item;


import {connect} from "dva";

import styles from './index.less';

import ChangePriceDialog from './ChangePriceDialog';
import ConfirmSubmitChangedRow from './ConfirmSubmitChangedRow';

const modelName='OrdersBatchChangeGoodPrice';



class OrdersBatchChangeGoodPrice extends Component {
    state = {
        headWidth:'400px'
    }

    componentDidMount() {
        const {
            dispatch,
            OrdersBatchChangeGoodPrice
        }=this.props;

        const {
            orderIds
        } = OrdersBatchChangeGoodPrice;



        //根据订单ID组获取左侧的商品列表
        dispatch({
            type:`${modelName}/getLeftGoods`,
            payload:{
                // orderIds
            }
        });

        this.setState({
            headWidth:this.card.container.offsetWidth+'px'
        })
    }
    componentWillUnmount(){

        this.props.dispatch({
            type:`${modelName}/clearOrderIds`
        });

        //resetModel
        this.props.dispatch({
            type:`${modelName}/resetModel`
        });

    }
    getFieldName=()=>{//获取当前的表单域的字段名
        const {
            OrdersBatchChangeGoodPrice
        }=this.props;


        const {
            leftActiveGood={},
            pagination,
        }=OrdersBatchChangeGoodPrice;

        const fieldName = `${leftActiveGood?leftActiveGood.productId:'empty'}-${pagination.current||1}-fieldsList`;

        return fieldName;

    }
    onPageChange=(page)=>{//页码发生变动
        console.log(this.props.OrdersBatchChangeGoodPrice);
        const productId = this.props.OrdersBatchChangeGoodPrice.leftActiveGood.productId;
        console.log(productId);

        this.props.dispatch({
            type: `${modelName}/getSingleGoodShops`,
            payload: {
                productId,
                page: page.current || 1,
                pageSize: page.pageSize || 10
            },
        })
    }
    selectLeftGood = (leftClickGood)=>{//选择左侧的商品
        // 需要检测上一个激活态的商品有没有未保存的结算价  如果未保存  需要弹框提示并保存
        const {
            dispatch,
            form:{
                getFieldDecorator,
                getFieldsValue,
                getFieldValue
            },
            OrdersBatchChangeGoodPrice,
        }=this.props;

        const {
            leftActiveGood,
            pagination:{
                current
            },
            list,
        } = OrdersBatchChangeGoodPrice;

        if(leftActiveGood){

            const {
                ...rest
            } = getFieldsValue();

            //右侧列表中的数据
            const fieldsList = rest[this.getFieldName()];

            // 右侧输入的数据和原始数据作比对  如果有存在不一样的  说明被修改过  需要提示是否保存

            //这里只筛选右侧有数据 并且和原始数据不一致 并且和商品单价不一致的行 更新过的话和finalProductPrice作比对 没更新过和productPrice作比对
            let hasChangedRows=(list || []).filter((shopGood,i)=>{

                const {
                    productPrice,
                    priceIsUpdate,
                    finalProductPrice
                }=shopGood;

                return fieldsList[i].finalProductPrice &&  ( priceIsUpdate? (finalProductPrice !=fieldsList[i].finalProductPrice) :(productPrice !=fieldsList[i].finalProductPrice) );
            });

            if(hasChangedRows.length){

                this.handleModalVisible('confirmSubmitModalVisible',true);
                dispatch({
                    type:`${modelName}/updateState`,
                    payload:{
                        forwardButNotActiveLeftGood:leftClickGood
                    }
                })
                return ;
            }
        }


        //获取商品对应的店铺列表
        dispatch({
            type:`${modelName}/getSingleGoodShops`,
            payload:{
                productId:leftClickGood.productId,
                page:1
            }
        });

        dispatch({
           type:`${modelName}/updateState`,
           payload:{
               leftActiveGood:leftClickGood
           }
        })
    }
    handleModalVisible=(key,flag,forwardLeftGood)=>{//设置modal弹框的展示状态
        const {
            dispatch,
            OrdersBatchChangeGoodPrice,
            form:{
                getFieldDecorator,
                getFieldsValue,
                getFieldValue,
                setFieldsValue
            },
        }=this.props;

        const {
            forwardButNotActiveLeftGood,
            list=[]
        }=OrdersBatchChangeGoodPrice;

        //如果点击不保存   清空临时填写的结算价
        if(key=='confirmSubmitModalVisible' && !flag){
            const {
                ...rest
            } = getFieldsValue();

            //右侧列表中的数据
            const fieldsList = rest[this.getFieldName()];

            // 右侧输入的数据和原始数据作比对  如果有存在不一样的  说明被修改过  需要提示是否保存

            //这里只筛选右侧有数据 并且和原始数据不一致 并且和商品单价不一致的行 更新过的话和finalProductPrice作比对 没更新过和productPrice作比对
            (list || []).map((shopGood,i)=>{

                const {
                    productPrice,
                    priceIsUpdate,
                    finalProductPrice
                }=shopGood;

                const isChanged= fieldsList[i].finalProductPrice &&  ( priceIsUpdate? (finalProductPrice !=fieldsList[i].finalProductPrice) :(productPrice !=fieldsList[i].finalProductPrice) );
                if(isChanged){
                    fieldsList[i].finalProductPrice=''
                }
            });

            setFieldsValue({
                [this.getFieldName()]:fieldsList
            });

            this.selectLeftGood(forwardButNotActiveLeftGood)
        }


        dispatch({
            type:`${modelName}/updateState`,
            payload:{
                [key]:!!flag
            }
        });
    }
    handleChangePriceModalSubmit=(fields)=>{//点击批量更改价格的确认按钮 修改输入框的值  而不是list源数据
        const {
            form:{
                getFieldsValue,
                setFieldsValue
            },
            OrdersBatchChangeGoodPrice
        }=this.props;

        const {
            list
        }=OrdersBatchChangeGoodPrice;

        const fieldName = this.getFieldName();

        const fieldsValue = getFieldsValue();


        //批量修改输入框域中的数值
        (fieldsValue[fieldName]||[]).map((item,i)=>{
            fieldsValue[fieldName][i]['finalProductPrice']=fields.finalProductPrice
        });

        setFieldsValue({
            ...fieldsValue
        });

        this.handleModalVisible('changePriceModalVisible',false);

    }
    submitPage = (saveType)=>{//提交修改后的结算价格 确保每一个有内容的价格要一致  type 1 仅仅保存  2 保存并同步修改商品价格
        const {
            dispatch,
            form:{
                getFieldsValue,
                setFieldsValue
            },
            OrdersBatchChangeGoodPrice
        }=this.props;

        const {
            leftActiveGood,
            orderIds,
            list
        }=OrdersBatchChangeGoodPrice;

        const fieldName = this.getFieldName();

        const fieldsValue = getFieldsValue();

        //修改过结算价的订单列表
        const orderCartProductUpdateDtoList=[];
        const finalPrices=[];

        (fieldsValue[fieldName]||[]).map((rowShop,i)=>{//筛选出输入了结算价的店铺
            const {
                shopId,
                finalProductPrice,
                orderCartId
            }=rowShop;

            if(finalProductPrice){
                orderCartProductUpdateDtoList.push({
                    // shopId,
                    finalProductPrice,
                    orderCartId
                });
                finalPrices.push(finalProductPrice);
            }
        });




        if(finalPrices.length){//有更改的内容在提交
            if(saveType == 2 && finalPrices.some(item => item!=finalPrices[0])){
                message.warn('请确保每一条订单的结算价格一致!');
                return ;
            }

            const params ={
                // orderIds,
                orderCartProductUpdateDtoList,
                productId:leftActiveGood.productId,
                saveType
            };

            console.log('fieldsValue',fieldsValue,'params:',params);

            dispatch({
                type:`${modelName}/submitPage`,
                payload:{
                    ...params
                }
            })
        }

    }
    getColumns(){
        const {
            form,
            OrdersBatchChangeGoodPrice
        }=this.props;

        const {
            getFieldDecorator
        }=form;

        const {
            leftActiveGood={},
            pagination,
        }=OrdersBatchChangeGoodPrice;


        const fieldName = this.getFieldName();


        const columns = [
            {
                title: '订单编号',
                dataIndex: 'orderCode',
                key: 'orderCode',
            },
            {
                title: '店铺名称',
                dataIndex: 'shopName',
                key: 'shopName',
            },
            {
                title: '下单数量',
                dataIndex: 'finalProductNum',
                key: 'finalProductNum',
            },
            {
                title: '商品单价',
                dataIndex: 'productPrice',
                key: 'productPrice',
            },
            {
                title: '结算价',
                key: 'finalProductPrice',
                render:(row,i,j)=>{
                    return  <div>
                        <FormItem>
                            {getFieldDecorator(`${fieldName}[${j}[finalProductPrice]]`, {
                                initialValue:row.priceIsUpdate? row.finalProductPrice:'',
                                rules: [
                                    // {required: true, message: `购物车数量不能为空`},
                                ],
                            })(
                                <InputNumber placeholder="请输入结算价"
                                             min={0}
                                             style={{minWidth:'110px'}}
                                />
                            )}
                        </FormItem>

                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`${fieldName}[${j}[productId]]`, {
                                initialValue: row.productId,
                                rules: [

                                ],
                            })(
                                <InputNumber placeholder=""/>
                            )}
                        </FormItem>

                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`${fieldName}[${j}[orderCartId]]`, {
                                initialValue: row.orderCartId,
                                rules: [],
                            })(
                                <InputNumber placeholder=""/>
                            )}
                        </FormItem>

                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`${fieldName}[${j}[price]]`, {
                                initialValue: row.price,
                                rules: [

                                ],
                            })(
                                <InputNumber placeholder=""/>
                            )}
                        </FormItem>

                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`${fieldName}[${j}[shopId]]`, {
                                initialValue: row.shopId,
                                rules: [

                                ],
                            })(
                                <InputNumber placeholder=""/>
                            )}
                        </FormItem>
                    </div>
                },
            },
        ]

        return columns;
    }
    render() {

        const {
            selectLeftGood,
            handleModalVisible,
            handleChangePriceModalSubmit,
            submitPage,
            onPageChange
        }=this;


        const {
            form:{
                getFieldDecorator,
                getFieldsValue,
                getFieldValue
            },
            app={},
            OrdersBatchChangeGoodPrice,
            loading
        }=this.props;

        // console.log('getFieldsValue:',getFieldsValue());

        let {
            leftAllGoods=[],
            leftActiveGood,//左侧激活的商品
            list=[],//激活的商品下面的店铺列表
            pagination,

            changePriceModalVisible,
            confirmSubmitModalVisible,
        }=OrdersBatchChangeGoodPrice;


        //筛选出来的商品列表
        const leftSearch = getFieldValue('leftSearch') || '';
        const leftFilterGoods = (leftAllGoods||[]).filter((good)=>{
            return good.productName.search( leftSearch )>-1 || good.productCode.search( leftSearch )>-1
        });

        //筛选出来的li列表
        const leftFilterGoodsItems = (leftFilterGoods||[]).map((good)=>{
            const {
                productCode,
                productName,
                priceIsUpdate
            } = good;

            return <li key={productCode}
                       className={leftActiveGood && leftActiveGood.productCode == productCode ? styles.active:''}
                       onClick={()=>{selectLeftGood(good)}}
            >
                { `${productCode}-${productName}` }
                {/*{*/}
                    {/*priceIsUpdate  && <Icon type="check-circle-o" />*/}
                {/*}*/}
            </li>
        });


        const rightListsHasChangedPriceAll =!(( list||[]).filter(item => !item.priceIsUpdate)).length;

        return (
            <Card title={'批量改价'} ref={card=>this.card=card} >
                <Row>
                    <h5 className={styles.leftHeader}>待审核-订单商品汇总</h5>

                    {/*左侧商品列表区域*/}
                    <div className={styles.allWraper}>
                        <div className={styles.leftWraper}>
                            <div style={{padding:'0 10px'}}>
                                {getFieldDecorator('leftSearch', {
                                    initialValue: '' ,
                                    rules: [
                                    ]
                                })(<Search placeholder={'请输入商品名称/编号'}/>)}
                            </div>
                            <ul>
                                {leftFilterGoodsItems}
                            </ul>
                            <p className={styles.leftFooter}>
                                {`${leftAllGoods.length}条`}
                            </p>
                        </div>

                        {/*右侧针对左侧商品对应的店铺列表区域*/}
                        <div className={styles.rightWraper}>
                            <Row>
                                <Col span={12}>
                                    {
                                        leftActiveGood && <Tag color={rightListsHasChangedPriceAll ?'orange':''}>
                                            {rightListsHasChangedPriceAll?'已改价':'未改价'}
                                        </Tag>
                                    }

                                    <label style={{fontSize:'14px'}}>{leftActiveGood && `${leftActiveGood.productCode}-${leftActiveGood.productName}`}</label>
                                </Col>
                                <Col span={12} style={{textAlign:'right'}}>
                                    <Tag  color={"#f50"} onClick={()=>{handleModalVisible('changePriceModalVisible',true)}}>
                                        批量设置结算价
                                    </Tag>
                                </Col>
                            </Row>
                            <Table  className={styles.smallTab} dataSource={list||[]}
                                    style={{marginTop:'15px'}}
                                    columns={this.getColumns()}
                                    bordered
                                    rowKey={record => record.id}
                                    loading={loading.effects[`${modelName}/getSingleGoodShops`]}
                                    pagination={false }
                                    onChange={onPageChange}
                                    simple
                            />
                        </div>
                    </div>
                </Row>
                <div className={styles.bottomFixed} style={{width:this.state.headWidth}}>
                    <Button type={'default'} >
                        <a href="/#/orders"> 取消 </a>
                    </Button>
                    {/* <Button type={'primary'}
                            style={{margin:'0 20px'}}
                            onClick={()=>{this.submitPage(2)}}
                    >
                        保存并同步至订货价
                    </Button> */}
                    <Button type={'primary'}
                            onClick={()=>{this.submitPage(1)}}
                    >
                        保存
                    </Button>
                </div>

                {
                    changePriceModalVisible &&  <ChangePriceDialog modalVisible={changePriceModalVisible}
                                                                   handleModalVisible={handleModalVisible}
                                                                   handleChangePriceModalSubmit={handleChangePriceModalSubmit}
                    />
                }

                {
                    confirmSubmitModalVisible && <ConfirmSubmitChangedRow modalVisible={confirmSubmitModalVisible}
                                                                          handleModalVisible={handleModalVisible}
                                                                          handleChangePriceModalSubmit={handleChangePriceModalSubmit}
                                                                          submitPage={submitPage}
                    />
                }
            </Card>
        )
    }
};

export default connect(({
                            app,
                            OrdersBatchChangeGoodPrice,
                            dispatch,
                            loading
}) => ({app,OrdersBatchChangeGoodPrice,dispatch,loading}))(Form.create({})(OrdersBatchChangeGoodPrice));

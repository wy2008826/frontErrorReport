import {
    Row,
    Col,
    Form,
    Input,
    Select,
    Modal,
    Radio,
    InputNumber,
    Card,
    Table,
    Button,
    message
} from 'antd';

import React, {PureComponent,Component, Fragment} from 'react';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const Search = Input.Search

import styles from './index.less';



class SelectGoodsDialog extends Component {
    state = {
        formValues: {},
        tableFormName:'',//canSelectGoodsList
    };


    componentDidMount(){
        const {

        }=this.state;

        const {
            dispatch,
            taglineIdList,
            tag_warehouse
        }=this.props;


        this.handleSearch();//页面加载既需要加载所需的数据

    }
    componentWillReceiveProps(props){
        const {
            pagination
        }=props;

        //每次接收props的时候更新tableformName   避免进入弹框后的第一页表单数据 和直接搜索的第一页数据导致冲突
        this.setState({
            tableFormName:'canSelectGoodsList'+pagination.current +'-'+ new Date()*1
        });
    }
    onAddGoods() {//添加完商品后需要处理表单中的商品数据
        const {
            form,
            detail={},
            dispatch,
            handleSelectGoodsModalVisible,
            rowSelection:{
                selectedRowKeys
            },
            dataSource,//弹框中的内容
            pagination,
        } = this.props;

        const {
            getFieldValue
        }=form;

        //弹框中可选的商品
        const formKeyName =this.state.tableFormName;
        const canSelectGoodsList=getFieldValue(formKeyName);

        //已经选中的商品
        const selectedGoods = canSelectGoodsList.filter(item => item.needCheckNum);


        const isEveryNotZero = selectedGoods.every(item => item && item.productNum > 0 );

        // console.log('canSelectGoodsList:' , canSelectGoodsList , 'selectedGoods:',selectedGoods ,'selectedRowKeys:',selectedRowKeys);


        if(!isEveryNotZero){
            message.warn('请确保手动勾选的商品填写了商品数量！');
            return;
        }
        //需要将选中的数据挑选出来   进行比对添加

        if(!selectedGoods.length){
            handleSelectGoodsModalVisible(false, null)
        }else{
            dispatch({
                type:'OrderDetail/addGood',
                payload:{
                    selectedGoods
                }
            })
        }

    }
    handleSearch=(page={})=>{//搜索功能
        const {
            detail={},
            form,
            dispatch,
            sellModeId
        } = this.props;

        const {
            statusId,
            lineId
        }=detail;


        dispatch({
            type:'OrderDetail/queryGoods',
            payload:{
                page:page.current || 1,
                pageSize:page.pageSize || 10,
                // shopId:detail.shopId,
                // tempId:detail.tempTypeMapVo && detail.tempTypeMapVo.id,
                statusId,//店铺状态
                tagLineIds:[lineId],
                name:form.getFieldValue('name')||'',
                up:true,
                sellModeId
            }
        })
    }
    onPageChange=(page)=>{//页码发生变化
        this.handleSearch(page)
    }
    getColumns=()=>{//生成colume数据
        const {
            setFieldsValue,
            getFieldDecorator
        }=this.props.form;

        const {
            rowSelection:{
                selectedRowKeys,
                getCheckboxProps
            },
            detail:{
                orderCartList
            },
            pagination
        }=this.props;


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
                title: '名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '编码',
                dataIndex: 'code',
                key: 'code',
                // width: 64,
            },
            {
                title: '分类',
                key: 'productsClassifyList',
                render:(row)=>{
                    return (row.productsClassifyList ||[]).map(item=>`${item.productClassifyName} `)
                }
            }, {
                title: '规格',
                dataIndex: 'spec',
                key: 'spec',
            },{
                title: '单位',
                dataIndex: 'unit',
                key: 'unit',
            },{
                title: '价格',
                dataIndex: 'price',
                key: 'price',
            },
            {
                title: '购物车数量',
                key: 'productNum',
                render:(row,i,j)=>{

                    const isDisabled = getCheckboxProps(row).disabled;
                    const formKeyName =this.state.tableFormName ;

                    const disabledCart = (orderCartList || []).filter(item => item.productId == row.id )

                    const change=(val,row)=>{
                        row.finalProductNum=val;
                    }


                    return isDisabled ?disabledCart.length && disabledCart[0].finalProductNum:<div>
                            <FormItem>
                                {getFieldDecorator(`${formKeyName}[${j}[productNum]]`, {
                                    initialValue: row.finalProductNum||0,
                                    rules: [
                                        // {required: true, message: `购物车数量不能为空`},
                                    ],
                                })(
                                    <InputNumber disabled={getCheckboxProps(row).disabled}
                                                 min={0}
                                                 placeholder=""
                                                 onChange={(val)=>{change(val,row)}}
                                                 step={row.step}
                                    />
                                )}
                            </FormItem>

                            <FormItem style={{display:'none'}}>
                                {getFieldDecorator(`${formKeyName}[${j}[id]]`, {
                                    initialValue: row.id,
                                    rules: [],
                                })(
                                    <InputNumber  placeholder=""/>
                                )}
                            </FormItem>

                            <FormItem style={{display:'none'}}>
                                {getFieldDecorator(`${formKeyName}[${j}[msg]]`, {
                                    initialValue: row.name,
                                    rules: [],
                                })(
                                    <InputNumber  placeholder=""/>
                                )}
                            </FormItem>

                            <FormItem style={{display:'none'}}>
                                {getFieldDecorator(`${formKeyName}[${j}[needCheckNum]]`, {
                                    initialValue: !isDisabled && selectedRowKeys.indexOf(row.id) >= 0 ,//当没有被禁止勾选   同时手动勾选的时候  需要校验数量
                                    rules: [],
                                })(
                                    <Input  placeholder=""/>
                                )}
                            </FormItem>
                        </div>
                },
            },{
                title: '最多可订',
                dataIndex: 'propertyPurchasing',
                key: 'propertyPurchasing',
            }
        ];
        return columns;
    }
    render() {
        const {
            modalVisible,
            form,
            handleDialogSubmit,
            handleSelectGoodsModalVisible,
            rowSelection,
            onChange,
            taglineIdList,//已经选择的送货路线列表
            ...tableProps
        } = this.props;

        const {

        }=this.state;

        const {
            getFieldDecorator,
            getFieldValue
        } = form;

        return (
            <Modal title={'选择商品'}
                   visible={modalVisible}
                   onOk={()=>{this.onAddGoods()}}
                   onCancel={() => handleSelectGoodsModalVisible(false, null)}
                   footer={<Button type={'primary'} onClick={()=>{this.onAddGoods()}}>确定</Button>}
                   okText="确定"
                   cancelText=''
                   width="1000px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >
                <Row>
                    <Col span={8}>
                        <FormItem >
                            {getFieldDecorator('name', {
                                initialValue:'',
                                rules: [
                                    // {required: true, message: `分类名称不能为空`},
                                ],
                            })(
                                <Search placeholder="请输入商品名称"
                                        size="large"
                                        onSearch={()=>{this.handleSearch()}}
                                        style={{width:'100%'}}
                                />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Card >
                    <Table
                        className={styles.smallTable}
                        {...tableProps}
                        bordered
                        hideDefaultSelections={true}
                        // scroll={{ y: 240 }}
                        columns={this.getColumns()}
                        simple
                        onChange={(page)=>{this.onPageChange(page,{name:getFieldValue('name'),taglineIdList})}}
                        rowKey={record => record.id }
                        rowSelection={rowSelection}
                        scroll={{ y: 300 }}
                        // getBodyWrapper={getBodyWrapper}
                    />
                </Card>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(SelectGoodsDialog);

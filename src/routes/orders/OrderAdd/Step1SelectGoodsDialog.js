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
    handleSearch=(page={})=>{//搜索功能
        const {
            form,
            taglineIdList,
            dispatch,
            selectedShopRows,
        } = this.props;

        log(this.props)

        setTimeout(()=>{//延时操作 获取到改变之后的值
            const classifyId =form.getFieldValue('classifyId')||'';
            const name=form.getFieldValue('name')||'';
            const sellModeId = this.props.sellModeId

            dispatch({
                type:'OrderAdd/queryGoods',
                payload:{
                    page:page.current || 1,
                    pageSize:page.pageSize || 10,
                    tagLineIds:taglineIdList,
                    up:true,
                    name,
                    classifyId,
                    statusId:selectedShopRows.length && selectedShopRows[0].statusId,
                    sellModeId
                }
            });
        },2)
    }
    onPageChange=(page)=>{//页码发生变化
        this.handleSearch(page)
    }
    onAddGoods=()=>{
        // const {
        //     dispatch,
        //     templateGoods,
        //     selectGoodsBySelf
        // }=this.props;
        //
        //
        //
        // //将自选的商品加入到模板商品列表中
        // dispatch({
        //     type:'OrderAdd/updateState',
        //     payload:{
        //         templateGoods:templateGoods.concat(selectGoodsBySelf)
        //     }
        // });
        //
        // this.handleModalVisible(false);//关闭弹框


        const {
            form,
            dispatch,
            selectGoodsBySelf,
            handleModalVisible,
            rowSelection:{
                selectedRowKeys
            },
            templateGoods,
            pagination
        } = this.props;

        const {
            getFieldValue
        }=form;

        const formKeyName =this.state.tableFormName ;

        //弹框中可选的商品
        const canSelectGoodsList=getFieldValue(formKeyName);
        // console.log('getFieldsValue:"',form.getFieldsValue());

        //已经选中的商品
        const selectedGoods = canSelectGoodsList.filter(item => item.needCheckNum);


        const isEveryNotZero = selectedGoods.every(item => item && item.productNum > 0 );

        // console.log('canSelectGoodsList:' , canSelectGoodsList , 'selectedGoods:',selectedGoods ,'selectedRowKeys:',selectedRowKeys);

        if(!isEveryNotZero){
            message.warn('请确保手动勾选的商品填写了商品数量！');
            return;
        }


        //对弹框中的数据和列表中的数据进行组装
        (selectGoodsBySelf||[]).map((select,i)=>{
            selectedGoods.map((s,i)=>{
                if(select.id == s.id){
                    selectedGoods[i]={
                        ...select,
                        ...s,
                        productNum:s.productNum
                    }
                }

            })
        });


        // console.log('canSelectGoodsList:' , canSelectGoodsList ,'selectedGoods:', selectedGoods );
        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                templateGoods:templateGoods.concat(selectedGoods)
            }
        });
        handleModalVisible(false);

    }
    getColumns=()=>{//生成colume数据

        const {
            form,
            templateGoods,
            pagination,
            rowSelection:{
                selectedRowKeys,
                getCheckboxProps
            },
        }=this.props;

        const {
            setFieldsValue,
            getFieldDecorator
        }=form;


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
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '商品编码',
                dataIndex: 'code',
                key: 'code',
                // width: 64,
            },
            {
                title: '商品分类',
                // dataIndex: 'productsClassifyList',
                key: 'productsClassifyList',
                render:(row)=>{
                    return (row.productsClassifyList || []).reduce((str,item)=>{
                        return str+item.productClassifyName
                    },'')
                }
            }, {
                title: '商品规格',
                dataIndex: 'spec',
                key: 'spec',
            },{
                title: '商品价格',
                dataIndex: 'price',
                key: 'price',
            },{
                title: '最多可订',
                dataIndex: 'propertyPurchasing',
                key: 'propertyPurchasing',
            },
            {
                title: '购物车数量',
                key: 'productNum',
                render:(row,i,j)=>{


                    const isDisabled = getCheckboxProps(row).disabled;
                    const formKeyName =this.state.tableFormName ;


                    const disabledCart = (templateGoods || []).filter(item => (item.productId+'') == (row.id + '' ) );

                    const change=(val,row)=>{
                        row.productNum=val;
                    }


                    return isDisabled ?disabledCart.length && disabledCart[0].productNum:<div>
                        <FormItem>
                            {getFieldDecorator(`${formKeyName}[${j}[productNum]]`, {
                                initialValue:row.productNum||0,
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
                                initialValue: row.id + '',
                                rules: [],
                            })(
                                <Input  placeholder=""/>
                            )}
                        </FormItem>

                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`${formKeyName}[${j}[name]]`, {
                                initialValue: row.name,
                                rules: [],
                            })(
                                <Input  placeholder=""/>
                            )}
                        </FormItem>

                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator(`${formKeyName}[${j}[needCheckNum]]`, {
                                initialValue: !isDisabled && selectedRowKeys.indexOf(row.id + '') >= 0 ,//当没有被禁止勾选   同时手动勾选的时候  需要校验数量
                                rules: [],
                            })(
                                <Input  placeholder=""/>
                            )}
                        </FormItem>
                    </div>
                },
            },
            {
                title: '最小购买单位',
                dataIndex: 'stockUnit',
                key: 'stockUnit',
            }
        ];
        return columns;
    }
    render() {
        const {
            modalVisible,
            form,
            handleDialogSubmit,
            handleModalVisible,
            rowSelection,
            onChange,
            taglineIdList,//已经选择的送货路线列表
            // onAddGoods,
            GoodsClassifySelects=[],
            ...tableProps
        } = this.props;

        const {
            onAddGoods
        }=this;


        const {

        }=this.state;

        const {
            getFieldDecorator,
            getFieldValue
        } = form;

        const GoodsClassifyOptions=(GoodsClassifySelects || []).map((item,i)=>{
            const {
                id,
                name
            }=item;
            if(name){
                return <Option value={id} key={name+id}>{name}</Option>
            }
        });


        return (
            <Modal title={'选择商品'}
                   visible={modalVisible}
                   onOk={onAddGoods}
                   onCancel={() => handleModalVisible(false, null)}
                   footer={<Button type={'primary'} onClick={onAddGoods}>确定</Button>}
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
                            {getFieldDecorator('classifyId', {
                                // initialValue: '',
                                // rules: [
                                //     {required: true},
                                // ]
                            })( <Select placeholder="分类"
                                        onChange={()=>{this.handleSearch()}}
                                        style={{width:'100%'}}
                                >
                                    <Option value={''}>全部</Option>
                                    {GoodsClassifyOptions}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8} push={2}>
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
                        {...tableProps}
                        bordered
                        // scroll={{ y: 240 }}
                        columns={this.getColumns()}
                        simple
                        onChange={(page)=>{this.onPageChange(page,{name:getFieldValue('name'),taglineIdList})}}
                        rowKey={record => record.id+''}
                        rowSelection={rowSelection}
                        // getBodyWrapper={getBodyWrapper}
                    />
                </Card>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(SelectGoodsDialog);

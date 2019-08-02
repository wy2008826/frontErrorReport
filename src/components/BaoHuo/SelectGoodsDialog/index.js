import {
    Row,
    Col,
    Form,
    Input,
    Modal,
    Card,
    Table,
    Button,
    Select,
    InputNumber
} from 'antd';

import React, {Component} from 'react';
import {message} from "antd/lib/index";

const FormItem = Form.Item;
const Search = Input.Search
const Option = Select.Option;


class SelectGoodsDialog extends Component {
    state = {
        tableFormName:'canSelectGoodsList',//canSelectGoodsList
    };


    componentDidMount(){
        const {

        }=this.state;

        const {
            dispatch,
            // taglineIdList,
            // tag_warehouse
        }=this.props;

        dispatch({//获取商品分类列表  供选择
            type: 'app/getGoodsClassifySelect',
        });

        this.handleSearch(1);//页面加载既需要加载所需的数据

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
    onAddGoods=()=>{

        const {
            form,
            selectGoodsInDialogBySelf,
            rowSelection:{
                selectedRowKeys
            },
            onClickOkAdd,
            rejectColumn,
            dataSource,
            outerDialogGoodsKeys
        } = this.props;

        const {
            getFieldValue
        }=form;

        const formKeyName =this.state.tableFormName ;

        // //弹框中可选的商品  排除了弹框外面已经选择的商品
        const canSelectRows=rejectColumn?getFieldValue(formKeyName):dataSource;


        //已经选中的商品
        const selectedGoods =selectGoodsInDialogBySelf.filter(item => outerDialogGoodsKeys.indexOf(item.id)<0);


        const ZeroRows =rejectColumn? selectedGoods.filter(item => item && !item[rejectColumn.rejectKey]  ):true;


        // console.log('canSelectGoodsList:' , canSelectGoodsList , 'selectGoodsInDialogBySelf:',selectGoodsInDialogBySelf ,'selectedGoods:',selectedGoods);

        if(rejectColumn && ZeroRows.length){
            message.warn(`请确保手动勾选的商品（${ZeroRows[0].name}）填写了${rejectColumn.rejectTitle}！`);
            return;
        }

        // console.log('selectGoodsBySelf:',selectGoodsBySelf,'selectedGoods:',selectedGoods);


        //对弹框中的数据和列表中的数据进行组装
        if(rejectColumn){
            (canSelectRows||[]).map((select,i)=>{
                selectedGoods.map((s,i)=>{
                    if(select.id == s.id){
                        selectedGoods[i]={
                            ...select,
                            ...s,
                            [rejectColumn.rejectKey]:select[rejectColumn.rejectKey]
                        }
                    }

                })
            });
        }

        onClickOkAdd(selectedGoods);//点击了确认弹框
    }

    handleSearch=(page=1)=>{//搜索功能
        const {
            form,
            // tag_warehouse,
            dispatch,
            modalName,
            filterQuery,//路线
        } = this.props;


        setTimeout(()=>{
            const classifyId =form.getFieldValue('classifyId')||'';
            const name=form.getFieldValue('name')||'';
            dispatch({
                type:`${modalName}/queryGoods`,
                payload:{
                    // tagLineIds:taglineIdList,
                    // statusId:'',//店铺状态
                    ...filterQuery,
                    up:true,
                    name,
                    classifyId,
                    page,
                    pageSize:10
                }
            })
        },2);

        dispatch({
            type:`${modalName}/updateState`,
            payload:{
                selectGoodsInDialogBySelf:[],
            }
        })
    }
    getColumns=(isPurchaseLimit)=>{//生成colume数据\
        const {
            form,
            outerDialogGoods,
            pagination,
            rowSelection:{
                selectedRowKeys,
                getCheckboxProps
            },
            rejectColumn,
            allOuterColumns=[],//外面注入
        }=this.props;

        const {
            setFieldsValue,
            getFieldDecorator
        }=form;

        if(allOuterColumns && allOuterColumns.length){
            return allOuterColumns
        }


        const columns = isPurchaseLimit ? [{
            title: '主图',
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
            title: '商品分类',
            dataIndex: 'productsClassifyList',
            key: 'productsClassifyList',
            render:(val)=>{
                return (val||[]).map((item)=>{
                    return item.productClassifyName
                })
            }
        }] : [
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
                title: '商品分类',
                dataIndex: 'productsClassifyList',
                key: 'productsClassifyList',
                render:(val)=>{
                    return (val||[]).map((item)=>{
                        return item.productClassifyName
                    })
                }
            },
            {
                title: '规格',
                dataIndex: 'spec',
                key: 'spec',
            },
            {
                title: '价格',
                dataIndex: 'price',
                key: 'price',
            },
            {
                title: '最小购买单位',
                dataIndex: 'stockUnit',
                key: 'stockUnit',
            },
        ];

        const CartNum = {
            title: '购物车数量',
            key: 'productNum',
            render:(row,i,j)=>{
                const isDisabled = getCheckboxProps(row).disabled;
                const formKeyName =this.state.tableFormName ;


                const disabledCart = (outerDialogGoods || []).filter(item => (item.productId+'') == (row.id + '' ) );

                const change=(val,row)=>{
                    row[rejectColumn.rejectKey]=val;
                }


                return isDisabled ?disabledCart.length && disabledCart[0][rejectColumn.rejectKey]:<div>
                    <FormItem>
                        {getFieldDecorator(`${formKeyName}[${j}[${rejectColumn.rejectKey}]]`, {
                            initialValue:row[rejectColumn.rejectKey]||0,
                            rules: [
                                // {required: true, message: `....不能为空`},
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
            }
        };

        if(rejectColumn){
            columns.splice(6,0,CartNum)
        }
        
        return columns;
    }
    render() {
        const {
            modalVisible,
            form,
            handleModalVisible,
            rowSelection,
            GoodsClassifySelects,
            isPurchaseLimit = false,
            ...tableProps
        } = this.props;

        const {
            getFieldDecorator,
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
                   onOk={()=>{this.onAddGoods()}}
                   onCancel={() => handleModalVisible(false, null)}
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
                            {getFieldDecorator('classifyId', {
                                // initialValue: '',
                                // rules: [
                                //     {required: true},
                                // ]
                            })( <Select placeholder="分类"
                                        onChange={()=>{this.handleSearch(1)}}
                                        style={{width:'100%'}}
                                >
                                    <Option value={''}>全部</Option>
                                    {GoodsClassifyOptions}
                                </Select>
                            )}
                        </FormItem>
                    </Col>

                    <Col span={8} push={8}>
                        <FormItem >
                            {getFieldDecorator('name', {
                                initialValue:'',
                                rules: [
                                    // {required: true, message: `分类名称不能为空`},
                                ],
                            })(
                                <Search placeholder="请输入商品名称"
                                        size="large"
                                        onSearch={()=>{this.handleSearch(1)}}
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
                        columns={this.getColumns(isPurchaseLimit)}
                        simple
                        onChange={ (page)=>{ this.handleSearch(page.current) } }
                        rowKey={record => (record.id + '')}
                        rowSelection={rowSelection}
                    />
                </Card>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(SelectGoodsDialog);

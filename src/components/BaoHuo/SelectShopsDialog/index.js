import {
    Form,
    Input,
    Modal,
    InputNumber,
    Card,
    Table,
    message
} from 'antd';

import React, {Component} from 'react';

const FormItem = Form.Item;

import styles from './index.less';
import { formRender, formatFormSearchParams } from 'utils/formRender';

class SelectShopsDialog extends Component {
    state = {
        tableFormName:'canSelectRows'
    };


    componentDidMount(){
        const {

        }=this.state;


        //获取店铺状态下拉狂列表
        // this.props.dispatch({//获取店铺等级下拉列表
        //     type: 'app/getShopStatusSelect',
        //     payload:{

        //     }
        // });
        this.props.didMountFetch && this.props.didMountFetch();

        this.handleSearch({
            current:1,
        });//页面加载既需要加载所需的数据



    }
    componentWillReceiveProps(props){
        const {
            pagination
        }=props;

        //每次接收props的时候更新tableformName   避免进入弹框后的第一页表单数据 和直接搜索的第一页数据导致冲突
        this.setState({
            tableFormName:'canSelectRows'+pagination.current +'-'+ new Date()*1
        });
    }
    onOkAdd=()=>{

        const {
            form,
            selectShopsInDialogBySelf,
            rowSelection:{
                selectedRowKeys
            },
            onClickAddShop,
            dataSource,
            outerDialogShopsKeys,
            rejectColumn
        } = this.props;

        const {
            getFieldValue
        }=form;

        const formKeyName =this.state.tableFormName ;

        // //弹框中可选的商品  排除了弹框外面已经选择的商品
        const canSelectRows=rejectColumn?getFieldValue(formKeyName):dataSource;

        //已经选中的商品
        const selectedShops =selectShopsInDialogBySelf.filter(item => outerDialogShopsKeys.indexOf(item.id)<0);


        const ZeroRows =rejectColumn? selectedShops.filter(item => item && !item[rejectColumn.rejectKey]  ):true;

        // console.log('canSelectRows:' , canSelectRows , 'selectShopsInDialogBySelf:',selectShopsInDialogBySelf ,'selectedShops:',selectedShops);

        //非零校验
        if(rejectColumn && ZeroRows.length){
            message.warn(`请确保手动勾选的店铺（${ZeroRows[0].name}）填写了${rejectColumn.rejectTitle}！`);
            return;
        }


        //对弹框中的数据和列表中的数据进行组装
        if(rejectColumn){
            (canSelectRows||[]).map((select,i)=>{
                selectedShops.map((s,i)=>{
                    if(select.id == s.id){
                        selectedShops[i]={
                            ...select,
                            ...s,
                            [rejectColumn.rejectKey]:select[rejectColumn.rejectKey]
                        }
                    }

                })
            });
        }

        onClickAddShop(selectedShops);//点击了确认弹框
    }
    handleSearch=(page={current:1,pageSize:10})=>{//执行查询店铺逻辑
        const {
            form,
            wareHouseId,
            tagLineId,
            dispatch,
            modalName,
            filterQuery={
                search:'',//店铺搜索关键字
                status:'',//店铺状态
            }
        }=this.props;

        const {
            getFieldValue
        }=form;
        // const formParams = this.formatFormSearchParams();
        // console.log(formParams)
        let _this = this;
        setTimeout(()=>{
            const formParams = formatFormSearchParams(_this);
            dispatch({
                type:`${modalName}/queryShops`,
                payload:{
                    paging:1,//是否分页
                    page:page.current,//当前页码
                    pageSize:page.pageSize || 10,

                    ...filterQuery,
                    ...formParams,
                    // search:getFieldValue('name'),
                    // status:getFieldValue('status')
                }
            });
        },2);

        dispatch({
            type:`${modalName}/updateState`,
            payload:{
                selectShopsInDialogBySelf:[],
            }
        })
    }
    onPageChange=(page)=>{//页码发生变化
        this.handleSearch(page)
    }
    getColumns=()=>{//生成colume数据
        const {
            form,
            outerDialogShops,
            pagination,
            rowSelection:{
                selectedRowKeys,
                getCheckboxProps
            },
            rejectColumn
        }=this.props;

        const {
            setFieldsValue,
            getFieldDecorator
        }=form;


        const columns = [
            {
                title: '店铺编码',
                dataIndex: 'code',
                key: 'code',
                // width: 64,
            },
            {
                title: '店铺名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '仓库',
                // dataIndex: 'wareHouseList',
                key: 'wareHouseList',
                render: row => {
                    return (row.wareHouseList||[]).map((item,i)=>{
                        const {
                            name,
                            id
                        }=item;
                        return name+' '
                    })
                },
            },
            {
                title: '路线',
                dataIndex: 'lineName',
                key: 'lineName',
                render: (row, record, index) => {
                    return (record.lineList || []).map((item, i) => {
                        const {
                            name,
                        } = item;
                        return name + ' '
                    })
                },
            },
            {
                title: '店铺等级',
                // dataIndex: 'rank',
                key: 'rank',
                render: row  => {
                    return row.rank ? row.rank.name : ''
                },
            },
            {
                title: '店铺状态',
                // dataIndex: 'status',
                key: 'status',
                render: row => {
                    return row.status ?row.status.name:''
                },
            },
        ];

        const CartNum = {
            title: '限购数量',
            key: 'rowNum',
            render:(row,i,j)=>{
                const isDisabled = getCheckboxProps(row).disabled;
                const formKeyName =this.state.tableFormName ;


                const disabledCart = (outerDialogShops || []).filter(item => (item.id+'') == (row.id + '' ) );

                const change=(val,row)=>{
                    row[rejectColumn.rejectKey]=val;
                }


                return isDisabled ?disabledCart.length && disabledCart[0][rejectColumn.rejectKey]:<div>
                    <FormItem>
                        {getFieldDecorator(`${formKeyName}[${j}[${rejectColumn.rejectKey}]]`, {
                            initialValue:row[rejectColumn.rejectKey]||'',
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
            }
        };
        if(rejectColumn){
            columns.splice(columns.length,0,CartNum);
        }
        return columns;
    }
    // 4.2
    // formatFormSearchParams = (_this) => {
    //     const {
    //         form
    //     } = _this.props;
    //     let _obj = form.getFieldsValue();
    //     let delKey = Object.keys(_obj).filter(v => v.indexOf('canSelectRows') != -1)[0];
    //     // console.log(delKey)
    //     // let delKey;
    //     // if (_obj)
    //     delete _obj[delKey];
    //     return _obj;
    // }
    // formRender = () => {
    //     const {
    //         shopDialogFormData,
    //         form,
    //     } = this.props;
    //     const {
    //         getFieldDecorator,
    //     } = form;
    //     return (
    //         <Row>
    //             {
    //                 shopDialogFormData.map((v, i) => {
    //                     return (
    //                         <Col key={v.key} span={v.span || 8} push={v.push || 0}>
    //                                 {
    //                                     v.type === 'select' ? (
    //                                         <FormItem>
    //                                             {getFieldDecorator(v.key, {
    //                                             })( <Select placeholder={v.placeholder}
    //                                                         onChange={v.onChange(this)}
    //                                                         style={{width:'100%'}}
    //                                                 >
    //                                                     {
    //                                                         v.data.map(d => <Option value={d.value} key={d.key}>{d.text}</Option>)
    //                                                     }
    //                                                 </Select>
    //                                             )}
    //                                         </FormItem>
    //                                     ) : v.type === 'search' ? (
    //                                         <FormItem>
    //                                             {getFieldDecorator(v.key, {
    //                                                 initialValue:'',
    //                                                 rules: [
    //                                                     // {required: true, message: `分类名称不能为空`},
    //                                                 ],
    //                                             })(
    //                                                 <Search placeholder={v.placeholder}
    //                                                         size="large"
    //                                                         onSearch={v.onSearch(this)}
    //                                                         style={{width:'100%'}}
    //                                                 />
    //                                             )}
    //                                         </FormItem>
    //                                     ) : null
    //                                 }
    //                         </Col>
    //                     )
    //                 })
    //             }
    //         </Row>
    //     )
    // }
    render() {
        const {
            modalVisible,
            handleModalVisible,
            onClickAddShop,
            form: {
                getFieldDecorator,
            },
            // ShopStatusSelect,
            shopDialogFormData,
            ...shopDialogListsProps,
        } = this.props;

        const {


        }=this.state;

        // const {
        //     getFieldDecorator,
        //     getFieldValue
        // } = form;

        //店铺状态下拉框
        // const shopStatusOptions=ShopStatusSelect.map((item,i)=>{
        //     const {
        //         id,
        //         name
        //     }=item;
        //     if(name){
        //         return <Option value={id} key={name+id}>{name}</Option>
        //     }
        // });

        return (
            <Modal title={'选择店铺'}
                   visible={modalVisible}
                   onOk={this.onOkAdd}
                   onCancel={()=>{handleModalVisible(false)}}
                   okText="确定"
                   cancelText='取消'
                   width="1000px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >
                {formRender(shopDialogFormData, getFieldDecorator, this)}
                {/* <Row>
                    <Col span={8}>
                        <FormItem >
                            {getFieldDecorator('status', {
                                // initialValue: '',
                                // rules: [
                                //     {required: true},
                                // ]
                            })( <Select placeholder="店铺状态"
                                        onChange={()=>{this.handleSearch(1)}}
                                        style={{width:'100%'}}
                                >
                                    <Option value={''}>全部</Option>
                                    {shopStatusOptions}
                                </Select>
                            )}
                        </FormItem>
                    </Col>

                    <Col span={8} push={8}>
                        <FormItem >
                            {getFieldDecorator('search', {
                                initialValue:'',
                                rules: [
                                    // {required: true, message: `分类名称不能为空`},
                                ],
                            })(
                                <Search placeholder="店铺名称、编码"
                                        size="large"
                                        onSearch={()=>{this.handleSearch()}}
                                        style={{width:'100%'}}
                                />
                            )}
                        </FormItem>
                    </Col>
                </Row> */}
                <Card >
                    <Table
                        className={styles.smallTable}
                        {...shopDialogListsProps}
                        bordered
                        hideDefaultSelections={true}
                        // scroll={{ y: 240 }}
                        columns={this.getColumns()}
                        simple
                        onChange={(page)=>{this.onPageChange(page)}}
                        rowKey={record => record.id}
                        // rowSelection={rowSelection}
                    />
                </Card>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(SelectShopsDialog);

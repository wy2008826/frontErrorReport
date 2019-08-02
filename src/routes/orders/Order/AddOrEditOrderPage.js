

/**
 * 选择仓库  选择路线  点击添加商品  选出可选择的商品， 勾选后把商品添加到model的selectedRows中
 * model中的selectedRows和列表中形成关联关系，下一次搜索的时候会自动勾选上
 *
 * 商品列表有两种来源   一种是编辑时候原有的数据   另一种是添加的商品  这两种数据都存放在model中
 *
 * 删除行的时候 删除掉数据即可
 *
 * 不管是新增还是编辑   商品列表数据统一放到详情的商品列表里面  这样做是为了统一渲染列表
 * 提交的时候从form中获取数据 组装后提交即可
 * **/

import {
    Row,
    Col,
    Form,
    Input,
    Select,
    InputNumber,
    DatePicker,
    Modal,
    message,
    Tag,
    Button,
    Switch,
    Card
} from 'antd';
import React, {PureComponent, Component, Fragment} from 'react';
import {connect} from 'dva';
import SelectGoodsDialog from './SelectGoodsDialog'

const FormItem = Form.Item;
const Option = Select.Option;

const qs = require('qs')


class AddOrEditOrderPage extends Component {
    state = {
        tag_lines:[],//输入框中的线路
        tag_warehouse:'',//输入框中的仓库
        id:(qs.parse(window.location.hash.split('?')[1]||'')).id,//订单模板id  当添加的时候为空
        colSpan: ['5', '3', '3', '2'],
        titleConfig: [
            {title: '商品', name: 'name',type:'text'},
            {title: '数量', name: 'tagbank_set-name',type:'input'},
            {title: '排序', name: 'tagbank_set-branch',type:'input'},
            {title: '操作', type:'operate'},
        ],
    };

    componentWillReceiveProps(props) {
        // if (props.activeDetail.name) {
        //     this.setState({
        //         detail: Object.assign(this.state.detail, props.activeDetail)
        //     })
        // }
    }

    componentDidMount() {
        const {
            id,
        } = this.state;

        this.props.dispatch({//获取仓库列表
            type: 'app/getWareHouses'
        })

        const {

        } = this.props;

        if (!id) {//新增

        } else {
            this.props.dispatch({//获取订单模板详情
                type: 'AddOrEditOrderPage/orderTemplateDetail',
                payload:{
                    id
                }
            })
        }
    }

    createRow(rowData={}) {
        const {
            titleConfig
        }=this.state;

        titleConfig.map((colTitle,i)=>{
            const {
                title,
                name,
                type
            }=colTitle
            rowData[name]=rowData[name]||''
        })

        return rowData
    }

    okHandle() {//提交表单
        const {
            form,
        } = this.props;

        form.validateFields((err, fieldsValue) => {
            if (err) return;

            console.log('fieldsValue:',fieldsValue);
            // handleDialogSubmit(fieldsValue, activeRow ? 'edit' : 'add');
        });
    }

    createHeader() {
        const {
            colSpan,
            titleConfig,
        } = this.state;

        const headerStyle = {
            'textAlign': 'center'
        };
        return <Row gutter={4}>
            {titleConfig.map((item, i) => {
                return <Col style={headerStyle} key={`${item.title}${i}`} span={colSpan[i]}>{item.title}</Col>
            })}
        </Row>;
    }

    clickAddRow() {//点击添加行数据按钮
        const {

        } = this.state;

        const {
            form,
            dispatch
        }=this.props;

        const {
            validateFieldsAndScroll,
            getFieldValue
        }=form;

        const tag_warehouse=getFieldValue('tag_warehouse');
        const tag_lines=getFieldValue('tag_lines');

        // if(!tag_warehouse){
        //     message.error('请选择仓库');
        //     return ;
        // }
        //
        // if(!tag_lines.length){
        //     message.error('请先选择对应路线');
        //     return ;
        // }

        this.setState({
            tag_lines:tag_lines||[],
            tag_warehouse
        });

        //显示弹框设置
        dispatch({
            type:'AddOrEditOrderPage/updateState',
            payload:{
                modalVisible:true
            }
        })
    }
    deleteRow=(row)=>{//删除一行数据  到时候需要区分是原有的数据还是通过勾选选出来的商品

        const {
            id
        }=row

        const {
            dispatch,
            AddOrEditOrderPage
        } = this.props;

        const {
            selectedRowKeys=[],
            selectedRows=[]
        }=AddOrEditOrderPage

        selectedRowKeys.map((key,i)=>{
            if(key==id){
                selectedRowKeys.splice(i,1)
            }
        });

        selectedRows.map((row,i)=>{
            if(row.id==id){
                selectedRows.splice(i,1)
            }
        })

        dispatch({//更新数据
            type:'AddOrEditOrderPage/updateState',
            payload:{
                selectedRowKeys,
                selectedRows
            }
        })

    }
    createGoods() {//生成一条新增数据
        const {
            form,
            AddOrEditOrderPage
        } = this.props;

        const {getFieldDecorator} = form;
        const {
            colSpan,
            titleConfig,
        } = this.state;
        const {
            selectedRows=[]
        }=AddOrEditOrderPage

        console.log('createGoods selectedRows:',selectedRows);


        return selectedRows.map((row, rowInd) => {
            return <Row gutter={4} key={rowInd}>
                {titleConfig.map((colItem, colInd) => {
                    const {
                        type,
                        name,
                    }=titleConfig[colInd];

                    const isRequired = true;
                    const value=row[name] || ''

                    return <Col span={colSpan[colInd]} key={`${rowInd}${colItem.name}${colInd}`}>
                        {type=="input" && <FormItem>
                            {getFieldDecorator(name+rowInd, {
                                initialValue: value,
                                rules: [
                                    isRequired && {required: true, message: `${titleConfig[colInd].title}不能为空`},
                                ],
                            })(
                                <Input placeholder=""/>
                            )}
                        </FormItem>}
                        {type=="operate" && <Button onClick={()=>{
                            this.deleteRow(row)
                        }}>删除</Button>}
                        {type=="text" && <div style={{textAlign:'center',lineHeight:'36px'}}>{value}</div>}
                    </Col>
                })}
            </Row>
        });
    }
    onWareHouseChange=(fieldVal)=>{//仓库发生变化 需要动态改变可选路线的值
        const {
            dispatch,
            form
        }=this.props
        const {
            setFieldsValue
        }=form

        dispatch({
            type:'app/getSingleWareHouseTagLines',
            payload:{
                wareHouse:fieldVal
            }
        })

        setFieldsValue({
            tag_lines:[]
        })
    }
    handleModalVisible = (flag) => {//设置modal的显示状态
        this.props.dispatch({
            type: `AddOrEditOrderPage/updateState`,
            payload: {
                modalVisible: !!flag,
            },
        })
    }
    onPageChange=(page)=>{//页码发生变化
        const {
            formValues={}
        }=this.state;

        this.props.dispatch({
            type: 'AddOrEditOrderPage/queryGoods',
            payload: {
                ...formValues,
                page: page.current || 1,
                pageSize: page.pageSize || 10
            },
        })
    }

    render() {

        const {
            handleModalVisible,
            onPageChange,
        }=this;

        const {
            tag_lines,
            tag_warehouse
        }=this.state;

        const {
            form,
            AddOrEditOrderPage,
            app,
            dispatch,
            location,
            loading
        } = this.props;

        const {//公用数据
            wareHouseTagLines={},
            wareHouses = []
        } = app;

        const {//model数据
            detail = {},
            modalVisible,
            selectedRowKeys = [],
            selectedRows=[],
            list = [],
            pagination = {page: 1, current: 1, pageSize: 10},
            isMotion,
        } = AddOrEditOrderPage;


        const {
            getFieldValue,
            getFieldDecorator
        } = form;

        const parentMethods={
            handleModalVisible,
            dispatch
        }
        console.log('this.props:',this.props);


        const listProps = {//表格列表 分页改变 删除数据 编辑数据 多选功能
            dataSource: list,
            loading: loading.effects['AddOrEditOrderPage/queryGoods'],
            pagination,
            location,
            isMotion,
            onChange:onPageChange,
            onClickEditItem:handleModalVisible,
            rowSelection: {
                selectedRowKeys,
                onSelect:(record, selected, currentPageSelectedRows)=>{
                    if(selected){//选中该项
                        selectedRows.push(record);

                    }else{//没有选中则删除
                        selectedRows.map((item,i)=>{
                            if(item.id==record.id){
                                selectedRows.splice(i,1);
                            }
                        })
                    }
                    dispatch({
                        type: 'AddOrEditOrderPage/updateState',
                        payload: {
                            selectedRows
                        },
                    })
                },
                onChange: (keys,selected,s) => {
                    dispatch({
                        type: 'AddOrEditOrderPage/updateState',
                        payload: {
                            selectedRowKeys: keys,
                        },
                    })
                },
            },
        }

        const HouseOptions = wareHouses.map((item, i) => {
            const {
                id,
                name
            } = item;
            return <Option value={name} key={name + id}>{name}</Option>
        });

        //获取选中仓库下可选的路线列表
        const selectedWareHouse=getFieldValue('tag_warehouse');
        const singleWareHouseTagLinesOptions=(wareHouseTagLines[selectedWareHouse]||[]).map((tagLine,i)=>{
            const {
                name,
                id
            }=tagLine
            const key=name + id+Math.random()
            return <Option value={name+id} key={key}>{name}</Option>
        })

        const labelCol={
            labelCol:{
                span:10
            },
            wrapperCol:{
                span:14
            }
        };
        return (
            <Card>
                <Row>
                    <Col span="10">
                        <FormItem label="订单号"
                                  {...labelCol}>
                            {getFieldDecorator('num', {
                                initialValue: detail.num,
                                rules: [
                                    {required: true, message: `订单号不能为空`},
                                ],
                            })(
                                <Input disabled placeholder="请输入订单号"/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span="10">
                        <FormItem label="店铺"
                                  {...labelCol}>
                            {getFieldDecorator('shop', {
                                initialValue: detail.shop,
                                rules: [
                                    {required: true, message: `店铺不能为空`},
                                ],
                            })(
                                <Select placeholder="请选择店铺"
                                        style={{width: '100%'}}
                                        onChange={(val)=>{}}
                                >
                                    {HouseOptions}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <Row>
                    <Col span="10">
                        <FormItem label="订单类型"
                                  {...labelCol}>
                            {getFieldDecorator('ftype', {
                                initialValue: detail.ftype,
                                rules: [
                                    // {required: true, message: `订单类型不能为空`},
                                ],
                            })(
                                <Select placeholder="请选择订单类型"
                                        style={{width: '100%'}}>
                                    <Option value={'1'}>筹备订单</Option>
                                    <Option value={'2'}>柠檬订单</Option>
                                    <Option value={'3'}>正常订单</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span="10">
                        <FormItem label="订单状态"
                                  {...labelCol}>
                            {getFieldDecorator('status', {
                                initialValue: detail.status,
                                rules: [
                                    // {required: true, message: `订单类型不能为空`},
                                ],
                            })(
                                <Select placeholder="请选择订单状态"
                                        style={{width: '100%'}}>
                                    <Option value={'1'}>未提交</Option>
                                    <Option value={'2'}>已提交</Option>
                                    <Option value={'3'}>已审核</Option>
                                    <Option value={'4'}>已发货</Option>
                                    <Option value={'5'}>已完成</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span="10">
                        <FormItem label="订单模板"
                                  {...labelCol}>
                            {getFieldDecorator('temp', {
                                initialValue: detail.temp,
                                rules: [
                                    // {required: true, message: `订单类型不能为空`},
                                ],
                            })(
                                <Select placeholder="请选择订单模板"
                                        style={{width: '100%'}}>
                                    <Option value={'1'}>12</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span="10">
                        <FormItem label="模板类型"
                                  {...labelCol}>
                            {getFieldDecorator('ftype', {
                                // initialValue: detail.ftype,
                                rules: [
                                    {required: true, message: `仓库不能为空`},
                                ],
                            })(
                                <Select placeholder="请选择模板类型"
                                        style={{width: '100%'}}>
                                    <Option value={'筹备模板'}>筹备模板</Option>
                                    <Option value={'柠檬模板'}>柠檬模板</Option>
                                    <Option value={'正常模板'}>正常模板</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <Row>
                    <div style={{margin: '10px 0 20px',textAlign:'center'}}>
                        <Button color="#108ee9"
                                icon="plus"
                                onClick={() => {
                                    this.clickAddRow()
                                }}
                        >选择商品并可以添加多个</Button>
                    </div>

                    {this.createHeader()}
                    {this.createGoods()}
                </Row>
                <Row>
                    <Button type="primary"
                            style={{margin: '10px 20px'}}
                            onClick={() => {
                                this.okHandle()
                            }}
                    >提交</Button>
                    <Button type="default"
                            style={{margin: '10px 20px'}}
                            onClick={() => {

                            }}
                    >重置</Button>
                </Row>
                {modalVisible && <SelectGoodsDialog  {...parentMethods}
                                                     {...listProps}
                                                     modalVisible={modalVisible}
                                                     tag_lines={tag_lines}
                                                     tag_warehouse={tag_warehouse}
                />}
            </Card>
        );
    }
}

export default connect(({app, AddOrEditOrderPage, loading, dispatch, location}) =>
    ({app, AddOrEditOrderPage, loading, dispatch, location})
)(Form.create({})(AddOrEditOrderPage))



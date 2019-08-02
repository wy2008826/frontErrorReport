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
    Button
} from 'antd';

import React, {PureComponent,Component, Fragment} from 'react';
import classnames from "classnames";
import styles from './List.less'

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const Search = Input.Search


class SelectGoodsDialog extends Component {
    state = {
        formValues: {},
    };


    componentDidMount(){
        const {

        }=this.state;

        const {
            dispatch,
            tag_lines,
            tag_warehouse
        }=this.props;


        this.handleSearch();//页面加载既需要加载所需的数据

    }
    onAddGoods() {//添加完商品后需要处理表单中的商品数据
        const {
            onAddGoods,
            handleModalVisible
        } = this.props;
        handleModalVisible(false,null);
    }
    handleSearch=()=>{//搜索功能
        const {
            form,
            tag_lines,
            tag_warehouse,
            dispatch
        } = this.props;

        const name=form.getFieldValue('name')||'';
        const params={
            tag_lines,
            tag_warehouse,
            name
        }

        dispatch({
            type:'AddOrEditOrderTemplate/queryGoods',
            payload:{
                tag_lines,
                tag_warehouse,
                name
            }
        })

    }
    getColumns=()=>{//生成colume数据
        const columns = [
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
                dataIndex: 'productsClassify',
                key: 'productsClassify',
                render:(val)=>{
                    return val.name
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
            handleModalVisible,
            rowSelection,
            ...tableProps
        } = this.props;

        const {

        }=this.state;

        const {getFieldDecorator} = form;

        return (
            <Modal title={'选择商品'}
                   visible={modalVisible}
                   onOk={()=>{this.onAddGoods()}}
                   onCancel={() => handleModalVisible(false, null)}
                   footer={<Button type={'primary'} onClick={()=>{this.onAddGoods()}}>确定</Button>}
                   okText="确定"
                   cancelText=''
                   width="800px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >213213
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
                        {...tableProps}
                        bordered
                        scroll={{ y: 240 }}
                        columns={this.getColumns()}
                        simple
                        rowKey={record => record.id}
                        rowSelection={rowSelection}
                        // getBodyWrapper={getBodyWrapper}
                    />
                </Card>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(SelectGoodsDialog);

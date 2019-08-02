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
            taglineIdList,
            tag_warehouse
        }=this.props;


        this.handleSearch();//页面加载既需要加载所需的数据

    }
    onAddGoods() {//添加完商品后需要处理表单中的商品数据
        const {
            detail={},
            dispatch,
            handleSelectGoodsModalVisible,
            rowSelection={},
            dataSource,//弹框中的内容
        } = this.props;


        dispatch({
            type:'OrderDetail/addGood',
            payload:{

            }
        })


    }
    handleSearch=(page={})=>{//搜索功能
        const {
            detail={},
            form,
            dispatch
        } = this.props;

        const name=form.getFieldValue('name')||'';

        dispatch({
            type:'OrderDetail/queryGoods',
            payload:{
                page:page.current || 1,
                pageSize:page.pageSize || 10,
                shopId:detail.shopId,
                tempId:detail.tempTypeMapVo && detail.tempTypeMapVo.id,
                productName:name
            }
        })
    }
    onPageChange=(page)=>{//页码发生变化
        this.handleSearch(page)
    }
    getColumns=()=>{//生成colume数据
        const columns = [
            {
                title: '名称',
                dataIndex: 'productName',
                key: 'productName',
            },
            {
                title: '编码',
                dataIndex: 'code',
                key: 'code',
                // width: 64,
            },
            {
                title: '分类',
                dataIndex: 'classifyName',
                key: 'classifyName',
                // render:(val)=>{
                //     return val && val.name
                // }
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
                title: '最大值',
                dataIndex: 'limit',
                key: 'limit',
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
                   width="800px"
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
                        {...tableProps}
                        bordered
                        hideDefaultSelections={true}
                        // scroll={{ y: 240 }}
                        columns={this.getColumns()}
                        simple
                        onChange={(page)=>{this.onPageChange(page,{name:getFieldValue('name'),taglineIdList})}}
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

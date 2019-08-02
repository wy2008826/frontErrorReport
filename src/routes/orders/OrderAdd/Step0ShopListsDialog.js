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


class Step0ShopListsDialog extends Component {
    state = {

    };


    componentDidMount(){
        const {

        }=this.state;


        this.handleSearch({
            current:1,
        });//页面加载既需要加载所需的数据

    }
    handleSearch=(page={current:1,pageSize:10})=>{//执行查询店铺逻辑
        const {
            form,
            wareHouseId,
            tagLineId,
            dispatch,
            selectShopType
        }=this.props;

        const {
            getFieldValue
        }=form;

        // console.log(getFieldValue('name'));
        //这里调用的是路线规划那里的查询店铺列表接口
        setTimeout(()=>{
            dispatch({
                type:'OrderAdd/searchShopByTagline',
                payload:{
                    wareHouseId:selectShopType==1?wareHouseId:undefined,
                    lineId:selectShopType==1?tagLineId:undefined,
                    paging:1,//是否分页
                    page:page.current,//当前页码
                    pageSize:page.pageSize || 10,
                    search:getFieldValue('name'),
                    status:getFieldValue('status'),//店铺状态
                }
            })
        },5)
    }
    onAddShops=()=>{//添加店铺
        alert('add shops');
    }
    onPageChange=(page)=>{//页码发生变化
        this.handleSearch(page)
    }
    getColumns=()=>{//生成colume数据
        const columns = [
            {
                title: '仓库',
                dataIndex: 'wareHouseList',
                key: 'wareHouseList',
                render: val => {
                    return (val||[]).map((item,i)=>{
                        const {
                            name,
                            id
                        }=item;
                        return name
                    })
                },
            },
            {
                title: '路线名称',
                dataIndex: 'lineList',
                key: 'lineList',
                render: val => {
                    return (val||[]).map((item,i)=>{
                        const {
                            name,
                            id
                        }=item;
                        return name
                    })
                },
            },
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '店铺编码',
                dataIndex: 'code',
                key: 'code',
                // width: 64,
            },
            {
                title: '店铺状态',
                dataIndex: 'status',
                key: 'status',
                width: 80,
                render: val => {
                    return <span style={{color:this.props.shopStatusColorConfig[val.name]||'#666'}}>{val.name}</span>
                },
            },
        ];
        return columns;
    }
    render() {
        const {
            shopModalVisible,
            toggleShopModalDialog,
            form,
            selectShopType,
            ShopStatusSelect,
            ...shopDialogListsProps,
        } = this.props;

        const {

        }=this.state;

        const {
            getFieldDecorator,
            getFieldValue
        } = form;

        //店铺状态下拉框
        const shopStatusOptions = ShopStatusSelect.map((item, i) => {
            const {
                id,
                name
            } = item;
            if (name) {
                return <Option value={id} key={name + id}>{name}</Option>
            }
        });

        return (
            <Modal title={'选择店铺'}
                   visible={shopModalVisible}
                   onOk={toggleShopModalDialog}
                   onCancel={toggleShopModalDialog}
                   okText="确定"
                   cancelText='取消'
                   width="800px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >
                <Row>
                    <Col span={8}>
                        <FormItem >
                            {getFieldDecorator('status', {
                                initialValue: '',
                            })(
                                <Select placeholder="请选择店铺状态"
                                        onChange={()=>{this.handleSearch()} }
                                        style={{width: '100%'}}
                                >
                                    <Option value={''}>全部状态</Option>
                                    {shopStatusOptions}
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
                                <Search placeholder="店铺名称、编码"
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
                        {...shopDialogListsProps}
                        bordered
                        hideDefaultSelections={true}
                        // scroll={{ y: 240 }}
                        type={selectShopType==1?'checkbox':'radio'}
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

export default Form.create(({ loading }) => ({ loading }))(Step0ShopListsDialog);

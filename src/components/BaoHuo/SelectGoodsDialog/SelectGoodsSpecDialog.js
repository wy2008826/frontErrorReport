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
} from 'antd';

import React, {Component} from 'react';
import {message} from "antd/lib/index";
import styles from './specIndex.less';

const FormItem = Form.Item;
const Search = Input.Search
const Option = Select.Option;

const expandedRowRender = (data, {outerDialogGoods, form, noShopCar = false} = {}, rowSelection) => {
    const columns = [
      { title: '编码', dataIndex: 'code', key: 'code' },
      {
         title: '规格',
            // dataIndex: 'name',
         key: 'name',
         render:(row)=>{
           return row.name||'-'
         }
      },
      { title: '最小购买单位', dataIndex: 'stockUnit', key: 'stockUnit'},
      { title: '价格', dataIndex: 'price', key: 'price' },
    ];

    return (
      <Table
        columns={columns}
        dataSource={data.productSpecList.map(val => {
            val.key = val.id + '' // 商品规格Id
            val.pid = data.id + ''// 商品Id
            // val.spec = val.name
            val.goodsName = data.name // 商品名称
            val.spec = val.name // 商品名称
            val.productId = data.id + ''// 商品Id
            val.pictureList = data.pictureList
            val.productSpecId = val.id + ''
            val.unitName = data.wareUnit ? data.wareUnit.unitName : ''
            val.unitNameCode = data.wareUnit ? data.wareUnit.code : ''
            val.storageTypeId = data.storageTypeId ? data.storageTypeId + '' : '';
            return val
        })}
        rowSelection={rowSelection}
        pagination={false}
      />
    );
};

class SelectGoodsSpecDialog extends Component {
    state = {
        selectedGoods: [],
        formValues: {},
        // dataSource: [],
        tableFormName:'canSelectGoodsList',//canSelectGoodsList
    };
    rowSelection = {
        // selectedRowKeys:[],
        getCheckboxProps: record =>{//对于模板列表中已经有的商品，列表中不需要做删除操作
            const checkFn = this.props.getDefaultCheck ? this.props.getDefaultCheck.bind(this, record) : (val => {
                return (val.id === record.id + '' || val.productSpecId === record.id + '')
            })
            return {
                disabled: this.props.outerDialogGoods.some(checkFn), // 该行会被禁止掉选中操作
            }
        },
        onSelect: (record, selected)=>{
            const selectedGoods = [...this.state.selectedGoods]
            if (this.props.onSelect) this.props.onSelect(record, selected)

            if (selected) {
                record.spec = record.name
                // record.name = record.goodsName
                selectedGoods.push(record)
                if(!record.productNum){
                    record.productNum = record.step || 1;
                }
            } else {
                const index = selectedGoods.findIndex(val => val.id === record.id)
                if (~index) {
                    selectedGoods.splice(index, 1)
                }
                record.productNum = ''
            }
            this.setState(() => ({
                selectedGoods
            }))
        },
        onSelectAll: (selectCheck, selectedRowCheck, restSelect) => {
            const seletRows = [...this.state.selectedGoods]
            if (this.props.onSelect) this.props.onSelect(restSelect, selectCheck)
            if (selectCheck && restSelect.length) { // 全部选中的情况下, 将之前未勾选中的数据添加进来
                seletRows.push(...restSelect)
            } else if (!selectCheck) { // 全部未选中的情况下, 删除之前已经选中的数据
                restSelect.forEach(rest => {
                    const selectIndex = seletRows.findIndex(val => val.id === rest.id)
                    if (~selectIndex) seletRows.splice(selectIndex, 1)
                })
            }
            restSelect.forEach(row => {
                row.productNum = selectCheck ? (row.step || 1) : ''
            })
            this.setState(() => ({
                selectedGoods: seletRows
            }))
        }
    }

    componentDidMount(){
        const {

        }=this.state;

        const {
            dispatch,
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
        if (this.props.onClickOk) return this.props.onClickOk(this.state.selectedGoods)
        const {
            onClickOkAdd
        } = this.props;

        const {
            selectedGoods
        } = this.state;
        const isEveryNotZero = selectedGoods.every(item => item && item.productNum > 0 );
        if(!isEveryNotZero){
            message.warn('请确保手动勾选的商品填写了商品数量！');
            return;
        };
        onClickOkAdd(selectedGoods);//点击了确认弹框
    }

    handleSearch=(page=1)=>{//搜索功能
        const {
            form,
            dispatch,
            modalName,
            filterQuery,//路线
        } = this.props;

        this.setState({
            selectedGoods:[]
        });
        setTimeout(()=>{
            const classifyId =form.getFieldValue('classifyId')||'';
            const name=form.getFieldValue('name')||'';
            dispatch({
                type:`${modalName}/queryGoods`,
                payload:{
                    ...filterQuery,
                    up:true,
                    name,
                    classifyId,
                    page,
                    pageSize:10
                }
            })
        },2);
    }
    getColumns=()=>{
        const {
            allOuterColumns,
        }=this.props;
        return allOuterColumns;
    }

    render() {
        const {
            modalVisible,
            form,
            handleModalVisible,
            rowSelection,
            GoodsClassifySelects,
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
                   className={styles.specModal}
                   bodyStyle={{
                       overflowY: 'scroll',
                       paddingBottom: '0',
                   }}
            >
                <Row>
                    <Col span={8}>
                        <FormItem >
                            {getFieldDecorator('classifyId', {
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
                <Card>
                    <Table
                        {...tableProps}
                        bordered
                        columns={this.getColumns()}
                        simple
                        onChange={ (page)=>{ this.handleSearch(page.current) } }
                        rowKey={record => (record.id + '')}
                        scroll={{ y:300 }}
                        expandedRowRender={record => expandedRowRender(record, this.props, this.rowSelection)}
                    />
                </Card>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(SelectGoodsSpecDialog);

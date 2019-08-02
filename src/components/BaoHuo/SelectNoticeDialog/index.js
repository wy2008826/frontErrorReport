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


class SelectNoticeDialog extends Component {
    state = {
        tableFormName:'canSelectNoticeList',//canSelectNoticeList
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
            type: 'app/getNoticeClassifySelect',
        });

        this.handleSearch(1);//页面加载既需要加载所需的数据

    }
    componentWillReceiveProps(props){
        const {
            pagination
        }=props;

        //每次接收props的时候更新tableformName   避免进入弹框后的第一页表单数据 和直接搜索的第一页数据导致冲突
        this.setState({
            tableFormName:'canSelectNoticeList'+pagination.current +'-'+ new Date()*1
        });
    }
    onAddNotice=()=>{

        const {
            form,
            selectNoticeInDialogBySelf,
            rowSelection:{
                selectedRowKeys
            },
            onClickOkAdd,
            rejectColumn,
            dataSource,
            outerDialogNoticeKey
        } = this.props;

        const {
            getFieldValue
        }=form;

        const formKeyName =this.state.tableFormName ;

        // //弹框中可选的商品  排除了弹框外面已经选择的商品
        const canSelectRows=rejectColumn?getFieldValue(formKeyName):dataSource;


        //已经选中的商品
        const selectedNotice =selectNoticeInDialogBySelf.filter(item => outerDialogNoticeKey.indexOf(item.id)<0);


        const ZeroRows =rejectColumn? selectedNotice.filter(item => item && !item[rejectColumn.rejectKey]  ):true;


        // console.log('canSelectNoticeList:' , canSelectNoticeList , 'selectNoticeInDialogBySelf:',selectNoticeInDialogBySelf ,'selectedNotice:',selectedNotice);

        if(rejectColumn && ZeroRows.length){
            message.warn(`请确保手动勾选的商品（${ZeroRows[0].name}）填写了${rejectColumn.rejectTitle}！`);
            return;
        }

        // console.log('selectNoticeBySelf:',selectNoticeBySelf,'selectedNotice:',selectedNotice);


        //对弹框中的数据和列表中的数据进行组装
        if(rejectColumn){
            (canSelectRows||[]).map((select,i)=>{
                selectedNotice.map((s,i)=>{
                    if(select.id == s.id){
                        selectedNotice[i]={
                            ...select,
                            ...s,
                            [rejectColumn.rejectKey]:select[rejectColumn.rejectKey]
                        }
                    }

                })
            });
        }

        onClickOkAdd(selectedNotice);//点击了确认弹框
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
                type:`${modalName}/queryNotice`,
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
                selectNoticeInDialogBySelf:[],
            }
        })
    }
    getColumns=()=>{//生成colume数据\
        const {
            form,
            outerDialogNotice,
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
                title: '标题',
                dataIndex: 'noticeTitle',
                key: 'noticeTitle',
            },
            {
                title: '公告类型',
                dataIndex: 'noticeClassify',
                key: 'noticeClassify',
                // width: 64,
            },
            // {
            //     title: '商品分类',
            //     dataIndex: 'productsClassifyList',
            //     key: 'productsClassifyList',
            //     render:(val)=>{
            //         return (val||[]).map((item)=>{
            //             return item.productClassifyName
            //         })
            //     }
            // }
        ];

        const CartNum = {
            // title: `${rejectColumn.rejectTitle}`,
            // key: `${rejectColumn.productNum}`,
            render:(row,i,j)=>{
                const isDisabled = getCheckboxProps(row).disabled;
                const formKeyName =this.state.tableFormName ;


                const disabledCart = (outerDialogNotice || []).filter(item => (item.productId+'') == (row.id + '' ) );

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
            columns.splice(columns.length,0,CartNum)
        }
        return columns;
    }
    render() {
        const {
            modalVisible,
            form,
            handleModalVisible,
            rowSelection,
            NoticeClassifySelects,
            ...tableProps
        } = this.props;

        const {
            getFieldDecorator,
        } = form;

        const NoticeClassifyOptions=(NoticeClassifySelects || []).map((item,i)=>{
            const {
                id,
                name
            }=item;
            if(name){
                return <Option value={id} key={name+id}>{name}</Option>
            }
        });

        return (
            <Modal title={'选择通知公告'}
                   visible={modalVisible}
                   onOk={()=>{this.onAddNotice()}}
                   onCancel={() => handleModalVisible(false, null)}
                   footer={<Button type={'primary'} onClick={()=>{this.onAddNotice()}}>确定</Button>}
                   okText="确定"
                   cancelText=''
                   width="1000px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >
                <Card >
                    <Table
                        {...tableProps}
                        bordered
                        columns={this.getColumns()}
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

export default Form.create(({ loading }) => ({ loading }))(SelectNoticeDialog);

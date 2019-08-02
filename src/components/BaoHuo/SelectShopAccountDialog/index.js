
const {
    Row,
    Col,
    Form,
    Input,
    Modal,
    Card,
    Table,
    Button,
    Select,
    InputNumber,
    message
} =window.ANTD;

const {
    React,
    Component
} = window;


const FormItem = Form.Item;
const Search = Input.Search
const Option = Select.Option;


class SelectShopAccountDialog extends Component {
    state = {
        tableFormName:'canSelectShopAccountList',

    };


    componentDidMount(){
        const {

        }=this.state;
        this.handleSearch(1);
    }
    componentWillReceiveProps(props){
        const {
            pagination
        }=props;

        //每次接收props的时候更新tableformName   避免进入弹框后的第一页表单数据 和直接搜索的第一页数据导致冲突
        this.setState({
            tableFormName:'canSelectShopAccountList'+pagination.current +'-'+ new Date()*1
        });
    }
    onAddItems=()=>{//新增选项

        const {
            form,
            onClickOkAdd,
        } = this.props;

        const {

        }=form;


        onClickOkAdd();//点击了确认弹框
    }

    handleSearch=(page=1)=>{//搜索功能
        const {
            form,
            dispatch,
            modalName,
        } = this.props;

        setTimeout(()=>{
            const name=form.getFieldValue('name')||'';
            dispatch({
                type:`${modalName}/queryShopAccounts`,
                payload:{
                    search:name,
                    page,
                    pageSize:10
                }
            })
        },2);
    }
    getColumns=()=>{//生成colume数据\
        const columns = [
            {
                title: '创建时间',
                dataIndex: 'createdTime',
                key: 'createdTime',
            },
            {
                title: '姓名',
                dataIndex: 'userName',
                key: 'userName',
            },
            {
                title: '性别',
                // dataIndex: 'sex',
                key: 'sex',
                render:(row)=>{
                    return !row.sex?'男':'女'
                }
            },
            {
                title: '账号',
                dataIndex: 'userAccount',
                key: 'userAccount',
            },
            {
                title: '关联店铺',
                dataIndex: 'relationShopCount',
                key: 'relationShopCount',
            },
        ];
        return columns;
    }
    render() {
        const {
            modalVisible,
            form,
            handleModalVisible,
            rowSelection,
            ...tableProps
        } = this.props;

        const {
            getFieldDecorator,
        } = form;

        return (
            <Modal title={'选择账号'}
                   visible={modalVisible}
                   onOk={()=>{this.onAddItems()}}
                   onCancel={() => handleModalVisible({flag:false,modelKey:'selectShopAccountModalVisible'})}
                   footer={<Button type={'primary'} onClick={()=>{this.onAddItems()}}>确定</Button>}
                   okText="确定"
                   cancelText=''
                   width="800px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >
                <Row>
                    <Col span={8} push={16}>
                        <FormItem >
                            {getFieldDecorator('name', {
                                initialValue:'',
                                rules: [
                                ],
                            })(
                                <Search placeholder="输入输入姓名/账号"
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
                        columns={this.getColumns()}
                        simple
                        onChange={ (page)=>{ this.handleSearch(page.current) } }
                        rowKey={record => record.id}
                        rowSelection={rowSelection}
                    />
                </Card>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(SelectShopAccountDialog);

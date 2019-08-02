const {
    Button,
    Popconfirm
} = window.ANTD

const {
    React,
    Component
} = window

import List from './List'
import styles from './index.less';
import {connect} from 'dva'

class Step1 extends Component {

    state = {

    }

    toNextStep=()=>{//下一步
        const {
            dispatch,
            inputData,
            modelName,
        }=this.props;



        dispatch({
            type:`${modelName}/createSubmitShops`,
        })
    }

    onDeleteItem=(item)=>{//删除单行数据

        const {
            selectedRowKeys,
            modelName
        } = this.props

        this.props.dispatch({
            type: `${modelName}/delete`,
            payload:{
                ids:item?[item]:selectedRowKeys,
            }
        })
    }

    toAheadStep = () => {

        const {
            dispatch,
            modelName,
        }=this.props;

        dispatch({
            type:`${modelName}/updateState`,
            payload:{
                current:0
            }
        })
    }

    render() {

        const {
            onDeleteItem
        } = this

        const submitDisabled = !(this.props.inputData.filter(it => it.result).length > 0 && this.props.inputData.length != 0)

        const {
            dispatch,
            inputData,
            selectedRowKeys,
            tableColumns,
            modelName
        } = this.props

        const trueNumber = inputData.filter(it => it.result).length
        const errorNumber = inputData.filter(it => !it.result).length

        const listProps = {//表格列表
            dispatch,
            // ShopStatusSelect,
            dataSource: inputData||[],
            onDeleteItem,
            // loading: loading.effects['Shops/query'],
            // pagination,
            location,
            tableColumns,
            // isMotion,
            // onChange:onPageChange,
            // onClickEditItem:handleModalVisible,
            rowSelection: {
                selectedRowKeys,
                onChange: (keys) => {
                    dispatch({
                        type: `${modelName}/updateState`,
                        payload: {
                            selectedRowKeys: keys,
                        },
                    })
                },
            },
        }

        return (
            <div>
                <div className={styles.verify}>
                    <div>验证情况：</div>
                    <span>正确</span>
                    <span  style={{color:'green'}}>{trueNumber}</span>
                    <span>条；</span>
                    <span>错误</span>
                    <span style={{color:'red'}}>{errorNumber}</span>
                    <span>条；</span>
                    <span>只能导入验证正确的数据</span>
                </div>

                <div className={styles.tableList}>
                    <div className={styles.tableListOperator}>

                        {selectedRowKeys.length > 0 && <span>
             {`已选择 ${selectedRowKeys.length} 条数据 `}
                            <Popconfirm title={'确定要删除选择的数据?'} placement="left" onConfirm={() => {
                                onDeleteItem();
                            }}>
                  <Button type="primary" size="small" style={{marginLeft: 8}}>删除？</Button>
                </Popconfirm>
             </span>}
                    </div>
                    <List {...listProps} />

                </div>


                <div className={styles.bottomBtn}>
                    <div>
                        <Button
                                onClick={() => {
                                    this.toAheadStep()
                                }}
                                >取消
                        </Button>
                        <Button type="primary"
                                disabled={submitDisabled}
                                onClick={() => {
                                    this.toNextStep()
                                }}
                                >下一步
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(({app, loading, dispatch, location}) => ({
    app,
    loading,
    dispatch,
    location
}))(Step1)
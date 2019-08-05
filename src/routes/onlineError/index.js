
const {
    moment,
    React,
    Component
} = window;


const {
    useState,
    useEffect
} = React;

const {
    Card,
    Row,
    Table,
    Col,
    Tag,
    Select,
} = window.ANTD

const {Option} = Select;

//绘制图图表用到的插件




import {connect} from "dva";
import {avator} from 'utils/config'

import styles from './index.less';






const modelName='OnlineError';


const OnlineError = (props)=>{


    const {
        app={},
        OnlineError,
        dispatch
    }=props;

    const {
        menu,
        user={}
    }=app;


    useEffect(()=>{
        dispatch({
            type:`${modelName}/getLatestError`,
            payload:{
            }
        });
    },[]);


    const {
        list,
    }=OnlineError;


    const columns = [
        {
            title: '平台信息',
            key: 'userSystemInfo',
            width:200,
            render:(row) => {
                const {
                    userSystemInfo = {}
                } = row || {}
                return <div>
                    <p>{userSystemInfo.system || ''}</p>
                    <p className={styles.userAgent}>
                        {userSystemInfo.useragent || ''}
                    </p>
                </div>;
            },
        },
        {
            title: '时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
        {
            title: '所在项目',
            dataIndex: 'hostname',
            key: 'hostname',
        },
        {
            title: '出错源文件',
            dataIndex: 'source',
            key: 'source',
        },
        {
            title: '出错行号',
            dataIndex: 'line',
            key: 'line',
        },
        {
            title: '出错源码',
            // dataIndex: 'originCode',
            key: 'originCode',
            render: row => {
                return  <p className={styles.originCode}>
                    {row.originCode}
                </p>
            }
        },
    ]
    return (
        <div className={styles.errorContainer}>

            <Card title={'js报错'}>
                <Table
                    dataSource={list}
                    pagination={false}
                    bordered
                    columns={columns}
                    simple
                    rowKey={record => record.id}
                />
            </Card>
        </div>
    )
}


export default connect(({
                            app,
                            OnlineError,
                            Orders,
                            SurrenderOrder,
                            dispatch
}) => ({app,OnlineError,Orders,SurrenderOrder,dispatch}))(OnlineError)

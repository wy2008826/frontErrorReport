
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

    console.log('list:',list);


    const columns = [
        {
            title: '平台信息',
            key: 'userSystemInfo',
            width:300,
            render:(row) => {
                const {
                    userSystemInfo = {}
                } = row || {}
                return <div>
                    <p>{userSystemInfo.system || ''}</p>
                    <p>
                        {userSystemInfo.useragent || ''}
                    </p>
                </div>;
            },
        },
        {
            title: '项目',
            dataIndex: 'hostname',
            key: 'hostname',
        },
        {
            title: '文件',
            dataIndex: 'source',
            key: 'source',
        },
        {
            title: '源码',
            dataIndex: 'originCode',
            key: 'originCode',
        },
        {
            title: '位置',
            // dataIndex: 'shippingMethod',
            key: 'orderType',
            render(row, item) {
                return <Tag color={item.type ? "#eb2f96" : "#1890ff"}>{item.type ? '预售' : '正常'}</Tag>
            }
        }
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
                {
                    (list||[]).map(function (item,i) {
                        return <div className={styles.errorRow}>
                            <p className={styles.source}>{item.source}{item.source}{item.source}</p>
                            <p className={styles.name}>{item.name}</p>
                            <p className={styles.originCode}> {item.originCode}</p>
                            <p className={styles.createTime}>{item.createTime}</p>
                        </div>
                    })
                }
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

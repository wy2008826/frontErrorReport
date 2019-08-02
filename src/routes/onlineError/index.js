import { Link } from 'react-router-dom';


const {
    moment,
    React,
    Component
} = window;

const {
    Card,
    Row,
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

class OnlineError extends Component {
    state = {}

    componentDidMount() {
        const {
            OnlineError,
            dispatch
        }=this.props;

        const {
            surrenderDate
        }=OnlineError;

        //获取交单时间下拉框列表
        dispatch({
            type:`${modelName}/getLatestError`,
            payload:{
            }
        });

    }
    componentWillUnmount(){
        const {
            dispatch,
            Home,
        }=this.props;

        const {
            orderCount,
            orderDetailData
        }=Home;

        this.props.dispatch({
            type:`${modelName}/updateState`,
            payload:{
                surrenderDate:'',
                orderCount,
                orderDetailData
            }
        });
    }

    render() {

        const {
            getSurrenderData
        }=this;

        const {
            app={},
            OnlineError,
        }=this.props;

        const {
            menu,
            user={}
        }=app;


        const {
            list,
        }=OnlineError;

        console.log('list:',list);

        return (
            <div className={styles.homeContainer}>
                <Row gutter={10} >
                    <Card title={'2213'}>
                        {
                            (list||[]).map(function (item,i) {
                                return <div>
                                    {item.source}
                                    {item.name}
                                    {item.originCode}
                                    {item.createTime}
                                </div>
                            })
                        }
                    </Card>

                </Row>
            </div>
        )
    }
};

export default connect(({
                            app,
                            OnlineError,
                            Orders,
                            SurrenderOrder,
                            dispatch
}) => ({app,OnlineError,Orders,SurrenderOrder,dispatch}))(OnlineError)

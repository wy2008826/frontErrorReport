import {
    Form,
    Icon,
    Button
} from 'antd';

import React, {PureComponent, Component, Fragment} from 'react';
import {connect} from 'dva';
import {Link} from 'react-router-dom'
import styles from './index.less';

class Step2 extends PureComponent {
    state = {

    };

    componentDidMount() {
        const {

        } = this.state;

        const {
            dispatch,
        } = this.props;
    }

    render() {
        const {
            form,
            selectedShopRows
        } = this.props;
        const {

        } = this.state;

        const {getFieldDecorator} = form;

        return (
            <div className={styles.step3}>
                <div className={styles.container}>
                    <Icon type="check-circle-o" />
                    <p className={styles.msg}>
                        成功创建 <span>{selectedShopRows.length}</span>张订单！
                    </p>
                    <Button>
                        <Link to="/orders">立即查看</Link>
                    </Button>
                </div>

            </div>
        );
    }
}

export default Form.create(({ loading}) => ({loading}))(Step2);

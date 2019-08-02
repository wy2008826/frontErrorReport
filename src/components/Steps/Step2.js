const {
    Form,
    Button,
    Icon
} = window.ANTD

const {
    React,
    PureComponent
} = window

import styles from './index.less';

class Step2 extends PureComponent {

    render() {
        const {
            resultNum,
            backUrl,
        } = this.props

        return (
            <div className={styles.step2}>
                <div>
                    <Icon type="check-circle" />
                    <p>{'成功导入' + resultNum + '条数据'}</p>
                    <Button onClick={() => {window.location.href=backUrl}}
                            >立即查看
                    </Button>
                </div>
            </div>
        )
    }
}

export default Form.create(({ loading}) => ({loading}))(Step2);

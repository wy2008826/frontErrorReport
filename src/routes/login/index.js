import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Button, Row, Form, Input} from 'antd'
import {
    name as websiteName,
    logo as websiteLogo
} from 'utils/config'
import styles from './index.less'


const FormItem = Form.Item

const Login = ({
                   loading,
                   dispatch,
                   form: {
                       getFieldDecorator,
                       validateFieldsAndScroll,
                   },
               }) => {
    function handleOk() {
        validateFieldsAndScroll((errors, values) => {
            if (errors) {
                return
            }
            dispatch({type: 'login/login', payload: {...values}})
        })
    }

    return (
        <div className={styles.loginWraper}>
            <div className={styles.form}>
                <div className={styles.logo}>
                    <img alt={'logo'} src={websiteLogo}/>
                    <span>{websiteName}</span>
                </div>
                <form>
                    <FormItem hasFeedback>
                        {getFieldDecorator('account', {
                            rules: [
                                {
                                    required: true,message:'用户名不能为空'
                                },
                            ],
                        })(<Input size="large" onPressEnter={handleOk} placeholder="用户名"/>)}
                    </FormItem>
                    <FormItem hasFeedback>
                        {getFieldDecorator('password', {
                            rules: [
                                {
                                    required: true,message:'密码不能为空'
                                },
                            ],
                        })(<Input size="large" type="password" onPressEnter={handleOk} placeholder="密码"/>)}
                    </FormItem>
                    <Row>
                        <Button type="primary" size="large" onClick={handleOk} loading={loading.effects.login}>
                            登录
                        </Button>
                    </Row>
                </form>
            </div>
        </div>

    )
}

Login.propTypes = {
    form: PropTypes.object,
    dispatch: PropTypes.func,
    loading: PropTypes.object,
}

export default connect(({loading}) => ({loading}))(Form.create()(Login))

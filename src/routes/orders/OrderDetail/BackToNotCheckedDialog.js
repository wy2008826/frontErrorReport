import {
    Row,
    Col,
    Form,
    Input,
    Select,
    InputNumber,
    DatePicker,
    Modal,
    message,
    Tag
} from 'antd';
import React, {PureComponent, Component, Fragment} from 'react';
import {connect} from 'dva';

const FormItem = Form.Item;
const Option = Select.Option;

class BackToNotCheckedDialog extends Component {
    state = {

    };

    componentWillReceiveProps(props) {

    }

    componentDidMount() {
        const {

        } = this.state;


        const {

        } = this.props;


    }

    okHandle() {
        const {
            form,
            detail,
            backToNotChecked
        } = this.props;

        form.validateFields((err, fieldsValue) => {
            if (err) return;
            console.log(fieldsValue);
            backToNotChecked({
                ...fieldsValue,
                orderId :detail.id,
            });
        });
    }

    render() {
        const {
            modalVisible,
            form,
            activeDetail,
            handleBackModalVisible,
            detail
        } = this.props;


        const {

        } = this.state;

        const {getFieldDecorator} = form;
        const dialogTitle = '订单退回确认' ;

        const noticeLabel= <p style={{color:'#666'}}>{`是否将订单编号：${detail.code}，退回至待审核？`}</p>;


        return (
            <Modal title={dialogTitle}
                   visible={modalVisible}
                   onOk={() => {
                       this.okHandle()
                   }}
                   onCancel={() => handleBackModalVisible(false)}
                   okText="保存"
                   width="600px"
                   // bodyStyle={{
                   //     height: '400px',
                   //     overflowY: 'scroll'
                   // }}
            >
                <Row>
                    <Col span="20">
                        <FormItem label={noticeLabel} >
                            {getFieldDecorator('content', {
                                // initialValue: activeRow.finalProductNum,
                                rules: [
                                    // {required: true, message: `商品数量不能为空`},
                                    {validator:(rule, value, callback)=>{
                                            if(!value || value.length<=5){
                                                callback('内容长度不低于5个字符');
                                            }else{
                                                callback();
                                            }
                                        }
                                    }
                                ],
                            })(
                                <Input type={'textarea'}
                                       placeholder="填写退回理由（不少于5个字）"
                                       style={{height:'120px'}}
                                />
                            )}
                        </FormItem>
                    </Col>
                </Row>
            </Modal>
        );
    }
}

export default Form.create(({ loading}) => ({loading}))(BackToNotCheckedDialog);

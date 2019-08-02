import {
    Form,
    Input,
    Modal,
    InputNumber,
} from 'antd';
import React, {Component,} from 'react';

const FormItem = Form.Item;

class ChangePriceDialog extends Component {
    state = {

    };
    componentWillReceiveProps(props){

    }
    componentDidMount(){

    }

    okHandle() {
        const {
            form,
            handleChangePriceModalSubmit,
        } = this.props;

        form.validateFields((err, fieldsValue) => {
            if (err) return;
            handleChangePriceModalSubmit({
                ...fieldsValue,
            });
        });
    }
    render() {
        const {
            modalVisible,
            form,
            handleModalVisible,
        } = this.props;


        const {getFieldDecorator} = form;

        return (
            <Modal title={'批量设置结算价'}
                   visible={modalVisible}
                   onOk={()=>{this.okHandle()}}
                   onCancel={() => handleModalVisible('changePriceModalVisible',false)}
                   okText="确认"
                   width="600px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >
                <FormItem label="结算价"
                          labelCol={{span: 6}}
                          wrapperCol={{span: 12}}>
                    {getFieldDecorator('finalProductPrice', {
                        initialValue:'',
                        rules: [
                            {required: true, message: `结算价不能为空`},
                        ],
                    })(
                        <InputNumber placeholder="请输入结算价"
                                     min={0}
                                     style={{width:'100%'}}
                        />
                    )}
                </FormItem>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(ChangePriceDialog);

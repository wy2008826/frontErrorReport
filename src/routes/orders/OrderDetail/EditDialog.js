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

class EditDialog extends Component {
    state = {

    };

    componentWillReceiveProps(props) {

    }

    componentDidMount() {
        const {

        } = this.state;


        const {
            activeRow,
        } = this.props;


    }

    okHandle() {
        const {
            form,
            handleDialogSubmit,
            activeRow,
            detail,
        } = this.props;


        form.validateFields((err, fieldsValue) => {
            if (err) return;
            handleDialogSubmit({
                ...fieldsValue,
                id:activeRow?activeRow.id:'',
                orderId:detail.id,
                productId:activeRow.productId,//商品id
                proSpecId:activeRow.proSpecId,//商品规格id
                productCode:activeRow.productCode,//商品规格code
            }, 'update' );
        });
    }

    render() {
        const {
            modalVisible,
            form,
            handleDialogSubmit,
            handleModalVisible,
            activeRow,
            activeDetail
        } = this.props;
        const {

        } = this.state;

        const {getFieldDecorator} = form;
        const dialogTitle = '编辑商品' ;

        return (
            <Modal title={dialogTitle}
                   visible={modalVisible}
                   onOk={() => {
                       this.okHandle()
                   }}
                   onCancel={() => handleModalVisible(false, null)}
                   okText="保存"
                   width="600px"
                   // bodyStyle={{
                   //     height: '400px',
                   //     overflowY: 'scroll'
                   // }}
            >
                <Row>
                    <Col span="20">
                        <FormItem label="数量"
                                  labelCol={{span: 6}}
                                  wrapperCol={{span: 12}}>
                            {getFieldDecorator('amount', {
                                initialValue: activeRow.finalProductNum,
                                rules: [
                                    {required: true, message: `商品数量不能为空`},
                                ],
                            })(
                                <Input placeholder="请输入商品数量"/>
                            )}
                        </FormItem>
                    </Col>
                </Row>
            </Modal>
        );
    }
}

export default Form.create(({ loading}) => ({loading}))(EditDialog);

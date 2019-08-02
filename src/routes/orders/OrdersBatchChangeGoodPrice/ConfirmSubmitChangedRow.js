import {
    Form,
    Modal,
    Button
} from 'antd';
import React, {Component} from 'react';

class ConfirmSubmitChangedRow extends Component {
    state = {

    };
    render() {
        const {
            modalVisible,
            handleModalVisible,
            submitPage
        } = this.props;



        const Footer=<div>
            <Button type={'default'}
                    onClick={() => handleModalVisible('confirmSubmitModalVisible',false)}>
                不保存
            </Button>
            {/*<Button type={'primary'}*/}
                    {/*onClick={()=>{submitPage(2)}}*/}
            {/*>*/}
                {/*保存并同步至订货价*/}
            {/*</Button>*/}
            <Button type={'primary'}
                    onClick={()=>{submitPage(1)}}
            >
                保存
            </Button>
        </div>;


        return (
            <Modal title={'提示'}
                   visible={modalVisible}
                   onCancel={() => handleModalVisible('confirmSubmitModalVisible',false)}
                   footer={Footer}
                   width="600px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >
               <div style={{lineHeight:'80px'}}>是否保存修改后的价格？</div>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(ConfirmSubmitChangedRow);

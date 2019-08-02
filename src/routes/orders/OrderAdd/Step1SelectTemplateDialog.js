import {
    Row,
    Col,
    Form,
    Input,
    Select,
    Modal,
    Radio,
    InputNumber,
    Card,
    Table,
    Button,
    message
} from 'antd';

import React, {PureComponent,Component, Fragment} from 'react';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const Search = Input.Search


class SelectTemplateDialog extends Component {
    state = {
        formValues: {},
        tableFormName:'',//canSelectGoodsList
    };


    componentDidMount(){
        const {

        }=this.state;

        const {
            dispatch,
            selectedShopRows,
            tagLineId
        }=this.props;


        //根据第一步选择的路线 调取订单模板接口
        dispatch({
            type:'OrderAdd/getTemplateByTagLine',
            payload:{
                // wareHouseId,
                statusId:selectedShopRows[0].status ? selectedShopRows[0].status.id:undefined,
                lineId:tagLineId
            }
        });

    }
    componentWillReceiveProps(props){

    }

    onLoadTemplateGoods=()=>{

        const {
            form,
            dispatch,
            selectGoodsBySelf,
            handleModalVisible,
            templateGoods,
            template
        } = this.props;

        const {
            getFieldValue
        }=form;

        console.log('template:',template);

        //根据模板查询模板商品列表
        dispatch({
            type: 'OrderAdd/getTemplateGoodsLists',
            payload:{
                id:template.id
            }
        });
    }
    onTemplateChange(e){//订单模板单选切换
        const {
            dispatch,
            templateTrees
        }=this.props;

        // console.log(templateTrees.lists,e.target.value,templateTrees.lists.indexOf(e.target.value));


        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                template:window.JSON.parse(e.target.value)//避免是对象导致的无法回显问题
            }
        })
    }
    render() {
        const {
            modalVisible,
            form,
            handleModalVisible,
            onChange,
            templateTrees,
            template
        } = this.props;

        const {
            onLoadTemplateGoods
        }=this;


        const {

        }=this.state;

        const {
            getFieldDecorator,
            getFieldValue
        } = form;


        //可选择的订单模板radios
        const TemplateRadios=(templateTrees.lists||[]).map((temp,i)=>{
            const {
                name,
                id
            }=temp;

            return <Radio style={{display:'block'}}
                          key={id+name}
                          value={window.JSON.stringify(temp)}>{name}
            </Radio>
        });


        return (
            <Modal title={'选择载入送货模板'}
                   visible={modalVisible}
                   onOk={onLoadTemplateGoods}
                   onCancel={() => handleModalVisible(false, null)}
                   okText="确定"
                   cancelText='取消'
                   width="600px"
                   bodyStyle={{
                       overflowY: 'scroll'
                   }}
            >
                <FormItem labelCol={{span: 6}}
                          wrapperCol={{span: 12}}>
                    {getFieldDecorator('templateId', {
                        initialValue:window.JSON.stringify(template),
                        rules: [
                            // {required: true, message: `请选择物流`},
                        ],
                    })(
                        <RadioGroup onChange={(_e)=>{this.onTemplateChange(_e)}}>
                            {TemplateRadios}
                        </RadioGroup>
                    )}
                </FormItem>
            </Modal>
        );
    }
}

export default Form.create(({ loading }) => ({ loading }))(SelectTemplateDialog);

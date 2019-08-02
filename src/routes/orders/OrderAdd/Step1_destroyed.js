import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Select,
    message,
    Tag,
    Button,
    Radio,
} from 'antd';

import React, {PureComponent, Component, Fragment} from 'react';
import {connect} from 'dva';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;


import styles from './index.less';


class Step1_destroyed extends PureComponent {
    state = {

    };

    componentDidMount() {

        const {
            dispatch,
            wareHouseId,
            tagLineId,
            selectedShopRows
        } = this.props;

        //根据第一步选择的路线 调取订单模板接口
        dispatch({
            type:'OrderAdd/getTemplateByTagLine',
            payload:{
                // wareHouseId,
                statusId:selectedShopRows[0].statusId,
                lineId:tagLineId
            }
        });

        //根据第一步选择的路线 调取可选的送货日期
        dispatch({
            type:'OrderAdd/getDeliveryDateByTagline',
            payload:{
                // wareHouseId,
                lineId:tagLineId
            }
        });
    }

    goStep=(step)=>{ //设置跳转步骤
        const {
            dispatch,
            form
        }=this.props;


        if(step==2){//下一步 需要校验当前页面的数据有没有填充完整
            const {
                getFieldValue
            }=form;

            let templateId =getFieldValue('templateId');
            let deliveryDate =getFieldValue('deliveryDate');
            console.log(templateId,deliveryDate,typeof templateId ,!templateId,!deliveryDate);

            if(templateId == 'null'){
                message.warn('请勾选订单模板！');
                return ;
            }
            if(deliveryDate == 'null'){
                message.warn('请勾选送货日期！');
                return ;
            }

            dispatch({
                type:'OrderAdd/updateState',
                payload:{
                    current:step
                }
            });
        }else{
            dispatch({
                type:'OrderAdd/updateState',
                payload:{
                    current:step
                }
            });
        }

    }
    onTemplateChange(e){//订单模板单选切换
        const {
            dispatch,
            templateTrees
        }=this.props;

        console.log(templateTrees.lists,e.target.value,templateTrees.lists.indexOf(e.target.value));


        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                template:window.JSON.parse(e.target.value)//避免是对象导致的无法回显问题
            }
        })
    }
    onDeliveryDateChange(e){//送货路线单选切换
        const {
            dispatch,
        }=this.props;

        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                deliveryDate:window.JSON.parse(e.target.value)
            }
        })
    }
    render() {
        const {
            form,
            templateTrees,
            deliveryDates,
            template,
            deliveryDate
        } = this.props;
        const {

        } = this.state;

        const {getFieldDecorator} = form;

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

        //送货日期可选列表radio
        const DeliveryDateRadios=(deliveryDates||[]).map((timeObj,i)=>{
            const {
                day,
                arrangementId
            }=timeObj;

            return <Radio style={{display:'block'}}
                          key={arrangementId+day}
                          value={window.JSON.stringify(timeObj)}>{day}
            </Radio>
        });

        return (
            <div>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title={<p className={styles.cardHead}>选择订单模板</p>}
                              className={styles.cardWithHeight}
                        >
                            <div>
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
                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title={<p className={styles.cardHead}>选择送货日期</p>}
                              className={styles.cardWithHeight}
                        >
                            <div>
                                <FormItem labelCol={{span: 6}}
                                          wrapperCol={{span: 12}}>
                                    {getFieldDecorator('deliveryDate', {
                                        initialValue:window.JSON.stringify(deliveryDate),
                                        rules: [
                                            // {required: true, message: `请选择物流`},
                                        ],
                                    })(
                                        <RadioGroup onChange={(_e)=>{this.onDeliveryDateChange(_e)}}>
                                            {DeliveryDateRadios}
                                        </RadioGroup>
                                    )}
                                </FormItem>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <div style={{textAlign:'center',padding:'20px'}}>
                    <Button style={{ margin:'10px' }}
                            onClick={() => this.goStep(0)} > 上一步</Button>
                    <Button style={{ margin:'10px' }}
                            type="primary"
                            onClick={() => this.goStep(2)} >下一步</Button>
                </div>
            </div>
        );
    }
}

export default Form.create(({ loading}) => ({loading}))(Step1_destroyed);

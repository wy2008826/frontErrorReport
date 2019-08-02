import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Select,
    message,
    Radio,
    Button,
    Icon,
} from 'antd';

import React, { Component} from 'react';


const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

import Step0ShopListsDialog from './Step0ShopListsDialog';
import styles from './index.less';


class Step0 extends Component {
    state = {

    };

    componentDidMount() {
        const {

        } = this.state;


        const {
            dispatch,
        } = this.props;


        //获取所有的仓库  同时获取第一个仓库下的所有路线
        dispatch({
            type:`OrderAdd/initWareHouseAndFirstTagline`
        });

    }
    cancelStep0=()=>{//第一步取消  返回到订单列表页面
        window.location.href='#/orders'
    }
    nextStep=()=>{//下一步
        const {
            selectedShopRows,
            dispatch,
            current,
            selectShopType,//1 多店 2 单店
        }=this.props;

        //收集已经选择的店铺的状态
        const statusArr=[];
        (selectedShopRows||[]).map((shop)=>{
            const {
                statusName
            }=shop;
            statusArr.indexOf(statusName)<0 && statusArr.push(statusName)
        });


        if(!(selectedShopRows.length)){
            message.warn('请至少选择一家店铺！');
            return ;
        }

        if(statusArr.length>1){//超过了一种状态
            message.warn('请确保已选中的店铺只有一种状态！');
            return ;
        }

        const countLimit=50;
        if(selectedShopRows.length>countLimit){
            message.warn(`最多支持${countLimit}家店铺批量下单！`);
            return ;
        }
        if(selectShopType==2){//单店方式
            dispatch({
                type:'OrderAdd/updateState',
                payload:{
                    tagLineId:selectedShopRows[0]['lineList']?selectedShopRows[0]['lineList'][0]['id']:'',
                }
            });
        }
        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                current:current+1,
            }
        });

    }
    onWareHouseChange(e) {
        const {
            dispatch,
        }=this.props;

        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                wareHouseId:e.target.value,
                selectedShopRowKeys:[],
                selectedShopRows:[],

                templateGoods:[],
                templateGoodsSelectsKeys:[]
            }
        });

        dispatch({
            type:'OrderAdd/getSingleLines',
            payload:{
                wareHouseIdList:[e.target.value]
            }
        });

    }
    onTagLineChange(e) {
        const {
            dispatch,
        }=this.props;


        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                tagLineId:e.target.value,
                selectedShopRowKeys:[],
                selectedShopRows:[],

                templateGoods:[],
                templateGoodsSelectsKeys:[]
            }
        });
    }
    onSelectShopTypeChange(e){//店铺选择模式
        const {
            dispatch,
            wareHousesTrees,
            wareHouseId
        }=this.props;


        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                selectShopType:e.target.value,
                selectedShopRowKeys:[],//选中的店铺key
                selectedShopRows:[],//已经选中的列表中的店铺
                templateGoods:[],//已经选中的商品
                templateGoodsSelectsKeys:[],//已经选中的商品ID
                tagLineId:wareHousesTrees[wareHouseId].tagLines.lists[0].id,
            }
        });
    }
    toggleShopModalDialog(falg){
        const {
            dispatch,
        }=this.props;

        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                shopModalVisible:falg||false
            }
        });
    }
    deleteShopSelected(shop){//点击删除选中的店铺 需要剔除掉keys以及选中的店铺数据
        const {
            dispatch,
            selectedShopRowKeys,
            selectedShopRows
        }=this.props;

        selectedShopRowKeys.splice(selectedShopRowKeys.indexOf(shop.shopId),1);
        selectedShopRows.splice(selectedShopRows.indexOf(shop),1);

        dispatch({
            type:'OrderAdd/updateState',
            payload:{
                selectedShopRowKeys,
                selectedShopRows
            }
        })
    }
    render() {
        const {
            modalVisible,
            form,
            handleDialogSubmit,
            handleModalVisible,
            activeRow,
            activeDetail,
            selectShopType,//选择店铺的模式

            wareHousesTrees,
            wareHouseId,
            tagLineId,
            shopModalVisible,
            dispatch,
            shopStatusColorConfig,
            selectedShopRows=[],//已经选择的店铺列表
            ...shopDialogListsProps,
        } = this.props;

        const {

        } = this.state;

        const {
            getFieldDecorator,
            getFieldValue
        } = form;

        //仓库id Radios集合
        const WareHouseRadios=(wareHousesTrees.lists||[]).map((house,i)=>{
            const {
                id,
                name,
            }=house;

            return <Radio style={{display:'block'}}
                          key={id+name}
                          value={id}>{name}
                          </Radio>
        });


        const tagLines=((wareHousesTrees[wareHouseId]||{}).tagLines||{}).lists||[];
        // //选中的仓库对应的路线Radio集合
        const tagLineRadios=tagLines.map((line,i)=>{
            const {
                id,
                name,
            }=line;

            return <Radio style={{display:'block'}}
                          key={id+name}
                          value={id}>{name}
            </Radio>
        });


        const cardBodyStyle={
            height:'500px',
            overflowY:'auto'
        };


        //已经选中的店铺列表
        const selectedShopsLists=(selectedShopRows||[]).map((shop,i)=>{
            const {
                name,
                id,
                status
            }=shop;
            return <div key={name+id} className={styles.selectedShopsItem} >
                <p>{name} - <span style={{color:shopStatusColorConfig[status.name]||'#666'}}>{status.name}</span></p>
                <span className={styles.deleteBtn}>
                    <Icon type={'close-circle-o'}
                          onClick={(_shop)=>{this.deleteShopSelected(shop)}}
                    />
                </span>
            </div>
        });

        return (
            <div className={styles.step0}>
                <FormItem labelCol={{span: 6}}
                          wrapperCol={{span: 24}}>
                    {getFieldDecorator('selectShopType', {
                        initialValue:selectShopType,
                        rules: [
                        ],
                    })(
                        <RadioGroup style={{textAlign:'center'}}
                                    onChange={(_e)=>{this.onSelectShopTypeChange(_e)}}
                        >
                            <Radio  value={1}>多店</Radio>
                            <Radio  value={2}>单店</Radio>
                        </RadioGroup>
                    )}
                </FormItem>


                <Row gutter={16}>

                    {
                        getFieldValue('selectShopType')==1 && <Col span={8}>
                            <Card title={<p className={styles.cardHead} >选择仓库</p>}
                                  className={styles.cardWithHeight}
                            >
                                <FormItem labelCol={{span: 6}}
                                          wrapperCol={{span: 12}}>
                                    {getFieldDecorator('tagWareHouseId', {
                                        initialValue:wareHouseId,
                                        rules: [
                                            // {required: true, message: `请选择物流`},
                                        ],
                                    })(
                                        <RadioGroup onChange={(_e)=>{this.onWareHouseChange(_e)}}>
                                            {WareHouseRadios}
                                        </RadioGroup>
                                    )}
                                </FormItem>
                            </Card>
                        </Col>
                    }

                    {
                        getFieldValue('selectShopType')==1 && <Col span={8}>
                            <Card title={<p className={styles.cardHead}>选择路线</p>}
                                  className={styles.cardWithHeight}
                            >
                                <FormItem labelCol={{span: 6}}
                                          wrapperCol={{span: 12}}>
                                    {getFieldDecorator('tagLineId', {
                                        initialValue:tagLineId,
                                        rules: [
                                            // {required: true, message: `请选择物流`},
                                        ],
                                    })(
                                        <RadioGroup onChange={(_e)=>{this.onTagLineChange(_e)}}>
                                            {tagLineRadios}
                                        </RadioGroup>
                                    )}
                                </FormItem>
                            </Card>
                        </Col>
                    }


                    <Col span={8}>
                        <Card title={<p className={styles.cardHead}>选择店铺</p>}
                              className={styles.cardWithHeight}
                        >
                            <Button icon="plus"
                                    style={{display:'block',width:'100%'}}
                                    onClick={(_s)=>{this.toggleShopModalDialog(true)}}>添加店铺
                            </Button>
                            <div>
                                {selectedShopsLists}
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/*底部的操作按钮*/}
                <div style={{textAlign:'center',padding:'20px'}}>
                    <Button style={{ margin:'10px' }}
                            onClick={() => this.cancelStep0()} > 取消</Button>
                    <Button style={{ margin:'10px' }}
                            type="primary"
                            onClick={() => this.nextStep()} >下一步</Button>
                </div>
                {/*店铺选择弹框*/}
                {
                    shopModalVisible && <Step0ShopListsDialog shopModalVisible={shopModalVisible}
                                                              toggleShopModalDialog={(_s)=>{this.toggleShopModalDialog(false)}}
                                                              tagLineId={tagLineId}
                                                              wareHouseId={wareHouseId}
                                                              dispatch={dispatch}
                                                              shopStatusColorConfig={shopStatusColorConfig}
                                                              selectShopType={selectShopType}
                                                              {...shopDialogListsProps}
                    />
                }
            </div>
        );
    }
}

export default Form.create(({ loading}) => ({loading}))(Step0);

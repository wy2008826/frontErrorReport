import React, {Component} from 'react'

const {
  Form,
  Input,
  Modal,
  Cascader
} = window.ANTD

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
}

const {
  city
} = window.UTILS

const formConfig = [{
  label: '收货人',
  name: 'takeDeliveryPeople',
  rules: [{
    required: true,
    message: '请输入收货人',
  }],
  render() {
    return <Input placeholder="请输入收货人" />
  }
}, {
  label: '联系电话',
  name: 'takeDeliveryPhone',
  rules: [{
    required: true,
    message: '请输入联系电话',
  }, {
    message: '请输入正确的手机号',
    pattern: /^[1][3|5|7|8][0-9]{9}$/
  }],
  render() {
    return <Input placeholder="请输入联系电话" />
  }
}, {
  label: '省市区',
  name: 'city',
  rules: [{
    required: true,
    message: '请选择省市区',
  }],
  render() {
    return <Cascader placeholder="请选择省市区" 
    options={city}/>
  }
}, {
  label: '详细地址',
  name: 'address',
  rules: [{
    required: true,
    message: '请输入详细地址',
  }],
  render() {
    return <Input placeholder="请输入详细地址(如: 街道、门牌号)" />
  }
}]

const Cols = (getFieldDecorator, value) => formConfig.map(conf => {
  let initialValue
  switch (conf.name) {
    case 'takeDeliveryPeople':
    case 'takeDeliveryPhone':
      initialValue = value[conf.name]
      break
    case 'city':
      if (value.takeDeliveryAddress) {
        initialValue = value.takeDeliveryAddress.split('&nbsp')[0].split('&lg')
      }
      break
    case 'address':
      if (value.takeDeliveryAddress) {
        initialValue = value.takeDeliveryAddress.split('&nbsp')[1]
      }
      break
  }
  return (
    <FormItem {...formItemLayout} label={conf.label} key={conf.label}>
      {getFieldDecorator(conf.name, {
        initialValue,
        rules: conf.rules,
      })(
        conf.render(value)
      )}
    </FormItem>
  )
})

const FormRender = props => {
  return class extends Component {
    render() {
      const {getFieldDecorator, detail} = this.props
      return (
        <div>{Cols(getFieldDecorator, detail)}</div>
      )
    }
  }
}

const ModeifyForm = FormRender()

class ModeifyDeliveryInformation extends Component {
  submitDeliveryInformation = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return
      }

      this.props.submitDeliveryInformation(fieldsValue)
    })
  }
  render() {
    const {getFieldDecorator} = this.props.form
    
    const {defaultValue, detail={}} = this.props
    return (
      <Modal
        title="修改收货地址"
        visible={this.props.visiable}
        onOk={this.submitDeliveryInformation}
        onCancel={() => {this.props.cancelModeify(false)}}
      >
        <div>
          <ModeifyForm getFieldDecorator={getFieldDecorator} defaultValue={defaultValue} detail={detail}/>
        </div>
      </Modal>
    )
  }
}

export default Form.create()(ModeifyDeliveryInformation)
const {
    Row,
    Col,
    Select,
    Input,
    Form,
    Button,
} = window.ANTD;

const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;

const formRender = (formData, getFieldDecorator, _this) => {
    return (
        <Row>
            {
                formData.map((v, i) => {
                    let push = v.push;
                    let colStyle = {
                        padding: '0 12px', 
                        marginBottom: '15px'
                    };
                    if (push) {
                        colStyle['textAlign'] = 'right';
                    }
                    return (
                        <Col key={v.key} xs={20} sm={12} md={6} lg={6} xl={6} style={{...colStyle}}>
                                {
                                    v.type === 'select' ? (
                                        <FormItem>
                                            {getFieldDecorator(v.key, {
                                                initialValue: v.value,
                                            })( <Select placeholder={v.placeholder}
                                                        onChange={v.onChange(_this)}
                                                        style={{width:'100%'}}
                                                >
                                                    {
                                                        v.data.map(d => <Option value={d.value} key={d.key}>{d.text}</Option>)
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    ) : v.type === 'search' ? (
                                        <FormItem>
                                            {getFieldDecorator(v.key, {
                                                initialValue:'',
                                                rules: [
                                                    // {required: true, message: `分类名称不能为空`},
                                                ],
                                            })(
                                                <Search placeholder={v.placeholder}
                                                        size="large"
                                                        onSearch={v.onSearch(_this)}
                                                        style={{width:'100%'}}
                                                />
                                            )}
                                        </FormItem>
                                    ) : v.type === 'button' ? (
                                        <Button type='primary' style={{ margin: '0 10px' }} disabled={v.disabled}>
                                            <a download href={v.href}>
                                                {v.text}
                                            </a>
                                        </Button>
                                    ) : null
                                }
                        </Col>
                    )
                })
            }
        </Row>
    )
};

const formatFormSearchParams = (_this) => {
    const {
        form
    } = _this.props;
    let {
        activeKey
    } = _this.state;
    let _obj = form.getFieldsValue();
    if (activeKey == '3') {
        Object.keys(_obj).forEach(v => {
            if (v.indexOf('_$2$')>0) {
                let key = v.split('_$2$')[0];
                _obj[key] = _obj[v]
                delete _obj[v];
            }
        });
    };
    let delKey = Object.keys(_obj).filter(v => v.indexOf('canSelectRows') != -1)[0];
    delete _obj[delKey];
    return _obj;
};

/**
 * @param objArr = [
 *  dataSource: 数据（远程请求而来）
 *  type all代表select添加全部选项，self代表select不需要添加全部选项
 *  position 代表要修改的formData数组位置
 * ]
 * @param formData代表要渲染的数组
 */
const formatSelectData = (objArr, formData) => {
    objArr.forEach((v, i) => {
        let _arr = v.type === 'all' ? [
            {
                text: '全部',
                value: '',
                key: 'all'
            }
        ] : [];
        (v.dataSource || []).forEach(d => {
            const {
                id,
                name
            } = d;
            if (name) {
                let obj = {
                    value: id,
                    text: name,
                    key: name + id,
                }
                _arr.push(obj)
            }
        });
        formData[v.position].data = _arr;
    });
};

module.exports = {
    formRender,
    formatFormSearchParams,
    formatSelectData,
};
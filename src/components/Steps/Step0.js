const {
    Form,
    message,
    Button,
    Icon,
    Upload
} = window.ANTD

const {
    React,
    Component
} = window

const Dragger = Upload.Dragger;

import styles from './index.less';


class Step0 extends Component {

    state = {
        uploadDisabled: false,
        nextDisabled: true
    }

    downloadTemplate(downloadTemplateUrl) {
        window.location.href=downloadTemplateUrl;
    }

    toNextStep=()=>{//下一步
        const {
            dispatch,
            modelName,
        }=this.props;

        if (this.state.isEmpty) {
            message.warn('请导入一个文件')
            return
        }

        dispatch({
            type:`${modelName}/updateState`,
            payload:{
                current:1
            }
        })
    }

    render() {
        const self=this;
        const {
            uploadDisabled,
            nextDisabled
        } = this.state ;

        const {
            dispatch,
            downloadTemplateUrl,
            modelName,
            uploadUrl,
            text,
            backUrl,
        }=this.props;
        const upLoadProps = {
            name: 'uploadFile',
            action: uploadUrl, //上传地址
            headers: {
                // authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status == 'uploading') {
                    self.setState({
                        uploadDisabled:true,
                    })
                }
                if (info.file.status === 'done') {

                    const status=info.file.response.status;
                    if(status==200){
                        message.success(`${text}导入成功！`);
                        self.setState({
                            uploadDisabled:true,
                            nextDisabled: false
                        })
                        dispatch({
                            type:`${modelName}/updateState`,
                            payload:{
                                inputData: info.file.response.result
                            }
                        })
                    }else{
                        message.error(info.file.response.message||`${text}导入失败`);
                    }
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败！`);
                }
            },
            onRemove() {
              self.setState({
                uploadDisabled:false,
                nextDisabled: true,
              })
              dispatch({
                  type: `${uploadDisabled}/deleteState`
              })
            }
        }

        return (
            <div>
                <span>请按照数据模板的格式准备导入数据，模板中的表头名称不可更改，表头行不能删除。</span>
                <Button icon="download"
                        type="primary"
                        className={styles.downloadBtn}
                        onClick={() => { this.downloadTemplate(downloadTemplateUrl) }}>下载模板
                </Button>

                <div className={styles.inputArea}>
                    <Dragger {...upLoadProps} accept={'.xlsx,.xls'} disabled={uploadDisabled}>
                        {!uploadDisabled && <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                        </p>}
                        {!uploadDisabled && <p className="ant-upload-text">拖拽到或点击此区域上传</p>}
                        {!uploadDisabled && <p className="ant-upload-hint">请上传单个后缀名为xls或xlsx（即Excel格式）的文件</p>}
                    </Dragger>
                </div>

                <h5 style={{margin: '10px 0'}}>模板导入说明:</h5>
                <p>文件后缀名必须为：xls 或xlsx （即Excel格式），一次最多导1000条数据；</p>
                <p>已存在的{text}数据不允许再次导入，否则该行不导入；</p>
                <p>{text}名称、{text}分类、{text}单位不可为空，否则该行数据不导入；</p>
                <p>{text}编码不可为空、不可重复，否则该行数据不导入；</p>
                <p>店铺账号不可为空，否则该行数据不导入；</p>

                <div className={styles.bottomBtn}>
                    <div>
                        <Button
                                onClick={() => {
                                    window.location.href= backUrl;
                                }}
                                >取消
                        </Button>
                        <Button type="primary"
                                disabled={nextDisabled}
                                onClick={() => {
                                    this.toNextStep()
                                }}
                                >下一步
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Form.create(({ loading}) => ({loading}))(Step0);

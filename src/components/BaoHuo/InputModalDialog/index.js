const {
    Form,
    message,
    Button,
    Icon,
    Upload,
    Modal
} = window.ANTD

const {
    React,
    Component
} = window

const Dragger = Upload.Dragger;

import styles from './index.less';


class InputModalDialog extends Component {
    state = {
        uploadDisabled: false,
    }

    downloadTemplate(downloadTemplateUrl) {
        window.location.href=downloadTemplateUrl;
    }

    render() {
        const self=this;
        const {
            // dispatch,
            downloadTemplateUrl,
            // modelName,
            uploadUrl,
            text,
            modalVisible,
            handleModalVisible,
            dispatch,
            modelName,
            params={},
        }=this.props;
        
        const {
            uploadDisabled,
        } = this.state ;
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
                        // self.setState({
                        //     uploadDisabled:true,
                        // })
                        handleModalVisible(false)
                        dispatch({
                            type:`${modelName}/query`,
                            payload: {
                                ...params
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
                })
            //   dispatch({
            //       type: `${uploadDisabled}/deleteState`
            //   })
            }
        }

        return (
            <Modal
                title={text+'管理'}
                visible={modalVisible}
                footer={null}
                onCancel={() => handleModalVisible(false)}
                width="1000px"
                bodyStyle={{
                    overflowY: 'scroll'
                }}
            >
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
                </div>
            </Modal>
        )
    }
}

export default Form.create(({ loading}) => ({loading}))(InputModalDialog);
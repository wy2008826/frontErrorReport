
import React , {Component} from 'react';


const {
    Dropdown,
    Button,
    Icon,
    Menu,
    Modal,
} =window.ANTD;


//1 下载当页数据    2 下载当前搜索条件下的分块数据
export default  class  extends Component {
    state = {
        modalVisible: false,
    }
    handleMenuClick = (e) => {
        const {
            key
        } = e;
        if (key == 'aaa2') {
            this.toggleModalVisible();
        }
    }
    toggleModalVisible = () => {
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }
    createDownloadUrl = (page,pageSize)=>{//生成下载链接
        const {
            filter,//查询条件
            url,
        } = this.props;
        const filterArr = [];

        Object.keys(filter).map((key) => {
            const val = filter[key];
            if (val) {
                filterArr.push(`${key}=${val}`)
            }
        });
        let curPageString = filterArr.join('&');
        curPageString = curPageString + `${curPageString ? '&' : ''}page=${page}&pageSize=${pageSize || 10}`;

        return url+'?'+ curPageString;
    }
    render() {
        const {
            modalVisible
        } = this.state;

        const {
            text,
            filter,//查询条件
            pagination,//分页结果
            perSize=100,
            style={}
        } = this.props;

        // console.log('filter:',filter,'pagination:',pagination);

        const filterArr = [];
        Object.keys(filter).map((key) => {
            const val = filter[key];
            if (val) {
                filterArr.push(`${key}=${val}`)
            }
        });


        //下拉菜单项目
        const menu = (<Menu onClick={(e) => {this.handleMenuClick(e)}} >
            <Menu.Item key="aaa1">
                <a download href={this.createDownloadUrl(pagination.current,pagination.pageSize)}>导出本页数据</a>
            </Menu.Item>
            <Menu.Item key="aaa2">导出查询结果</Menu.Item>
        </Menu>);

        const btnNum = Math.ceil((pagination.total || 0 ) / perSize)
        const downBtns =[];
        for(let i=0;i<btnNum;i++){
            let start = i*perSize+1;
            let end = (i+1)*perSize>pagination.total?pagination.total:(i+1)*perSize;

            let href = this.createDownloadUrl(i+1,perSize);
            downBtns.push(<Button key={href}
                                  type={'default'}
                                  style={{margin:'10px'}}
            >
                <a download href={href}>
                    第{i+1}页（{`${start}-${end}条`}）<Icon type="arrow-down" />
                </a>
            </Button>)
        };


        return <span style={{display:'inlineBlock',...style}}>
            <Dropdown overlay={menu}>
                <Button style={{marginLeft: 8}}>
                    {text || '批量导出'} <Icon type="down"/>
                </Button>
            </Dropdown>

            <Modal title={'导出查询结果'}
                   visible={modalVisible}
                   onCancel={this.toggleModalVisible}
                   footer={null}
                   width="800px"
                   bodyStyle={{
                       height: '300px',
                       overflowY: 'scroll'
                   }}
            >
                <div >
                    <p>共 <span style={{color: 'red'}}>{pagination.total}</span> 条，请选择数据范围点击下载</p>
                    <div >
                        {downBtns}
                    </div>
                </div>
            </Modal>
        </span>
    }
}

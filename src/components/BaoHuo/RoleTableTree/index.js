//react相关
const {
    React,
    Component
} = window;

//antd组件
const {
    Table,
    Checkbox,
} = window.ANTD;

import styles from './index.less';

class RoleTableTree extends Component {
    state = {}

    componentDidMount() {//加载页面初始化数据

    }

    componentWillReceiveProps(props) {

    }
    componentWillUnmount(){
        this.props.dispatch({
            type:`${this.props.modalName}/updateState`,
            payload:{
                systemTree:{}
            }
        })
    }
    getColumns = () => {//生成colume数据\
        const self = this;
        const columns = [//第一列渲染菜单  第二列渲染操作
            {
                title: '菜单权限',
                // dataIndex: 'menuName',
                key: 'menuName',

                className: styles.firstCol,
                render: (row) => {
                    const {
                        isMenu,
                        menuName,
                        isSelect = false
                    } = row
                    return isMenu ? <Checkbox checked={isSelect}
                                              disabled={self.props.disabled}
                                              onChange={(e) => {
                                                  self.onMenuChange(e, row)
                                              }}
                    >
                        {menuName}
                    </Checkbox> : null
                }
            },
            {
                title: '操作权限',
                key: 'menuCode',
                className: styles.alignLeft,
                render: (row) => {
                    const {
                        children,
                    } = row

                    return (children && children.length && !children[0].isMenu) ? <div>
                        {
                            children.map((item, i) => {
                                const {
                                    menuName,
                                    isSelect = false
                                } = item

                                return <Checkbox checked={isSelect}
                                                 disabled={self.props.disabled}
                                                 onChange={(e) => {
                                                     self.onMenuChange(e,item, row)
                                                 }}
                                >
                                    {menuName}
                                </Checkbox>
                            })
                        }
                    </div> : null
                }
            },
        ]
        return columns;
    }
    onMenuChange = (e, item) => {//左侧按钮选中状态切换
        item.isSelect = e.target.checked;


        //同步所有子节点的选中状态
        // (item.children ||[]).map(_ => {_.isSelect = item.isSelect});
        const changeStatus = (items, status) => {
            if (items instanceof Array) {
                items.map(_ => {
                    const {
                        children
                    } = _;
                    _.isSelect = status;
                    children && children.length && changeStatus(children, status);
                })
            } else {
                items.isSelect = status;
                items.children && changeStatus(items.children, status);
            }
        }
        changeStatus(item, item.isSelect);


        //同步父节点的选中状态
        const changeParentStatus = (parent)=>{
            parent && ( parent.isSelect = (parent.children||[]).some(_=>_.isSelect) );
            parent.Parent && changeParentStatus(parent.Parent)
        };
        if(item.Parent ){
            changeParentStatus(item.Parent);
        }

        this.props.dispatch({
            type: `${this.props.modalName}/updateState`,
            payload: {
                // systemTree: id? this.props.systemTree:[]
            }
        });
    }
    render() {
        const {
            systemTree = {},
            expandedRowKeys = []
        } = this.props;

        return (
            <div className={styles.treeTable}>
                <Table dataSource={systemTree.children || []}
                       indentSize={30}
                       bordered
                       pagination={false}
                       columns={this.getColumns()}
                       simple
                       rowKey={record => record.menuName + record.menuCode}
                    // defaultExpandAllRows={true}
                       expandedRowKeys={expandedRowKeys}
                />
            </div>
        );
    }
}

export default RoleTableTree;

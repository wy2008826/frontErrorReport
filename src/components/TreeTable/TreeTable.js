import React from 'react'

import { Icon, Popover, Modal, Input, Button } from 'antd'
import styles from './TreeTable.less'
import { Z_BLOCK } from 'zlib'

export default class TreeTable extends React.Component {
    state = {
        // visible:true
        currentItem: ''
    }

    componentDidMount() {
        const { currentItem } = this.props
        this.setState({
            currentItem
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentItem && nextProps.currentItem.id != this.props.currentItem.id) {
            this.setState({
                currentItem: nextProps.currentItem
            })
        }
    }

    onMenuClicked(item) {
        item.hiddenChildren = !!!item.hiddenChildren
        this.setState({
            data: this.state.data
        })
    }

    openQuestionList(item) {
        //   console.log(item);
        this.setState({
            currentItem: item
        })
        this.props.click(item) // 将树组件当前点击的对象信息传递到父组件
    }

    generateMenu = (menuObj, parent) => {
        if (!menuObj) {
            return
        }
        let vdom = []

        if (menuObj instanceof Array) {
            let list = []
            for (var item of menuObj) {
                list.push(this.generateMenu(item, parent))
            }
            vdom.push(
                <ul key='single' className='xxxs'>
                    {list}
                </ul>
            )
        } else {
            vdom.push(
                <li key={menuObj.menuId} className={menuObj.hiddenChildren ? styles.hideChildren : ''}>
                    {menuObj.hiddenChildren && menuObj.children && <Icon type='caret-right' />}
                    {!menuObj.hiddenChildren && menuObj.children && <Icon type='caret-down' />}
                    {menuObj.type == 3 ? (
                        <p
                            onClick={() => {
                                this.openQuestionList(menuObj)
                            }}
                            className={menuObj.id == this.state.currentItem.id ? styles.activeItem : ''}>
                            {menuObj.name}
                        </p>
                    ) : (
                        <p
                            onClick={() => {
                                this.onMenuClicked(menuObj)
                            }}>
                            {menuObj.name}
                        </p>
                    )}
                    {/* <Icon type="bars" onClick={() => this.showMenu(menuObj)} /> */}
                    {menuObj.type > 0 && (
                        <Popover
                            content={
                                <div>
                                    {this.props.edit && (
                                        <p
                                            onClick={() => {
                                                this.props.edit(menuObj)
                                            }}>
                                            编辑
                                        </p>
                                    )}
                                    {this.props.delete && menuObj.type > 1 && (
                                        <p
                                            onClick={() => {
                                                this.props.delete(menuObj, parent)
                                            }}>
                                            删除
                                        </p>
                                    )}
                                    {this.props.add && menuObj.type < 3 && (
                                        <p
                                            onClick={() => {
                                                this.props.add(menuObj)
                                            }}>
                                            添加下级分类
                                        </p>
                                    )}
                                    {this.props.set && menuObj.type > 1 && menuObj.type < 3 && (
                                        <p
                                            onClick={() => {
                                                this.props.set(menuObj)
                                            }}>
                                            自检考试设置
                                        </p>
                                    )}
                                </div>
                            }
                            // title="Title"
                            trigger='hover'
                            placement='rightBottom'
                            // visible={this.state.visible}
                            // onVisibleChange={this.handleVisibleChange}
                            style={{ cursor: 'default' }}>
                            <Icon type='bars' />
                        </Popover>
                    )}
                    {this.generateMenu(menuObj.children, menuObj)}
                </li>
            )
        }
        return vdom
    }

    render() {
        return (
            <div className={styles.container}>
                {this.generateMenu(this.props.dataSource)}
                {/* <Button onClick={() => {this.props.topAdd()}}>
                    <Icon type="plus" />
                    新增顶级分类
                </Button> */}
            </div>
        )
    }
}

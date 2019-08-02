import React from 'react'
import PropTypes from 'prop-types'
import {Menu, Icon, Popover} from 'antd'
import classnames from 'classnames'
import styles from './Header.less'
import Menus from './Menu'
import {Link} from 'react-router-dom';


const SubMenu = Menu.SubMenu

const Header = ({user, logout, switchSider, siderFold, isNavbar, menuPopoverVisible, location, switchMenuPopover, navOpenKeys, changeOpenKeys, menu}) => {
    let handleClickMenu = e => e.key === 'logout' && logout();//点击菜单按钮的功能
    const menusProps = {
        menu,
        siderFold: false,
        darkTheme: false,
        isNavbar,
        handleClickNavMenu: switchMenuPopover,
        location,
        navOpenKeys,
        changeOpenKeys,
    }
    return (
        <div className={styles.header}>
            {isNavbar
                ? <Popover placement="bottomLeft" onVisibleChange={switchMenuPopover} visible={menuPopoverVisible}
                           overlayClassName={styles.popovermenu} trigger="click" content={<Menus {...menusProps} />}>
                    <div className={styles.button}>
                        <Icon type="bars"/>
                    </div>
                </Popover>
                : <div
                    className={styles.button}
                    onClick={switchSider}
                >
                    <Icon type={classnames({'menu-unfold': siderFold, 'menu-fold': !siderFold})}/>
                </div>}
                <div className={styles.rightWarpper}>
                    {/*<div className={styles.button}>*/}
                        {/*<Icon type="mail"/>*/}
                    {/*</div>*/}
                    <div>
                        <Icon type="reload"
                              className={styles.reload}
                              onClick={()=>{window.location.reload()}}
                        />
                    </div>
                    <Menu mode="horizontal" onClick={handleClickMenu}>
                        <SubMenu style={{ float: 'right', }}
                                 title={<span><Icon type="user"/>{user.account}</span>}
                        >
                            <Menu.Item key="logout">退出</Menu.Item>
                            <Menu.Item key="resetPass">
                                <Link to={'/authority/resetUserPass'}>修改密码</Link>
                            </Menu.Item>
                        </SubMenu>
                    </Menu>
                </div>
        </div>
    )
}

Header.propTypes = {
    menu: PropTypes.array,
    user: PropTypes.object,
    logout: PropTypes.func,
    switchSider: PropTypes.func,
    siderFold: PropTypes.bool,
    isNavbar: PropTypes.bool,
    menuPopoverVisible: PropTypes.bool,
    location: PropTypes.object,
    switchMenuPopover: PropTypes.func,
    navOpenKeys: PropTypes.array,
    changeOpenKeys: PropTypes.func,
}

export default Header

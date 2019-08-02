import React from 'react'
import PropTypes from 'prop-types'
import {Icon, Switch} from 'antd'
import {Link} from 'dva/router'
import {config} from 'utils'
import styles from './Layout.less'
import Menus from './Menu'

const Sider = ({siderFold, darkTheme, location, changeTheme, navOpenKeys, changeOpenKeys, menu}) => {
    const menusProps = {
        menu,
        siderFold,
        darkTheme,
        location,
        navOpenKeys,
        changeOpenKeys,
    }
    return (
        <div>
            <Link className={styles.logo} to={'/'}>
                <img alt={'logo'} src={config.logo}/>
                {siderFold ? '' : <span>{config.name}</span>}
            </Link>
            <Menus {...menusProps} />
            {!siderFold ? <div className={styles.switchtheme}>
                <span><Icon type="bulb"/>切换主题风格</span>
                <Switch onChange={changeTheme}
                        defaultChecked={darkTheme}
                        checkedChildren="深色"
                        unCheckedChildren="浅色"/>
            </div> : ''}
        </div>
    )
}

Sider.propTypes = {
    menu: PropTypes.array,
    siderFold: PropTypes.bool,
    darkTheme: PropTypes.bool,
    location: PropTypes.object,
    changeTheme: PropTypes.func,
    navOpenKeys: PropTypes.array,
    changeOpenKeys: PropTypes.func,
}

export default Sider

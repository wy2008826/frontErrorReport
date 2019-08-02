import React from 'react'
import PropTypes from 'prop-types'
import {Menu, Icon} from 'antd'
import {Link} from 'react-router-dom'
import {arrayToTree, queryArray} from 'utils'
import pathToRegexp from 'path-to-regexp'

const Menus = ({siderFold, darkTheme, navOpenKeys, changeOpenKeys, menu, location}) => {
    // 生成树状
    const menuTree = arrayToTree(menu.filter(_ => _.menuPcode !== '-1'), 'menuCode', 'menuPcode')
    // const menuTree = menu
    const levelMap = {}
    // console.log('menuTree:',menuTree);
    // 递归生成菜单
    const getMenus = (menuTreeN, siderFoldN) => {
        return menuTreeN.map((item) => {
            if (item.children) {
                if (item.menuPcode) {
                    levelMap[item.menuCode] = item.menuPcode
                }
                return (
                    <Menu.SubMenu
                        key={item.menuCode}
                        title={<span>
                            {item.icon && <Icon type={item.icon}/>}
                            {(!siderFoldN || !menuTree.includes(item)) && item.name}
                            </span>}
                    >
                        {getMenus(item.children, siderFoldN)}
                    </Menu.SubMenu>
                )
            }
            return (
                <Menu.Item key={item.menuCode}>
                    <Link to={item.route || '#'}>
                        {item.icon && <Icon type={item.icon}/>}
                        {(!siderFoldN || !menuTree.includes(item)) && item.name}
                    </Link>
                </Menu.Item>
            )
        })
    }
    const menuItems = getMenus(menuTree, siderFold)

    // 保持选中
    const getAncestorKeys = (key) => {
        let map = {}
        const getParent = (index) => {
            const result = [String(levelMap[index])]
            if (levelMap[result[0]]) {
                result.unshift(getParent(result[0])[0])
            }
            return result
        }
        for (let index in levelMap) {
            if ({}.hasOwnProperty.call(levelMap, index)) {
                map[index] = getParent(index)
            }
        }
        return map[key] || []
    }

    const onOpenChange = (openKeys) => {
        // console.log('openKeys:',openKeys);

        const latestOpenKey = openKeys.find(key => !navOpenKeys.includes(key))
        const latestCloseKey = navOpenKeys.find(key => !openKeys.includes(key))
        let nextOpenKeys = []
        if (latestOpenKey) {
            nextOpenKeys = getAncestorKeys(latestOpenKey).concat(latestOpenKey)
        }
        if (latestCloseKey) {
            nextOpenKeys = getAncestorKeys(latestCloseKey)
        }
        changeOpenKeys(nextOpenKeys)
    }

    let menuProps = !siderFold ? {
        onOpenChange,
        openKeys: navOpenKeys,
    } : {}


    // 寻找选中路由
    let currentMenu
    let defaultSelectedKeys
    for (let item of menu) {
        if (item.route && pathToRegexp(item.route).exec(location.pathname)) {
            currentMenu = item
            break
        }
    }
    const getPathArray = (array, current, menuPcode, menuCode) => {
        let result = [String(current[menuCode])]
        const getPath = (item) => {
            if (item && item[menuPcode]) {
                result.unshift(String(item[menuPcode]))
                getPath(queryArray(array, item[menuPcode], menuCode))
            }
        }
        getPath(current)
        return result
    }
    if (currentMenu) {
        defaultSelectedKeys = getPathArray(menu, currentMenu, 'menuPcode', 'menuCode')
    }

    if (!defaultSelectedKeys) {//设置默认选中的路由
        defaultSelectedKeys = ['51']
    }

    return (
        <Menu
            {...menuProps}
            mode={siderFold ? 'vertical' : 'inline'}
            // mode={'horizontal'}
            theme={darkTheme ? 'dark' : 'light'}
            selectedKeys={defaultSelectedKeys}
        >
            {menuItems}
        </Menu>
    )
}

Menus.propTypes = {
    menu: PropTypes.array,
    siderFold: PropTypes.bool,
    darkTheme: PropTypes.bool,
    navOpenKeys: PropTypes.array,
    changeOpenKeys: PropTypes.func,
    location: PropTypes.object,
}

export default Menus

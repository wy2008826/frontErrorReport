/* global window */
import React from 'react'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'
import pathToRegexp from 'path-to-regexp'
import {connect} from 'dva'
import {Layout, Loader} from 'components'
import {classnames, config} from 'utils'
import {Helmet} from 'react-helmet'
import {withRouter} from 'dva/router'
import '../themes/index.less'
import './app.less'
import Error from './error'


//Switch这样引用是为了避免在router中的router switch重名问题
import {
    Switch,
} from 'antd';

window.ANTD={
    ...(window.ANTD||{}),
    Switch,
};



const {prefix, openPages} = config

const {Header, Bread, Footer, Sider, styles} = Layout
let lastHref

const App = ({children, dispatch, app, loading, location,routeConfig}) => {
    const {user, siderFold, darkTheme, isNavbar, menuPopoverVisible, navOpenKeys, menu, permissions} = app
    let {pathname} = location
    pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
    const {iconFontJS, iconFontCSS, logo} = config
    const current = menu.filter(item => {
        return pathToRegexp(item.route || '').exec(pathname)
    })

    //const hasPermission =true || (current.length ? permissions.visit.includes(current[0].id) : false)

    const hasPermission = true;
    const href = window.location.href

    if (lastHref !== href) {
        NProgress.start()
        if (!loading.global) {
            NProgress.done()
            lastHref = href
        }
    }

    const headerProps = {
        menu,
        user,
        location,
        siderFold,
        isNavbar,
        menuPopoverVisible,
        navOpenKeys,
        switchMenuPopover() {
            dispatch({type: 'app/switchMenuPopver'})
        },
        logout() {
            dispatch({type: 'app/logout'})
        },
        switchSider() {
            dispatch({type: 'app/switchSider'})
        },
        changeOpenKeys(openKeys) {
            dispatch({type: 'app/handleNavOpenKeys', payload: {navOpenKeys: openKeys}})
        },
    }

    const siderProps = {
        menu,
        location,
        siderFold,
        darkTheme,
        navOpenKeys,
        changeTheme() {
            dispatch({type: 'app/switchTheme'})
        },
        changeOpenKeys(openKeys) {
            window.localStorage.setItem(`${prefix}navOpenKeys`, JSON.stringify(openKeys))
            dispatch({type: 'app/handleNavOpenKeys', payload: {navOpenKeys: openKeys}})
        },
    }

    let copyMenu = JSON.parse(JSON.stringify(menu));

    //在routerconfig中设置了父菜单的route 在menu中进行配置，用于生成面包屑 （routerconfig中遵循父页面先于子页面配置的原则）
    routeConfig.map((routeItem,i)=>{
        let leftParentMenu = copyMenu.filter(_=>_.route==routeItem.parentMenuPath)
        if(routeItem.parentMenuPath && leftParentMenu.length==1){
            routeItem.menuCode = 'front-'+routeItem.parentMenuPath;
            routeItem.menuPcode = leftParentMenu[0].menuCode
            routeItem.route = routeItem.path;
            copyMenu.push(routeItem);
        }
    })

    const breadProps = {
        menu:copyMenu,//只包含左侧导航栏的配置 后端返回
        location,
        routeConfig,//完整的路由配置 前端路由表
    }

    if (openPages && openPages.includes(pathname)) {
        return (<div>
            <Loader fullScreen spinning={loading.effects['app/query']}/>
            {children}
        </div>)
    }
    return (
        <div>
            <Loader fullScreen spinning={loading.effects['app/query']}/>
            <Helmet>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <link rel="icon" href={logo} type="image/x-icon"/>
                {iconFontJS && <script src={iconFontJS}/>}
                {iconFontCSS && <link rel="stylesheet" href={iconFontCSS}/>}
            </Helmet>
            <div
                className={classnames(styles.layout, {[styles.fold]: isNavbar ? false : siderFold}, {[styles.withnavbar]: isNavbar})}>
                {!isNavbar ? <aside className={classnames(styles.sider, {[styles.light]: !darkTheme})}>
                    {siderProps.menu.length === 0 ? null : <Sider {...siderProps} />}
                </aside> : ''}
                {/*id pageMain 用于方便页面中可以取到该元素进行滚动事件操作*/}
                <div className={styles.main} id={'pageMain'}>
                    <Header {...headerProps} />
                    <Bread {...breadProps} />
                    <div className={styles.container}>
                        <div className={styles.content}>
                            {hasPermission ? children : <Error/>}
                        </div>
                    </div>
                    <Footer/>
                </div>
            </div>
        </div>
    )
}

App.propTypes = {
    children: PropTypes.element.isRequired,
    location: PropTypes.object,
    dispatch: PropTypes.func,
    app: PropTypes.object,
    loading: PropTypes.object,
}

export default withRouter(connect(({app, loading}) => ({app, loading}))(App))

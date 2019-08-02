import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, Redirect, routerRedux, HashRouter } from 'dva/router'
import dynamic from 'dva/dynamic'
import App from 'routes/app'
import { connect } from 'dva'
import getUrlQuerys from 'utils/getUrlQuerys';

import city from 'utils/city.js'
import qs from 'qs'

window.city = city
window.UTILS = {
    qs,
    city
}

import {
    Modal,
    Menu,
    Popconfirm,
    Table,
    Card,
    Calendar,
    Row,
    Col,
    Button,
    Tag,
    Icon,
    Dropdown,
    Steps,
    Form,
    Input,
    InputNumber,
    Select,
    // Switch,
    DatePicker,
    TimePicker,
    Checkbox,
    Radio,
    TreeSelect,
    Cascader,
    Upload,
    message,
    Tabs,
    Popover
} from 'antd'

window.React = React
window.Component = Component
window.PureComponent = PureComponent

window.PropTypes = PropTypes

window.connect = connect

window.ANTD = {
    ...(window.ANTD || {}),
    Modal,
    Menu,
    Popconfirm,

    Table,
    Card,
    Calendar,

    Row,
    Col,

    Button,
    Tag,
    Icon,
    Dropdown,
    Steps,
    Form,
    Input,
    InputNumber,
    Select,
    // Switch,
    DatePicker,
    TimePicker,
    Checkbox,
    Radio,

    TreeSelect,

    Cascader,
    Upload,

    message,
    Tabs,
    Popover
}

const { ConnectedRouter } = routerRedux

const Routers = function({ history, app }) {
    const error = dynamic({
        app,
        component: () => import('./routes/error')
    })

    const routes = [
        {
            path: '/onlineError',
            models: () => [
                import('./models/OnlineError'),
            ],
            component: () => import('./routes/onlineError/')
        },
        {
            path: '/login',
            models: () => [import('./models/login')],
            component: () => import('./routes/login/')
        },
        {
            path: '/orders', //报货单
            models: () => [import('./models/orders/Orders'), import('./models/orders/OrdersBatchChangeGoodPrice')],
            component: () => import('./routes/orders/Order/')
        },
    ]

    /** <=
     * 当用户自定义页面之间的从属关系的时候 遵循父页面先于子页面配置的规则  该配置用于生成面包屑
     *
     * **/
    console.log(`一共有${routes.length}个页面！`)
    return (
        <ConnectedRouter history={history}>
            <HashRouter>
                <App routeConfig={routes}>
                    <Switch>
                        <Route exact path='/' render={() => <Redirect to='/home' />} />
                        {routes.map(({ path, ...dynamics }, key) => (
                            <Route
                                key={key}
                                exact
                                path={path}
                                component={dynamic({
                                    app,
                                    ...dynamics
                                })}
                            />
                        ))}
                        <Route component={error} />
                    </Switch>
                </App>
            </HashRouter>
        </ConnectedRouter>
    )
}

export default Routers

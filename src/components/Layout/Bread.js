import React from 'react'
import PropTypes from 'prop-types'
import {Breadcrumb, Icon} from 'antd'
import {Link} from 'react-router-dom'
import pathToRegexp from 'path-to-regexp'
import {queryArray} from 'utils'
import styles from './Bread.less'

const Bread = ({menu, location,routeConfig}) => {
    // 匹配当前路由
    let pathArray = []
    let current
    for (let index in menu) {
        if (menu[index].route == location.pathname) {
            current = menu[index]
        }
    }
    const getPathArray = (item) => {
        pathArray.unshift(item)
        if (item.menuPcode && item.menuPcode !='001') {
            getPathArray(queryArray(menu, item.menuPcode, 'menuCode'))
        }
    }
    // console.log('bread:',menu,location,current,pathArray);

    let paramMap = {}
    if (!current) {//该页面不在左侧配置菜单项中 需要单独维护
        let current = routeConfig.filter(_=>_.route==location.pathname)
        if(current.length){
            getPathArray(current)

            let keys = []
            let values = pathToRegexp(current.route, keys).exec(location.pathname.replace('#', ''))
            if (keys.length) {
                keys.forEach((currentValue, index) => {
                    if (typeof currentValue.name !== 'string') {
                        return
                    }
                    paramMap[currentValue.name] = values[index + 1]
                })
            }
        }

    } else {
        getPathArray(current)

        let keys = []
        let values = pathToRegexp(current.route, keys).exec(location.pathname.replace('#', ''))
        if (keys.length) {
            keys.forEach((currentValue, index) => {
                if (typeof currentValue.name !== 'string') {
                    return
                }
                paramMap[currentValue.name] = values[index + 1]
            })
        }
    }

    // console.log('pathArray:',pathArray);
    // 递归查找父级
    const breads = pathArray.map((item, key) => {
        const content = (
            <span>
                {item.icon ? <Icon type={item.icon} style={{marginRight: 4}}/> : ''}
                {item.nameRender?item.nameRender(location):item.name}
            </span>
        )
        return (
            <Breadcrumb.Item key={key}>
                {content}
                {/*{((pathArray.length - 1) !== key)*/}
                    {/*? <Link to={pathToRegexp.compile(item.route || '')(paramMap) || '#'}>*/}
                        {/*{content}*/}
                    {/*</Link>*/}
                    {/*: content}*/}
            </Breadcrumb.Item>
        )
    })

    return (
        current ?<div className={styles.bread}>
            <Breadcrumb>
                {breads}
            </Breadcrumb>
        </div>:null
    )
}

Bread.propTypes = {
    menu: PropTypes.array,
    location: PropTypes.object,
}

export default Bread


import React from 'react'

import {Icon} from 'antd'

export default (props)=>{
    const {
        type = "eye-o",
        title='',
        style={},
        onClick=()=>{},
        color = '#108ee9'
    } = props;

    return <Icon type={type}
                 title={title}
                 style={{cursor:'pointer',margin:'0px 4px',color,...style}}
                 onClick={e => onClick()}
    >{props.text ||''}</Icon>
}


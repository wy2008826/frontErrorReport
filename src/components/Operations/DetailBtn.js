
import React, { Component } from 'react'

import {Icon} from 'antd'

export default (props)=>{

    const Style={cursor:'pointer',margin:'0px 4px'};

    return <Icon type="eye-o"
                 title={'详情'}
                 style={{color:'#108ee9',...Style}}
                 onClick={e => props.onClick()}
    >{props.text ||''}</Icon>
}


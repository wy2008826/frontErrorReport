
import React, { Component } from 'react'

import {Icon} from 'antd'

export default (props)=>{

    const Style={cursor:'pointer',margin:'0px 4px'};

    return <Icon type="rollback"
                 title={props.title||'撤销'}
                 style={{color:'red',...Style}}
                 onClick={e => props.onClick()}
    />
}


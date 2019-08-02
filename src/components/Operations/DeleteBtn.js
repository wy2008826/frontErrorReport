
import React, { Component } from 'react'

import {Icon} from 'antd'

export default (props)=>{

    const Style={cursor:'pointer',margin:'0px 4px'};

    return <Icon type="close-circle-o"
                 title={'删除'}
                 style={{color:'red',...Style}}
                 onClick={e => props.onClick()}
    />
}



import React, { Component } from 'react'

import {Icon} from 'antd'

export default (props)=>{
    const Style={cursor:'pointer',margin:'0px 4px'};

    return <Icon type="edit"
                 title={'编辑'}
                 style={{color:'green',...Style}}
                 onClick={e => props.onClick()}
    />
}


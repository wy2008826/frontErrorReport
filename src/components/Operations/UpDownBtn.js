
import React, { Component } from 'react'

import {Icon} from 'antd'

export default (props)=>{
    const {
        forward
    }=props;

    const Style={cursor:'pointer',margin:'0px 4px'};

    return <Icon type={forward=='up'?"arrow-up":'arrow-down'}
                 title={forward=='up'?"上架":'下架'}
                 style={{color:'#f93',...Style}}
                 onClick={e => props.onClick()}
    />
}

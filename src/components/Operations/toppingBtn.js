
import React from 'react'

import {Icon} from 'antd'

export default (props)=>{

    const Style={cursor:'pointer',margin:'0px 4px'};

    return <Icon type={props.isTopping? 'arrow-down':'to-top'}
                 title={props.isTopping? '取消置顶':'置顶广告'}
                 style={{color:'',...Style}}
                 onClick={e => props.onClick()}
    />
}
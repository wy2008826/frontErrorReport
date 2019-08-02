
import React, { Component } from 'react'

import {Form,Input,Icon} from 'antd'
import styles from './index.less';

class FiterSearch extends Component {
    render(){
        const {
            placeholder,
            name,
            initialValue,
            onSearch=()=>{},
            afterText='查询',
            form,
            rules=[],
        }=this.props;

        const {
            getFieldDecorator
        }=form;

        const AddonAfter =<span className={styles.addonAfter}
            onClick={onSearch}
        >
            {afterText}
        </span>


        return getFieldDecorator(name, {
            initialValue,
            rules
        })(<Input placeholder={placeholder}
                  onPressEnter={onSearch}
                  addonAfter={AddonAfter}
        />)


        // return  <Input placeholder={placeholder}
        //                onPressEnter={onPressEnter}
        //                addonAfter={AddonAfter}
        // />
    }
};


export default Form.create()(FiterSearch);

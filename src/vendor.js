// moment还有大量locales文件，待优化
import moment from 'moment'
window.moment = moment
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

//省市区联动插件的原始数据
import city from 'utils/city.js'
window.city = city

// import React, { Component, PureComponent } from 'react'
// window.React = React
// window.Component = Component
// window.PureComponent = PureComponent
// import 'dva';

import PropTypes from 'prop-types'
window.PropTypes = PropTypes

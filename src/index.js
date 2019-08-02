import {message} from 'antd'
import dva from 'dva'
import createLoading from 'dva-loading'
// import createHistory from 'history/createBrowserHistory'
import {createHashHistory} from 'history'

import 'babel-polyfill'

window.log = console.log

// 1. Initialize
const app = dva({
    ...createLoading({
        effects: true,
    }),
    history: createHashHistory(),
    onError(error) {
        message.error(error.message)
    },
})

// 2. Model
app.model(require('./models/app'))

// 3. Router
app.router(require('./router'))

// 4. Start
app.start('#root')


if (module.hot) {
    module.hot.accept()
}
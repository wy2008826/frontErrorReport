const APIV1 = '/api/v1'
const APIV2 = '/api/v2'

const apiPrefix = '/api'

module.exports = {
    name: '前端监控', //
    prefix: 'gm',
    footerText: 'Gu Ming ',
    logo: '/logo.jpg',
    avator: '/dashu.jpeg', //用户头像
    iconFontCSS: '/iconfont.css',
    iconFontJS: '/iconfont.js',
    CORS: [],
    openPages: ['/login', '/createPage'],
    apiPrefix,
    APIV1,
    APIV2,

    //登录
    BaoHuo_Login_URLS: {
        userLogin: `${apiPrefix}/login`, //用户登陆
        userLogout: `${apiPrefix}/login/logout`, //登录退出

        userGetToken: `${apiPrefix}/login/getToken`, //用户登陆地方的token获取

        changeCurPass: `${apiPrefix}/user/changPersonPass`, //更改用户密码
        changeUserPassWord: `${apiPrefix}/user/changePass` //修改用户密码
    },

    //项目菜单
    BaoHuo_Menu_URLS: {
        menus: `${apiPrefix}/menu/findUserMenuAuthTree` //查询当前用户的菜单列表
    },

    //报货独立组件中api
    BaoHuoComponentApi: {
        queryGoodsCanUse: `${apiPrefix}/products/find`, //查找可用的商品列表
        queryRelateGoods: `${apiPrefix}/products/productsList`, //查找相关的商品列表
        queryShops: `${apiPrefix}/shop/find`, //查找店铺列表
        queryNotice: `${apiPrefix}/notice/findByPage`, //查找通知列表

        getAllSystem: `${apiPrefix}/system/findBSystem`, //获取所有b端系统列表
        getSystemTree: `${apiPrefix}/menu/findSystemMenuTree`, //获取系统树,
        RoleDetail: `${apiPrefix}/role/detail` //角色详情
    },
    //报货中公用的api  下拉框居多
    BaoHuo_AppCommon_URLS: {
        getAllWahreHouse: `${apiPrefix}/wareHouse/getAllWarehouse`,
        getWareHouses: `${apiPrefix}/wareHouse/getWareHouseList`, //查询仓库列表 用于在各个层面的select选项中调用

        getSingleWareHouseTagLines: `${apiPrefix}/line/getLineList`, //查询单个仓库下面的送货路线
        getGoodsClassifySelect: `${apiPrefix}/productsClassify/getProductsClassifyList`, //查询商品分类列表 用于在各个层面的select选项中调用
    },
    // 错误统计
    BaoHuo_OnlineError_URLS: {
        queryLatestError: `${apiPrefix}/queryLatestError`, //查询最新的错误列表
    },
}

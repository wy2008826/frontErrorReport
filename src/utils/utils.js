import Editor from 'wangeditor';
import {BaoHuo_ActivityAddOrEdit_URLS} from 'utils/config'

const utils = {
  initEditor(reactEl, props) {
    const editor = new Editor(reactEl)
    const {
      uploadServer = BaoHuo_ActivityAddOrEdit_URLS.activityUpload,
      uploadImageMax = 5 * 1024 * 1024,
      uploadVideoMax = 100 * 1024 * 1024,
      contentChange
    } = props
    editor.customConfig={
      ...editor.customConfig,
      menus : [//不支持菜单换行  只能精简菜单项
          'head',  // 标题
          'bold',  // 粗体
          'fontSize',  // 字号
          'fontName',  // 字体
          'italic',  // 斜体
          'underline',  // 下划线
          'strikeThrough',  // 删除线
          'foreColor',  // 文字颜色
          'backColor',  // 背景颜色
          'link',  // 插入链接
          'list',  // 列表
          'justify',  // 对齐方式
          'quote',  // 引用
          // 'emoticon',  // 表情
          'image',  // 插入图片
          // 'table',  // 表格
          // 'code',  // 插入代码
          // 'undo',  // 撤销
          // 'redo'  // 重复
      ],
      uploadImgServer: uploadServer,
      uploadImgMaxSize: uploadImageMax,//图片上传文件大小
      uploadFileName:'multipartFile',

      uploadVideoServer: uploadServer,
      uploadVideoMaxSize: uploadVideoMax,//视频上传文件大小
      uploadVideoFileName:'multipartFile',


      uploadImgHooks:{
          ...editor.customConfig.uploadImgHooks,
          before: function (xhr, editor, files) {
              // 图片上传之前触发
              // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，files 是选择的图片文件

              // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
              // return {
              //     prevent: true,
              //     msg: '放弃上传'
              // }
          },
          success: function (xhr, editor, result) {
              // 图片上传并返回结果，图片插入成功之后触发
              // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
          },
          fail: function (xhr, editor, result) {
              // 图片上传并返回结果，但图片插入错误时触发
              // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
          },
          error: function (xhr, editor) {
              // 图片上传出错时触发
              // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
          },
          timeout: function (xhr, editor) {
              // 图片上传超时时触发
              // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
          },
          customInsert: function (insertImg, result, editor) {
              // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
              // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）

              // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
              // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果

              // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
              let url = result.result
              insertImg(url)
              // result 必须是一个 JSON 格式字符串！！！否则报错
          }
        },
        onchange: html => { // 使用 onchange 函数监听内容的变化，并实时更新到 state 中
          contentChange && contentChange(html)
        }
    };
    editor.create()
    return editor
  }
}

export default utils

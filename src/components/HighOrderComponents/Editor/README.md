# 富文本编辑器

```
  封装wangEditor的高阶组件应用
```

## 用法:
```
    import HighOrderEditor from 'xxx'
    const EditorComponent = HighOrderEditor()

    render() {
      return (
        ...
          <EditorComponent uploaderServer="xxx" .../>
        ...
      )
    }
```

props(传值) | Effect(作用)
--------   | -----------
uploadServer | 图片/录像上传的服务地址
uploadImageMax | 图片的最大尺寸
uploadVideoMax | 视频的最大尺寸
contentChange | 绑定富文本编辑器的内容


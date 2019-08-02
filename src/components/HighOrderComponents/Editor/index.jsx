import React, {Component} from 'react'
import utils from 'utils/utils'

const HighEditor = () => {
  return class Editor extends Component {
    static editor = null
    getEditorRef = (ref) => {
      if (ref && !Editor.editor) Editor.editor = utils.initEditor(ref, this.props/* 每个组件拥有不同的配置 */)
    }
    render() {
      return <div className="m-editor__contain" ref={this.getEditorRef}></div>
    }
  }
}

export default HighEditor
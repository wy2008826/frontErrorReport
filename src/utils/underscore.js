/**
 * @author {Mr.Martin}
 * @description {学underscore适配所有终端写法}
 */

(function () {
  var root = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global.global === global && global) ||
    this || {}

  var _ = function (param) {
    if (!(this instanceof _)) return new _(param); // 如果不是 _ 的实例, 就return一个实例
    this._wrapped = param; // 如果是 _ 的实例, 就将wrapped赋值为参数
  }

  _.slice = Array.prototype.slice

  _.isFunction = function (fn) {
    return typeof fn === 'function'
  }

  _.sub_curry = function (fn) {
    const args = _.slice.call(arguments, 1)
    return function () {
      /**
       * newParams: [实参列表]
       * fn: 上一次调用的函数
       */
      const newParams = args.concat(_.slice.call(arguments))
      return fn.apply(this, newParams) // 不断往外层冒出去
    }
  }

  _.partial = function(fn) { // 偏函数
    const args = _.slice.call(arguments, 1)
    return function() {
      const newArgs = args.concat(_.slice.call(arguments))
      
      return fn.apply(this, newArgs)
    }
  }

  _.compose = function () { // 函数组合
    let start = arguments.length - 1
    let arg = _.slice.call(arguments)
    return function () {
      let result = arg[start--].apply(this, arguments)
      while (start >= 0) {
        result = arg[start--].call(this, result)
      }

      return result
    }
  }

  _.curry = function (fn, len) { // 函数柯里化
    let length = len || fn.length
    return function () {
      if (arguments.length < length) {
        const combined = [fn].concat(_.slice.call(arguments))
        return _.curry(_.sub_curry.apply(this, combined), length - arguments.length)
      } else {
        return fn.apply(this, arguments)
      }
    }
  }

  _.chain = function (obj) {
    var instance = _(obj)
    instance._chain = true
    return instance
  }

  function chainResult(instance, obj) {
    return instance._chain ? instance : obj
  }

  _.mixin = function (obj) { // 提供新的方法给_.prototype 和 _, 方便实现面向对象和函数式调用两种方法
    const push = Array.prototype.push
    Object.keys(obj).forEach(o => {
      const fn = obj[o]
      if (_.isFunction(fn)) { // 实参是数组形式
        _.prototype[o] = function () {
          const oToObject = [this._wrapped]
          push.apply(oToObject, arguments)
          return chainResult(this, fn.apply(this, oToObject))
        }
      }
    })

    return _
  }

  _.mixin(_)

  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }
})()
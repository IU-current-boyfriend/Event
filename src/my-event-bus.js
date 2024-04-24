/**
 * 这是我自己的事件总线，我现在需要满足三个条件:
 * 1. 实现on方法
 * 2. 实现emit方法
 * 3. 实现链式调用（可以改变this指向，类似map方法这种），比如说，我这个
 * 回调函数callback可以是某个对象中的，当执行该回调函数的时候，我想让该函数
 * 内部的this指向该对象。
 * 
 * 数据结构：
 * on方法需要做的事情：
 *    缓存池：{
 *      [type]: [fn, fn, fn]
 *    }
 * 
 * emit方法需要做的事情：
 *    根据type触发相应的事件
 * 
 * 
 */

const {
  isString,
  isFunction
} = require('./my-utils.js');


class MyEventBus {
  // 构造器
  constructor() {
    // 缓存池
    this.eventPool = {};
  }

  // on事件收集
  /**
   * 
   * @param {*} eventName 事件名称
   * @param {*} eventCallback 事件回调函数
   * @param {*} thisArg this指向
   */
  on(eventName, eventCallback, thisArg = null) {
    // 私有方法，判断缓存池中是否存在eventHandlers
    const _isExistHandlers = () => {
      return this.eventPool[eventName];
    }
    // 判断eventName的合法性
    if (!isString(eventName)) throw new TypeError('eventName type must be string...');
    // 判断eventCallback的合法性
    if (!isFunction(eventCallback)) throw new TypeError('eventCallback type must be function...');
    // 缓存池中不存在该类型的回调函数集合
    if (!_isExistHandlers()) this.eventPool[eventName] = [];
    // 缓存池中存在该类型的回调函数集合,对函数进行保存
    this.eventPool[eventName].push({
      eventCallback,
      thisArg
    });
    // 实现链式调用
    return this;
  }

  // 事件触发
  /**
   * 
   * @param {*} eventName 事件名称 
   * @param  {...any} pyload 执行事件回调函数的参数集合
   */
  emit(eventName, ...pyload) {
    // 私有方法判断是否存在eventName
    const _isExistEventName = () => {
      return this.eventPool[eventName];
    }
    // 判断eventName的合法性
    if (!isString(eventName)) throw new TypeError('eventName type must be string...');
    // 判断eventName中是否存在缓存池中,但是还是要实现链式调用
    if (!_isExistEventName()) return this;
    // 获取handles函数集合
    const handlers = this.eventPool[eventName];
    // 遍历循环执行该事件回调函数
    handlers.forEach(({ eventCallback, thisArg }) => {
      eventCallback.call(thisArg, ...pyload);
    });
    // 实现链式调用
    return this;
  }




  /**
   * 当eventName事件执行的时候，eventCallback只会执行一次。
   * 如果不处理的话，因为eventName事件可能会被收集很多次，自然eventCallback也会执行
   * 很多次，所以我们需要控制eventCallback执行的次数。
   * 
   * 思路也很简单：
   *    我们把eventCallback放入到eventName的函数缓存池中，然后找到该函数，把其删除即可。
   * 
   * 
   * @param {*} eventName 事件名称 
   * @param {*} eventCallback 事件回调函数
   * @param {*} thisArg 事件回调函数内部的this指向
   */
  once(eventName, eventCallback, thisArg) {
    // 判断事件名称类型的合法性
    if (!isString(eventName)) throw new TypeError('eventName type must be string...');
    // 判断事件回调函数的合法性
    if (!isFunction(eventCallback)) throw new TypeError('eventCallback type must be function...');

    const _tempCallback = (...pyload) => {
      // 设置函数只执行一次
      this._once(eventName, _tempCallback, (valid) => {
        valid && eventCallback.apply(thisArg, pyload);
      })
    }

    // 给once需要执行一次的函数添加标记
    Object.defineProperty(_tempCallback, '_once', {
      value: '_once',
      writable: false,
      enumerable: false,
      configurable: false
    });

    return this.on(eventName, _tempCallback, thisArg);
  }


  _once(eventName, onceExecutorFn, callback) {
    const handlers = this.eventPool[eventName];
    // 在回调函数集合中，找到第一个只执行一次的回调函数
    const onceFn = handlers && handlers.find(fn => fn.eventCallback._once);
    callback && callback(onceFn ? true : false);
    this.eventPool[eventName] = this.eventPool[eventName].filter(fn => !fn.eventCallback._once);
  }


  // 关闭事件
  /**
   * 
   * @param {*} eventName 事件名称 
   * @param {*} closeCallback 需要关闭的事件回调函数
   */
  off(eventName, closeCallback) {
    const _isExistEventName = () => {
      return this.eventPool[eventName];
    }
    const _isExistCloseFn = (callback) => {
      const handlers = this.eventPool[eventName];
      if (handlers) {
        const closeFn = handlers.find(fn => fn.eventCallback === closeCallback);
        closeFn && callback(closeFn);
      }
    }
    // 对需要关闭的回调函数进行操作
    const _operationCloseFn = (closeFn) => {
      const handlers = this.eventPool[eventName];
      const newHandlers = handlers.filter(fn => fn.eventCallback !== closeFn.eventCallback);
      this.eventPool[eventName] = newHandlers;
    }

    // 判断事件名称类型的合法性
    if (!isString(eventName)) throw new TypeError('eventName type must be string...');
    // 判断事件回调函数的合法性
    if (!isFunction(closeCallback)) throw new TypeError('eventCallback type must be function...');
    // 判断缓存池中是否存在该类型
    if (!_isExistEventName()) return;
    // 判断缓存池中是否存在需要关闭的函数
    _isExistCloseFn((fn) => {
      _operationCloseFn(fn);
    });
  }

  clear() {
    this.eventPool = {};
  }


  // 判断是否存在事件类型
  hasEvent(type) {
    return Object.keys(this.eventPool).includes(type);
  }

  // 为了方便，我获取一下handlers
  getHandlers() {
    return this.eventPool;
  }
};


module.exports = MyEventBus;
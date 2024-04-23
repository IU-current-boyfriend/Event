const MyEventBus = require('./my-event-bus');
const {
  isObject,
  isAllFunction,
  isFunction,
  stateIncludesStateName,
  stateAllIncludesStateName,
  actionsIncludesActionName,
  isString,
} = require('./my-utils');

/**
 * 事件是如何和响应式数据联系在一起的呢？
 * 1. onState监听state的变化，并且把回调函数利用event收集起来
 * 2. 派发事件，相当于是让action执行，action执行后将改变state
 * 3. state改变之后，将emit触发相应的事件，去执行回调函数。
 */


class MyEventStore {
  constructor(options) {
    // 首先还是需要处理一下参数问题
    // 检查options.state参数的合法性，必须是一个对象形式
    if (!isObject(options.state)) throw new TypeError('the state type must be object...');
    // 检查options.actions参数的合法性，value值必须是函数的形式
    if (!isAllFunction(options.actions)) throw new TypeError('the actions values type must be function...');
    // 设置actions参数
    this.actions = options.actions;
    // 设置state参数
    this.state = options.state;
    // 在设置state参数之后，必须要设置响应式对象
    this._observe(options.state);
    // 设置事件对象,针对于单个state监听使用
    this.event = new MyEventBus();
    // 设置事件对象,针对于多个state监听使用
    this.eventV2 = new MyEventBus();
  }

  // 设置响应式数据
  _observe(state) {
    // 保存this指向
    const _this = this;
    // 循环枚举state对象，设置响应式数据
    Object.keys(state).forEach(key => {
      let _value = state[key];
      Object.defineProperty(state, key, {
        get() {
          // 这里不能直接state[key],会递归死循环,因为state[key]还会触发get函数
          // 需要在外界保存一下当前的值
          // return state[key] x
          return _value;
        },
        set(newValue) {
          // 进行优化, 更新的值相同则无需进行其它操作。
          if (newValue === _value) return;
          // 更新值
          _value = newValue;
          // state更新时,触发相应的事件
          _this.event.emit(key, _value);
          // 多个state更新时,触发相应事件
          _this.eventV2.emit(key, { [key]: _value });
        }
      })
    });
  }

  // 设置state数据变化的监听
  /**
   * onState手动收集依赖的变化，所以callback上来要执行一次，
   * 然后等到state数据变化的时候，再去执行一次。其实这个地方不手动执行一次也行，
   * 不手动执行的话，就等于初次监听的时候，不去执行回调函数。只有当state数据变化的
   * 时候，才会去执行回调函数。
   * @param {*} stateName 数据的名称
   * @param {*} listenerCallBack 监听后需要执行的回调函数
   */
  onState(stateName, listenerCallBack) {
    // 如果stateName不存在state中，抛出异常 
    if (!stateIncludesStateName(stateName, this.state)) throw new TypeError('stateName must be exist state...');
    // 如果listenerCallBack不是函数的形式，抛出异常
    if (!isFunction(listenerCallBack)) throw new TypeError('listenerCallBack type must be function...');
    // 收集事件, this可以传递, 也可以不传递, 传递的话比较好，因为listenerCallBack可以直接在内部访问到store实例对象
    this.event.on(stateName, listenerCallBack, this);
    // 手动执行一次listenerCallBack函数
    listenerCallBack.call(this, this.state[stateName]);
  }


  /**
   * 监听多个state的变化，第一次listenerCallBack执行时value形式是数组
   * 然后，当某个state变化的时候，listenerCallBack内部的value形式是变化的对象
   * @param {*} stateNames 
   * @param {*} listenerCallBack 
   */
  onStates(stateNames, listenerCallBack) {
    const resultState = [];
    // stateNames是数组的形式，名称必须都要存在于数组中，否则抛出异常
    if (!stateAllIncludesStateName(stateNames, this.state)) throw new TypeError('stateName must be all exist state...');
    // 如果listenerCallBack不是函数的形式，抛出异常
    if (!isFunction(listenerCallBack)) throw new TypeError('listenerCallBack type must be function...');
    // 收集事件，this可以传递，也可以不传递
    stateNames.forEach((stateName, index) => {
      this.eventV2.on(stateName, listenerCallBack, this);
      resultState.push(this.state[stateName]);
    });
    // 手动执行一次listenerCallBack函数, [resultState]这样写，不然参数丢失了
    listenerCallBack.apply(this, [resultState]);
  }


  // 关闭单个数据监听的变化
  offState(stateName, offCallback) {
    if (!isString(stateName)) throw new TypeError('off stateName type must be string...');
    if (!stateIncludesStateName(stateName, this.state)) throw new TypeError('off stateName type must includes state...');
    if (!isFunction(offCallback)) throw new TypeError('offCallback type must be function...');
    // 取消事件的监听
    this.event.off(stateName, offCallback);
  }

  // 关闭多个数据监听的变化
  offStates(stateKeys, offCallback) {
    if (!Array.isArray(stateKeys)) throw new TypeError('stateNames type must be Array');
    if (!isFunction(offCallback)) throw new TypeError('offCallback type must be function...');
    if (!stateAllIncludesStateName(stateKeys, this.state)) throw new TypeError('off stateName type must includes state...');
    // 取消事件的监听
    stateKeys.forEach(stateName => {
      this.eventV2.off(stateName, offCallback);
    });
  }


  // 更新数据
  setState(stateName, stateValue) {
    if (!stateIncludesStateName(stateName, this.state)) throw new TypeError('setStateName type must be includes state...');
    this.state[stateName] = stateValue;
  }

  // 派发事件
  /**
   * 调用action方法，派发行为。
   * @param {*} actionName 需要派发的行为名称
   */
  dispatch(actionName, ...pyload) {
    // 保存this指向
    const _this = this;
    if (!actionsIncludesActionName(actionName, this.actions)) throw new TypeError('dispatch actionName must be exist actions...');
    // 在构造器函数中，已经校验过actions的值是函数形式
    this.actions[actionName].apply(_this, pyload);
  }
}

module.exports = MyEventStore;
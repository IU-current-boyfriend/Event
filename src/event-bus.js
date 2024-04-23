class HYEventBus {
  constructor() {
    this.eventBus = {}
  }

  // 监听事件
  on(eventName, eventCallback, thisArg) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }

    let handlers = this.eventBus[eventName]
    if (!handlers) {
      handlers = []
      this.eventBus[eventName] = handlers
    }

    handlers.push({
      eventCallback,
      thisArg
    })
    return this
  }

  // 当事件执行的时候，只执行一次eventCallback
  // 因为事件可能被多次收集
  once(eventName, eventCallback, thisArg) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }

    const tempCallback = (...payload) => {
      this.off(eventName, tempCallback)
      eventCallback.apply(thisArg, payload)
    }

    return this.on(eventName, tempCallback, thisArg)
  }

  // 触发事件
  emit(eventName, ...payload) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    const handlers = this.eventBus[eventName] || []
    handlers.forEach(handler => {
      handler.eventCallback.apply(handler.thisArg, payload)
    })
    return this
  }

  // 关闭事件
  off(eventName, eventCallback) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }

    const handlers = this.eventBus[eventName]
    if (handlers && eventCallback) {
      const newHandlers = [...handlers]
      for (let i = 0; i < newHandlers.length; i++) {
        const handler = newHandlers[i]
        if (handler.eventCallback === eventCallback) {
          const index = handlers.indexOf(handler)
          handlers.splice(index, 1)
        }
      }
    }

    if (handlers.length === 0) {
      delete this.eventBus[eventName]
    }
  }

  // 清空事件
  clear() {
    this.emitBus = {}
  }

  // 判断是否存在事件
  hasEvent(eventName) {
    return Object.keys(this.emitBus).includes(eventName)
  }
}

module.exports = HYEventBus

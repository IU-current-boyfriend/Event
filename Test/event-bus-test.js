const { HYEventBus, MYEventBus } = require('../src');
const MyEventBus = require('../src/my-event-bus');

const eventBus = new HYEventBus();

const myEventBus = new MYEventBus();

const whyCallback1 = (...payload) => {
  console.log("whyCallback1:", payload)
}

const whyCallback2 = (...payload) => {
  console.log("whyCallback2:", payload)
}

const lileiCallback1 = (...payload) => {
  console.log("lileiCallback1:", payload)
}

// eventBus.on("why", whyCallback1)
// eventBus.on("why", whyCallback2)
// eventBus.on('lilei', lileiCallback1)

myEventBus.on('why', whyCallback1);
myEventBus.on('why', whyCallback2);
// myEventBus.on('lilei', lileiCallback1);


// setTimeout(() => {
//   myEventBus.emit('why', 'abc', 'cba', 'nba');
//   // myEventBus.emit('lilei', 'abc', 'cba', 'nba');
// }, 1000);

// myEventBus.once('why', (...pyload) => {
//   console.log('once: =>', pyload);
// })

// console.log('hasEvent: =>', myEventBus.hasEvent('why'));

myEventBus.once("why", (...payload) => {
  console.log("why once:", payload)
})

myEventBus.emit('why', 'acb', 'cba', 'nba');

// eventBus.once('why', (...pyload) => {
//   console.log('why once:', pyload);
// })

// eventBus.emit('why', 'abc', 'cba', 'nba');

// setTimeout(() => {
//   eventBus.emit("why", "abc", "cba", "nba")
//   // eventBus.emit("lilei", "abc", "cba", "nba")
// }, 1000);


// setTimeout(() => {
//   myEventBus.off("why", whyCallback1)
//   myEventBus.off("lilei", lileiCallback1)
// }, 2000);

// setTimeout(() => {
//   myEventBus.emit("why")
//   myEventBus.emit("lilei")
// }, 3000);


// setTimeout(() => {
//   eventBus.off("why", whyCallback1)
//   eventBus.off("lilei", lileiCallback1)
// }, 2000);

// setTimeout(() => {
//   eventBus.emit("why")
//   eventBus.emit("lilei")
// }, 3000);

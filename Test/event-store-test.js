const { HYEventStore, MyEventStore } = require("../src")
const axios = require('axios')

// const eventStore = new HYEventStore({
//   state: {
//     name: "why",
//     friends: ["abc", "cba", "nba"],
//     banners: [],
//     recommends: []
//   },
//   actions: {
//     getHomeMultidata(ctx) {
//       console.log(ctx)
//       axios.get("http://123.207.32.32:8000/home/multidata").then(res => {
//         const banner = res.data.data.banner
//         const recommend = res.data.data.recommend
//         // 赋值
//         ctx.banners = banner
//         ctx.recommends = recommend
//       })
//     }
//   }
// })

const eventStore = new MyEventStore({
  state: {
    name: "why",
    friends: ["abc", "cba", "nba"],
    banners: [],
    recommends: []
  },
  actions: {
    getHomeMultidata() {
      axios.get("http://123.207.32.32:8000/home/multidata").then(res => {
        const banner = res.data.data.banner
        const recommend = res.data.data.recommend
        // 赋值
        this.state.banners = banner;
        // this.state.recommends = recommend
        this.state.name = '聪';
      })
    }
  }
})



// const eventStore = new HYEventStore({
//   state: {
//     name: "why",
//     friends: ["abc", "cba", "nba"],
//     banners: [],
//     recommends: []
//   },
//   actions: {
//     getHomeMultidata() {
//       axios.get("http://123.207.32.32:8000/home/multidata").then(res => {
//         const banner = res.data.data.banner
//         const recommend = res.data.data.recommend
//         // 赋值
//         this.state.banners = banner;
//         // this.state.recommends = recommend
//         this.state.name = '聪';
//       })
//     }
//   }
// })


// const callback = (value) => {
// console.log('监听name、banners', value);
// }

// eventStore.onStates(['name', 'banners'], callback);

// eventStore.offStates(['name', 'banners'], callback);

eventStore.onState('name', (value) => {
  console.log('name的监听: =>', value);
});

eventStore.setState('name', '聪');


// // 数据监听，单个数据监听
// eventStore.onState("name", nameCallback);

// // 停止单个数据的监听
// eventStore.offState('name', nameCallback);


// eventStore.onState("banners", (value) => {
//   console.log("监听banners:", value)
// });

// // 事件派发
// eventStore.dispatch("getHomeMultidata");

// eventStore.onState("recommends", (value) => {
//   console.log("监听recommends", value)
// })

// 数据监听，多个数据监听
// eventStore.onStates(['name', 'banners'], (value) => {
//   console.log('监听多个数据', value); // value数组类型['聪', []];
// });

// eventStore.dispatch("getHomeMultidata");

// // 同时监听多个数据
// eventStore.onStates(["name", "friends"], (value) => {
//   console.log("监听多个数据:", value) // 数组类型
// })

// // 数据变化
// setTimeout(() => {
//   eventStore.setState("name", "lilei")
//   eventStore.setState("friends", ["kobe", "james"])
// }, 1000);

// eventStore.dispatch("getHomeMultidata")

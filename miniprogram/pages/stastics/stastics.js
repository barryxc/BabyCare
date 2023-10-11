const {
  getRecentDate,
  weekDay,
  dateInMonth
} = require("../../service/date");
const {
  getIcon,
  isFeed
} = require("../../service/eventlist");
const {
  callServer
} = require("../../service/server");
const {
  getSelectedChild,
  eventBus
} = require("../../service/user");

// pages/stastics/stastics.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectIndex: 0,
    color: "#7A7E83",
    selectedColor: "#c8c8ff",
    cache: [],
    statstics: [],
    dates: [], // 日期数据
    dateSelectIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let dates = [];
    for (let day = -30; day <= 0; day++) {
      let date = getRecentDate(day);
      let weekOfDay = weekDay(date, 'YYYY-MM-DD');
      let dateIn = dateInMonth(date);
      dates.push({
        weekOfDay,
        date,
        dateInMonth: dateIn,
      })
    }
    this.setData({
      dates
    })
    this.setData({
      dateSelectIndex: this.data.dates.length - 1,
    })
    this.refresh();
    eventBus.on('childChange', (data) => {
      this.refresh();
    });

    eventBus.on('addRecord', (res) => {
      console.log("监听新增的记录")
      this.refresh();
    });
    eventBus.on('deleteRecord', (res) => {
      console.log("监听删除记录")
      this.refresh();
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    };

  },

  //当前选中的日期
  getSelectDate() {
    return this.data.dates[this.data.dateSelectIndex];
  },

  refresh() {
    let date = this.getSelectDate().date;
    callServer({
      type: 'selectRecord',
      day: date,
      childId: getSelectedChild().childId
    }).then((res) => {
      let data = res.result.data;
      let map = {};
      if (data) {
        for (const item of data) {
          let key = item.type;
          let value = map[item.type];
          if (!value) {
            value = {
              name: item.event,
              percent: 1,
              icon: getIcon(item.type),
              count: 0,
              desc: '',
              showProgress: true,
              feed: 0
            };
            map[key] = value;
          }
          value.count += 1;
          value.feed += item.feed; //todo
          value.desc = `总计${value.count}次`;
          value.percent = value.count;
          if (isFeed(key)) {
            value.desc = (value.feed + 'ml/' + value.desc)
          }
        }
      }
      let stats = [];
      if (map) {
        Object.keys(map).forEach((key) => {
          console.log(key + ': ', map[key]);
          stats.push(map[key])
        })
      }
      this.setData({
        statstics: stats,
      })
      wx.stopPullDownRefresh();
    }).catch(e => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onBindChange(e) {
    console.log(e);
    let index = e.detail.current;
    this.setData({
      selectIndex: index,
    })
  },
  changePage(e) {
    let index = e.target.dataset.index;
    this.setData({
      selectIndex: index,
    })
  },
  swiperChange: function (e) {
    this.setData({
      currentIndex: e.detail.current
    });
  },
  selectDate(e) {
    let index = e.currentTarget.dataset.index;
    if (this.data.dateSelectIndex == index) {
      return
    }
    this.setData({
      dateSelectIndex: index
    })
    let date = this.data.dates[index].date;
    console.log(date)
    this.refresh();
  },
  //开始滑动
  onDragStart(e) {
    let scrollLeft = e.detail.scrollLeft;
    console.log("onDragStart:" + scrollLeft);
  },

  //滑动结束
  onDragEnd(e) {
    let scrollLeft = e.detail.scrollLeft;
    console.log("onDragEnd:" + scrollLeft);
    // console.log(scrollLeft);
    this.setData({
      scrollLeft: scrollLeft
    })
  }
})
const {
  daysAfter,
  weekDay,
  dateInMonth,
  currentDate,
  fomartTimeChinese,
  parseTime
} = require("../../service/date");
const {
  getIcon,
  isFeed,
  isFeedWithBottle,
  isFeedWithBreast,
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
    selectedColor: "#ff80ca",

    //日期
    date: currentDate(),
    statstics: [],

    //loading效果
    loading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let dates = [];
    let weeks = [];
    for (let day = -34; day <= 0; day++) {
      let date = daysAfter(day);
      let weekOfDay = weekDay(date, 'YYYY-MM-DD');
      let dateIn = dateInMonth(date);
      dates.push({
        weekOfDay,
        date,
        dateInMonth: dateIn,
      })
      if (dates.length == 7) {
        weeks.push(dates);
        dates = [];
      }
    }
    let length = weeks.length - 1;
    this.setData({
      weeks,
      dates: weeks[length],
    })
    this.setData({
      dateSelectIndex: this.data.dates.length - 1,
    })
    this.fetchRemoteData();
    eventBus.on('childChange', (data) => {
      this.fetchRemoteData();
    });

    eventBus.on('updateUi', (res) => {
      this.fetchRemoteData();
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

  //显示loading效果
  showloading(show) {
    this.setData({
      loading: show,
    })
  },

  //页面刷新
  fetchRemoteData() {
    let date = this.data.date;
    if (!date) {
      return
    }
    this.showloading(true)
    callServer({
      type: 'selectRecord',
      date: date,
      childId: getSelectedChild().childId
    }).then((res) => {
      this.showloading(false)
      let data = res.result.data;
      let map = {};
      if (data) {
        for (const item of data) {
          let key = item.type;
          //喂养
          if (isFeed(key)) {
            key = item.feedType;
          }
          let value = map[item.type];
          if (!value) {
            value = {
              name: item.event,
              percent: 1,
              icon: getIcon(item.type),
              count: 0,
              desc: '',
              showProgress: true,
              feed: parseInt(0),
            };
            map[key] = value;
          }
          value.count += 1;
          if (isFeedWithBottle(key)) {
            value.name="瓶喂"
            value.feed = Number(item.volume ? item.volume : 0) + Number(value.feed)
          }
          if (isFeedWithBreast(key)) {
            value.name=item.feedTitle
            value.feed = fomartTimeChinese(item.leftTime+item.rightTime+parseTime(value.feed?value.feed:'00:00:00'),true) ;
          }
          value.desc = `总计${value.count}次`;
          value.percent = value.count;
          if (isFeedWithBottle(key)) {
            value.desc = (value.feed + 'ml/' + value.desc)
          }
          if (isFeedWithBreast(key)) {
            value.desc = (value.feed + '/' + value.desc)
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
      wx.hideLoading();
      wx.stopPullDownRefresh();
    }, () => {
      wx.stopPullDownRefresh();
      this.showloading(false)
    }).catch(e => {
      console.error(e);
      wx.stopPullDownRefresh();
      this.showloading(false)
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
    this.fetchRemoteData();
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

  //切换页面
  onBindChangePage(e) {
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

  //日期切换
  onDateChange(e) {
    let date = e.detail.date;
    this.setData({
      date
    })
    this.fetchRemoteData()
  }

})
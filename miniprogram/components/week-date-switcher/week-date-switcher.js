const {
  weekDay,
  dateInMonth,
  getRecentDate
} = require("../../service/date");

// components/week-date-switcher/week-date-switcher.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    days: 5,

    color: "#7A7E83",
    selectedColor: "#ff80ca",
    weeks: [], //周
    dates: [], // 日期数据
    dateSelectIndex: 0, //选中的索引
  },

  lifetimes: {
    ready() {
      let dates = [];
      let weeks = [];
      for (let day = -29; day <= 0; day++) {
        let date = getRecentDate(day);
        let weekOfDay = weekDay(date, 'YYYY-MM-DD');
        let dateIn = dateInMonth(date);
        dates.push({
          weekOfDay,
          date,
          dateInMonth: dateIn,
        })
        if (dates.length == this.data.days) {
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
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //选中日期
    selectDate(e) {
      let index = e.currentTarget.dataset.index;
      if (this.data.dateSelectIndex == index) {
        return
      }
      this.setData({
        dateSelectIndex: index
      })
      let date = this.data.dates[index].date;
      console.log('选中日期', date)
      this.triggerEvent("onChange", {
        dateSelectIndex: index,
        date,
      })
    },

    //左右滑动切换
    onWeekScroll(e) {
      let index = e.detail.current;
      let dates = this.data.weeks[index];

      let lastIndex = this.data.days - 1;
      let selectDate = dates[lastIndex].date;

      this.setData({
        dates,
        dateSelectIndex: lastIndex
      })

      this.triggerEvent("onChange", {
        dateSelectIndex: lastIndex,
        date: selectDate
      })
    }
  }
})
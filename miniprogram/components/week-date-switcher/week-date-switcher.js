const {
  weekDay,
  dateInMonth,
  daysAfter,
  currentDate,
  diffDays,
  monthOfDate
} = require("../../service/date");

// components/week-date-switcher/week-date-switcher.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: String,
      value: currentDate(),
    },

    start: {
      type: String,
      value: daysAfter(-59)
    },

    end: {
      type: String,
      value: currentDate()
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    days: 5, //展示几天
    color: "#7A7E83",
    selectedColor: "#ff80ca",

    weeks: [], //周
    dates: [], // 日期数据

    weekIndex: -1, //周索引
    dateSelectIndex: -1, //日期的索引
  },

  observers: {
    //监听日期变化
    "value": function (data) {
      let weeks = this.data.weeks;
      this.setWeekIndexAndDateIndex(weeks, data);
    }
  },



  lifetimes: {
    attached() {
      //构造数据
      let dates = [];
      let weeks = [];
      let diffs = diffDays(this.data.end, this.data.start);

      for (let day = diffs; day <= 0; day++) {
        let date = daysAfter(day);
        let weekOfDay = weekDay(date, 'YYYY-MM-DD');
        let dateIn = dateInMonth(date);
        let month = monthOfDate(date);
        dates.push({
          weekOfDay,
          date,
          dateInMonth: dateIn,
          month,
        })

        if (dates.length == this.data.days) {
          weeks.push(dates);
          dates = [];
        }
      }
      this.setData({
        weeks,
      })
      this.setWeekIndexAndDateIndex(weeks, this.data.value);
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //更新
    setWeekIndexAndDateIndex(weeks, data) {
      if (weeks && weeks.length > 0) {
        weeks.forEach((dates, weekIndex) => {
          dates.forEach((date, dateIndex) => {
            if (date.date == data) {
              this.setData({
                weekIndex,
                dates,
                dateSelectIndex: dateIndex,
              })
            }
          });
        });
      }
    },
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
        value: date
      })
    },

    //左右滑动切换
    onWeekScroll(e) {
      let index = e.detail.current;
      let dates = this.data.weeks[index];

      //设置 value 的情况下，不需要选择最后一个
      if (this.data.dates == this.data.weeks[index]) {
        return
      }

      let lastIndex = this.data.days - 1;
      let selectDate = dates[lastIndex].date;

      this.setData({
        dates,
        dateSelectIndex: lastIndex
      })

      this.triggerEvent("onChange", {
        dateSelectIndex: lastIndex,
        date: selectDate,
        value: selectDate
      })
    }
  }
})
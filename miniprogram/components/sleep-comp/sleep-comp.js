const {
  format,
  formatMillis,
} = require("../../service/date");

// components/sleep-comp/sleep-comp.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    record: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    startTime: Date.now(),
    endTime: "",

    startTimeFormat: format(Date.now()),
    endTimeFormat: "熟睡中...",

    costTimeText: "00:00",
    sleepStatus: ""
  },

  lifetimes: {
    attached() {
      let record = this.data.record;
      this.setData({
        startTime: Date.now(),
        ...record,
        confirmText: record.recordId ? "修改" : "保存"
      })
    }
  },
  observers: {
    'startTime': function (data) {
      this.setData({
        startTimeFormat: format(data),
      })
      this.calcSleepTime();
    },

    'endTime': function (data) {
      if (!data) {
        return
      }
      let endTimeFormat = format(data)
      this.setData({
        endTimeFormat
      })
      this.calcSleepTime();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    onSleeping() {
      this.setData({
        costTimeText: "00:00",
        endTime: "",
        endTimeFormat: "熟睡中...",
      })
    },

    calcSleepTime() {
      if (this.data.endTime) {
        this.updateCostTime();
      }
    },

    updateCostTime() {
      console.log("update");
      if (this.data.startTimeFormat > this.data.endTimeFormat) {
        return
      }
      let endTime = this.data.endTime;
      let startTime = this.data.startTime;

      let costTimeText = formatMillis(endTime - startTime, "HH:mm");
      this.setData({
        costTimeText
      })
    },

    bindreset() {
      this.triggerEvent('cancel')
    },
    //保存
    bindsubmit(e) {
      console.log(e)
      let sleepStatus = "sleeping";
      if (!this.data.endTime) {
        sleepStatus = 'sleeping';
      } else {
        sleepStatus = 'wake';
      }

      this.setData({
        sleepStatus,
      })

      if (sleepStatus == 'wake' && (this.data.endTimeFormat) < (this.data.startTimeFormat)) {
        wx.showToast({
          title: '结束时间小于开始时间',
          icon: "none"
        })
        return
      }


      this.triggerEvent('submit', {
        ...this.data,
        //有结束时间按照结束时间算，没有按照开始时间算
        date: format(this.data.endTime ? this.data.endTime : this.data.startTime, 'YYYY-MM-DD'),
        time: format(this.data.endTime ? this.data.endTime : this.data.startTime, "HH:mm"),
      })
    }
  }
})
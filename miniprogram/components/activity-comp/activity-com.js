const {
  format,
  oneHourAgo,
  minutesAgo
} = require("../../service/date")

// components/activity-comp/activity-com.js
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
    activities: [{
      name: "看绘本"
    }, {
      name: "画画"
    }, {
      name: "听故事"
    }],
    activity: "",
    selectIndex: -1,

    startTime: oneHourAgo(),
    startTimeFormat: format(minutesAgo(10)),
    endTime: Date.now(),
    endTimeFormat: format(Date.now()),

    content: "",
    imgSrc: "",
  },

  lifetimes: {
    attached() {
      let record = this.data.record;
      let confirmText = (record.recordId ? "修改" : "保存")
      this.setData({
        startTime: minutesAgo(10),
        endTime: Date.now(),
        ...record,
        confirmText,
      })
    },
  },


  observers: {
    'startTime': function (data) {
      this.setData({
        startTimeFormat: format(data),
      })
    },
    'endTime': function (data) {
      this.setData({
        endTimeFormat: format(data),
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindreset() {
      this.triggerEvent('cancel')
    },
    bindsubmit(e) {
      if (this.data.selectIndex === -1) {
        wx.showToast({
          title: '未选中活动',
          icon: "error"
        })
        return
      }

      if (this.data.endTime < this.data.startTime) {
        wx.showToast({
          title: '结束时间小于开始时间',
          icon: 'error'
        })
        return
      }

      this.triggerEvent('submit', {
        ...this.data,

        activity: this.data.activities[this.data.selectIndex],
        date: format(this.data.endTime, 'YYYY-MM-DD'),
        time: format(this.data.endTime, "HH:mm"),
      })
    },

    onChange(e) {
      let index = e.detail.index;
      let data = e.detail.data;
      this.setData({
        selectIndex: index,
        activity: data,
      })
    },
    onItemsChanged(e) {
      let data = e.detail;
      this.setData({
        activities: data,
      })
    },
    selectImg() {
      // 让用户选择一张图片
      wx.chooseImage({
        count: 1,
        success: chooseResult => {
          this.setData({
            imgSrc: chooseResult.tempFilePaths[0]
          });
        },
        fail: res => {
          console.log(res.errMsg);
        }
      });
    },
  }
})
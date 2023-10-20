const {
  format
} = require("../../service/date")

// components/weight-height-comp/weight-height-comp.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    record: {}, //编辑传递进来的数据
  },

  /**
   * 组件的初始数据
   */
  data: {
    headcircum: "",
    height: "",
    weight: "",
    content: "",
    dateTime: Date.now(), //时间戳
    dateTimeFormat: format(Date.now()),

  },

  observers: {
    "dateTime": function (data) {
      this.setData({
        dateTimeFormat: format(data),
      })
    },
    "height": function (data) {
      if (isNaN(data)) {
        wx.showToast({
          title: '身高输入不合法',
          icon: 'none'
        })
      }
    },
    "headcircum": function (data) {
      if (isNaN(data)) {
        wx.showToast({
          title: '头围输入不合法',
          icon: 'none'
        })
      }
    },
    "weight": function (data) {
      if (isNaN(data)) {
        wx.showToast({
          title: '体重输入不合法',
          icon: 'none'
        })
      }
    },
  },

  lifetimes: {
    attached: function () {
      let record = this.data.record;
      if (record && Object.keys(record).length > 0) {
        this.setData({
          ...record,
        })
      }

      this.setData({
        comfirmText: record.recordId ? "修改" : "保存"
      })

    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindsubmit(e) {
      if (!this.data.weight && !this.data.headcircum && !this.data.height) {
        return
      }
      if (this.data.weight && isNaN(this.data.weight)) {
        wx.showToast({
          title: '体重不合法',
          icon: "none"
        })
        return
      }
      if (this.data.height && isNaN(this.data.height)) {
        wx.showToast({
          title: '身高不合法',
          icon: "none"
        })
        return
      }
      if (this.data.headcircum && isNaN(this.data.headcircum)) {
        wx.showToast({
          title: '头围不合法',
          icon: "none"
        })
        return
      }
      this.triggerEvent('submit', {
        ...this.data,
        date: format(this.data.dateTime, 'YYYY-MM-DD'),
        time: format(this.data.dateTime, 'HH:mm'),
      })
    },
    bindreset(e) {
      this.triggerEvent('cancel')
    },

  }
})
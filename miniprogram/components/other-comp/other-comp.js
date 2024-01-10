const {
  format
} = require("../../service/date")

// components/other-comp/other-comp.js
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
    dateTime: Date.now(),
    dateTimeFormat: format(Date.now()),
    content: "",
    selectIndex: -1,
    activity: "",
    data: [{
      name: "AD药剂"
    },{
      name: "洗澡澡"
    },{
      name: "游泳"
    },]
  },

  lifetimes: {
    attached() {
      let record = this.data.record;
      this.setData({
        dateTime: Date.now(),
        ...record,
        comfirmText: record.recordId ? "修改" : "保存"
      })
    }
  },

  observers: {
    'dateTime': function (data) {
      this.setData({
        dateTimeFormat: format(data, 'YYYY-MM-DD HH:mm')
      })
    },
    'selectIndex': function (data) {
      console.log("selectIndex", data)
      if (this.data.selectIndex == -1) {
        this.setData({
          activity: "",
        })
      } else {
        this.setData({
          activity: this.data.data[data],
        })
      }

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindsubmit(e) {
      if (this.data.selectIndex === -1) {
        wx.showToast({
          title: '未选中自定义内容',
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

    onItemsChanged(e) {
      let data = e.detail;
      this.setData({
        data
      })
    },

    //事件切换
    onChange(e) {
      let index = e.detail.index;
      let data = e.detail.data;
      this.setData({
        selectIndex: index,
        activity: data
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
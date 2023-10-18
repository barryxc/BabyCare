const {
  format
} = require("../../service/date")

// components/food-comp/food-comp.js
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
    units: [' ', "毫升", '克', '个', '颗', '粒', '勺', '杯', '碗', '根', '块'],
    volume: "",
    data: [{
      name: "玉米🌽"
    }],

    selectIndex: -1,
    //辅食
    solidFood: "",
    imgSrc: '',
    content: "",
    unit: "",
    unitIndex: 0
  },

  lifetimes: {
    attached(){
      let record = this.data.record;
      this.setData({
        dateTime: Date.now(),
        unit: this.data.units[this.data.unitIndex],
        ...record,
      })
    },
  },
  observers: {
    'dateTime': function (data) {
      console.log('数据监听', data);
      this.setData({
        dateTimeFormat: format(data),
      })
    },
    "unitIndex": function (data) {
      console.log('unit change event', data);
      this.setData({
        unit: this.data.units[data],
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
    //保存
    bindsubmit(e) {
      if (this.data.selectIndex === -1) {
        wx.showToast({
          title: '未选中辅食',
          icon: "error"
        })
        return
      }
      let item = {
        ...this.data,
        
        date: format(this.data.dateTime, 'YYYY-MM-DD'),
        time: format(this.data.dateTime, "HH:mm"),
      }

      this.triggerEvent('submit', item)
    },

    //切换辅食
    onChange(e) {
      let index = e.detail.index;
      let data = e.detail.data;
      this.setData({
        selectIndex: index,
        solidFood: data,
      })
    },

    //辅食变化了
    onItemsChanged(e) {
      let data = e.detail;
      this.setData({
        data,
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